---
title: "模版方法模式"
date: 2022-03-15T19:52:44+08:00
url: "/2022/03/15/模版方法模式/"
draft: false
tags: ["设计模式"]
---
***

#### 模版方法（Template Method）模式



在面向对象系统的设计中，对于某一个业务逻辑在不同的对象下实现细节不一样，但是逻辑框架相同，可以使用模版方法模式。

普通实现中，某一业务逻辑需要按照顺序执行`fun1`～`fun4`，其中`fun2`和`fun3`在对象A和B中实现不相同，代码逻辑如下：

```c++
class Base {
public:
  base(){};
  virtual ~base(){};
  void fun1(){};
  virtual fun2() = 0;
  virtual fun3() = 0;
  void fun4(){};
};

class A : public Base{
public:
  A(){};
  ~A(){};
  void fun2() {
    //实现细节
  }
  void fun3() {
    //实现细节
  }
  //业务逻辑
  void run(){
    fun1();
    fun2();
    fun3();
    fun4();
  }
};

class B : public Base{
public:
  B(){};
  ~B(){};
  void fun2() {
    //不同的实现细节
  }
  void fun3() {
    //不同的实现细节
  }
  //业务逻辑
  void run(){
    fun1();
    fun2();
    fun3();
    fun4();
  }
};
```

这种实现方式破坏了**依赖倒置原则（DIP）**，即程序要依赖于抽象接口，而不是具体实现，所以高层（基类）应该提供接口用于不同的低层（子类）实现，控制权交给父类。

使用模版方法模式代码框架如下，有基类`Base`，负责业务逻辑框架的函数`void run()`：

```c++
class Base {
public:
  Base(){};
  virtual ~Base(){};
  void fun1() {};
  virtual void fun2() = 0;
  virtual void fun3() = 0;
  void fun4() {};
  //业务逻辑
  void run(){
    fun1();
    fun2();
    fun3();
    fun4();
  }
};

class A : public Base{
public:
  A(){};
  ~A(){};
  void fun2() {
    //实现细节
  }
  void fun3() {
    //实现细节
  }
};

class B : public Base{
public:
  B(){};
  ~B(){};
  void fun2() {
    //不同的实现细节
  }
  void fun3() {
    //不同的实现细节
  }
};

int main(int argc, char* argv[]) {
  //实现1
  Base* obj1 = new A;
  obj1 -> run();
  //实现2
  Base* obj2 = new B;
  obj2 -> run();
  return 0;
}
```

这里对于不同的业务实现A和B，高层都提供了两个接口（虚函数），逻辑交给了高层，利用了多态性和晚绑定。

***
