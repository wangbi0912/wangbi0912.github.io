---
title: "单例模式线程安全问题"
date: 2022-04-07T20:35:45+08:00
url: "/2022/04/07/单例模式线程安全问题/"
draft: false
tags: ["C/C++"]
---
## 单例模式
单例模式的实现分为懒汉和饿汉两种实现方法
- **懒汉模式：第一次用到该实例才初始化。**
- **饿汉模式：实例创建即初始化。**

>单例模式注意事项：构造函数设置为`private`；拷贝构造和`operator=`使用`c++11`的默认函数控制`=delete`（这种默认函数控制只能使用在默认构造、拷贝构造，operator=当中）；类内的静态变量只能类内声明类外定义。


***
### 饿汉实现
饿汉实现较为简单，给出代码
```c++
#include <iostream>
#include <pthread.h>
#include <memory>
#include <unistd.h>

using namespace std;


class Singleton {
 private:
    Singleton() {
        cout << "constructor" << endl;
    }
    Singleton(const Singleton& other) = delete;
    Singleton& operator= (const Singleton& other) = delete;
    // static Singleton* m_interface;
    static shared_ptr<Singleton> m_interface;

 public:
    ~Singleton() {
        cout << "deconstructor" << endl;
    }
    static shared_ptr<Singleton> get_interface() {
        return m_interface;
    }
};

shared_ptr<Singleton> Singleton::m_interface = shared_ptr<Singleton>(new Singleton());

void* worker(void* args) {
    cout << "sleep" << endl;
    shared_ptr<Singleton> ptr = Singleton::get_interface();
    return NULL;
}

int main(int argc, char const *argv[])
{
    pthread_t m_thread[5];
    for(int i = 0; i < 5; i++) {
        pthread_create(m_thread+i, NULL, worker, NULL);
        pthread_detach(m_thread[i]);
    }
    pthread_exit(NULL);
    return 0;
}
```
由于饿汉模式直接在使用该单例之前就初始化了该静态成员变量
```c++
shared_ptr<Singleton> Singleton::m_interface = shared_ptr<Singleton>(new Singleton());
```
所以不需要判断是否为`nullptr`，所以也没有**线程安全**的问题，对于内存泄漏的问题，使用`shared_ptr`进行资源释放。
***
### 懒汉实现
基础实现方法：
```c++
/*
有缺陷的懒汉式单例模式，会有线程安全和内存泄漏问题
*/

#include <iostream>
#include <pthread.h>
#include <memory>
#include <unistd.h>

using namespace std;

//有缺陷的懒汉模式
class Singleton {
 private:
    Singleton() {
        cout << "constructor" << endl;
    }
    Singleton(const Singleton& other) = delete;
    Singleton& operator= (const Singleton& other) = delete;
    static Singleton* m_interface;
    // static shared_ptr<Singleton> m_interface;

 public:
    ~Singleton() {
        cout << "deconstructor" << endl;
    }
    static Singleton* get_interface() {
        //这一步并不是线程安全的
        if(m_interface == nullptr) {
            sleep(1);
            m_interface = new Singleton();
        }
        return m_interface;
    }
};

//静态成员变量只能类内声明类外定义
Singleton* Singleton::m_interface = nullptr;

void* worker(void* args) {
    Singleton* interface = Singleton::get_interface();
    return NULL;
}

int main(int argc, char const *argv[])
{
    pthread_t m_thread[5];
    for(int i = 0; i < 5; i++) {
        pthread_create(m_thread+i, NULL, worker, NULL);
        pthread_detach(m_thread[i]);
    }
    pthread_exit(NULL);
    return 0;
}
```
这里我设置了五个线程，在回调函数里创建单例，由于对于线程竞争资源冲突现象不明显，加上了个`sleep(1)`，运行结果如下：
```cmd
root@iZuf6ccxsb4mprtz1c1mx2Z:~/Linux/DesignPattern/Singleton# ./Singleton_lazy_bad 
constructor
constructor
constructor
constructor
constructor
```
问题很明显，五个线程分别创建了一个单例，这是完全错误的，而且只有构造没有析构。造成了内存泄漏。

#### 改进
对于线程安全问题，采用互斥锁来确保线程安全，**单例模式中使用双检锁（DCL）**；
>*为什么用DCL的一些个人理解*
>首先使用锁的目的就是保证`if(m_interface == null) m_interface = new Singleton();`这两个语句原子化（类似），但是在创建一个单例之后`m_interface != nullptr`，就无需每次都加锁，提高性能。

对于内存泄漏问题，使用智能指针解决。
```c++
/*
比较完美的懒汉式单例模式
使用锁解决了线程安全问题
使用智能指针解决内存泄漏问题
*/
#include <iostream>
#include <pthread.h>
#include <memory>
#include <unistd.h>
using namespace std;


pthread_mutex_t m_mutex;
int res = pthread_mutex_init(&m_mutex, NULL);

class Singleton {
 private:
    Singleton() {
        cout << "constructor" << endl;
    }
    Singleton(const Singleton& other) = delete;
    Singleton& operator= (const Singleton& other) = delete;
    // static Singleton* m_interface;
    static shared_ptr<Singleton> m_interface;


 public:
    ~Singleton() {
        cout << "deconstructor" << endl;
    }
    static shared_ptr<Singleton> get_interface() {

        //使用双检锁DCL
        if(m_interface == nullptr) {
            sleep(1);
            pthread_mutex_lock(&m_mutex);
            if(m_interface == nullptr) {
                m_interface = shared_ptr<Singleton>(new Singleton);
            }
            pthread_mutex_unlock(&m_mutex);
        }
        return m_interface;
    }
};

shared_ptr<Singleton> Singleton::m_interface(nullptr);

void* worker(void* args) {
    shared_ptr<Singleton> interface = Singleton::get_interface();
    return NULL;
}

int main(int argc, char const *argv[])
{
    pthread_t m_thread[5];
    for(int i = 0; i < 5; i++) {
        pthread_create(m_thread+i, NULL, worker, NULL);
        pthread_detach(m_thread[i]);
    }
    pthread_exit(NULL);
    return 0;
}
```
运行结果如下，只创建一个单例，而且成功析构。
```cmd
root@iZuf6ccxsb4mprtz1c1mx2Z:~/Linux/DesignPattern/Singleton# ./Singleton_lazy_good 
constructor
deconstructor
```

最后还有一种基于c++11的`magic static`特性的懒汉实现，这里就不介绍了。
