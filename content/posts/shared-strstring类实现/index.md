---
title: "shared_str、String类实现"
date: 2022-05-11T19:54:46+08:00
url: "/2022/05/11/shared-strstring类实现/"
draft: false
tags: ["C/C++"]
---
实现`shared_ptr`和`String`类，分析`shared_ptr`线程安全问题。



## 一、`shared_ptr`使用方法

使用该智能指针（或者其他两种）需要导入头文件`#include <memory>`
* 创建空指针
```c++
std::shared_ptr<int> p1;             //不传入任何实参
std::shared_ptr<int> p2(nullptr);    //传入空指针 nullptr
```
* 明确指向
```c++
std::shared_ptr<int> p3(new int(10));
std::shared_ptr<int> p4 = make_shared<int>(10);  //推荐使用make_shared<T>构造
```
* 拷贝构造
```c++
std::shared_ptr<int> p3(new int(10));
std::shared_ptr<int> p5(p3);
```
除此之外还可以对`shared_ptr`赋值，通过重写`operator=`实现。**需要注意**，对于`p1=p2`（均为智能指针）这种，`p2`所指对象由于被`p1`指向，所以该引用计数会加一，`p1`原本指向的资源的引用计数会减一。这也会引出下面关于`shared_ptr`指针的**线程安全**问题。
***
## 二、实现
```c++
//存在问题：引用计数不增加

//已解决：重载()函数换成拷贝构造函数

#include <bits/stdc++.h>
using namespace std;

template <class T>
class mShared_ptr {
private:
    T* _ptr;
    int* _refcount;
public:
    mShared_ptr() : _ptr(new T()), _refcount(new int(0)) {}

    mShared_ptr(T* obj) : _ptr(obj), _refcount(new int(1)) {}

    ~mShared_ptr() {
        --(*_refcount);
        if(_ptr && (*_refcount) == 0) {
            delete _ptr;
            delete _refcount;
        }
    }

    mShared_ptr (const mShared_ptr& _other) {
        ++*_other._refcount;
        cout << "_ref : " << *_other._refcount << endl;
        this->_ptr = _other._ptr;
        this->_refcount = _other._refcount;
    }

    mShared_ptr& operator= (const mShared_ptr& _other) {
        if(_other == *this)
            return *this;
        --*(this->_refcount);
        if(this->_ptr && *(this->_refcount) == 0) {
            delete this->_ptr;
            delete this->_refcount;
        }
        ++*_other._refcount;
        cout << "_ref : " << *_other._refcount << endl;
        this->_ptr = _other._ptr;
        this->_refcount = _other._refcount;
        return *this;
    }

    T& operator* () {
        return *_ptr;
    }

    T* operator-> () {
        return _ptr;
    }
    int get_refcount() {
        return *(this->_refcount);
    }

};

int main(int argc, char const *argv[])
{
    mShared_ptr<int> obj(new int(10));
    mShared_ptr<int> obj2 = obj;
    mShared_ptr<int> obj3(obj);

    cout << *obj << endl;
    cout << *obj2 << endl;
    cout << *obj3 << endl;
    cout << obj.get_refcount() << endl;
    cout << obj2.get_refcount() << endl;
    cout << obj3.get_refcount() << endl;
    return 0;
}
```
运行结果如下：
```cmd
root@iZuf6ccxsb4mprtz1c1mx2Z:~/Linux/Test/DataStructure# ./mShared_ptr 
_ref : 2
_ref : 3
10
10
10
3
3
3
```
这里实现的还有一些问题，因为`shared_ptr`源码中关于引用计数是**原子操作**，不需要考虑资源使用冲突的问题，可以在自己实现的时候加锁。
***
## 三、关于`shared_ptr`的线程安全问题
首先什么是线程安全？
简单来说就是**多个线程操作一个共享数据，都能按照预期的行为进行，无论多个线程的运行次序如何交织。**

对于`shared_ptr`，其内部有两个变量，引用计数和真正的对象类型指针。其中引用计数是原子操作，所以**对于`shared_ptr`的读操作是线程安全的。**

但是对于`shared_ptr`中赋值如`ptr1 = ptr2`，需要两个步骤，**1、`ptr1`的内部对象指针`Obj1`替换成`ptr2`内部对象`Obj2`指针；2、`ptr1`的对于`Obj1`的引用计数缓存`Obj2`的引用计数。**

这两步并不是原子的，如果一个线程需要对`shared_ptr`进行赋值操作`ptr1 = ptr2`，刚完成第一步，就切换到其他线程又对ptr2进行操作，如`ptr2 = ptr3`，就有可能造成析构了引用计数。而继续之前线程的第二步，就会出错。

**总之：对于`shared_ptr`的读操作是线程安全的。
对于`shared_ptr`读写操作不是线程安全的，需要加锁。**
***
tips：为什么`shared_ptr`的引用计数能够同步到不同的指针中？

有人回答可能使用的是static变量，这是不可能的，因为一个类中只有一个静态变量，只能记录对于一个对象的引用次数，这在包含两个`shared_ptr`以上的程序中是不可行的。
个人认为是引用计数是用指针实现的，指向一个记录引用次数的对象。

***

## 四、String类实现

## String和strcpy函数
```cpp
//实现string类
#include <bits/stdc++.h>
using namespace std;

class mString {
private:
    char* _data;

public:
    mString(const char* str = nullptr) {
        if(str != nullptr) {
            _data = new char[strlen(str) + 1];
            strcpy(_data, str);
        } else {
            _data = new char[1];
            *_data = '\n';
        }
    }

    mString(const mString& str) {
        _data = new char[strlen(str._data) + 1];
        strcpy(_data, str._data);
    }

    mString& operator= (const mString& str) {
        if(this->_data == str._data) {
            return *this;
        }
        delete[] this->_data;
        this->_data = new char[strlen(str._data) + 1];
        strcpy(this->_data, str._data);
        return *this;
    }

    ~mString() {
        delete[] _data;
    }
    char* data() {
        return this->_data;
    }
};

int main(int argc, char const *argv[])
{
    mString str1("woshinidie");
    mString str2(str1);
    mString str3 = str1;
    for(int i = 0; i < 10; i++) {
        cout << str1.data()[i] << " ";
    }
    cout << endl;
    for(int i = 0; i < 10; i++) {
        cout << str2.data()[i] << " ";
    }
    cout << endl;
    for(int i = 0; i < 10; i++) {
        cout << str3.data()[i] << " ";
    }
    cout << endl;
    return 0;
}
```
```cpp
//实现strcpy函数
#include <bits/stdc++.h>
using namespace std;

char* mStrcpy(char* dest, const char* source) {
    if(!dest || !source)
        return nullptr;
    while((*dest++ = *source++) != '\0') {};
    return dest;
}

int main(int argc, char const *argv[])
{
    char s2[20] = "fashdfk";
    char* s1 = new char[strlen(s2) + 1];
    mStrcpy(s1, s2);

    for(int i = 0; i < 20; i++) {
        cout << s1[i] << " ";
    }
    return 0;
}
```
