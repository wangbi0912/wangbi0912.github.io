---
title: "工厂模式"
date: 2022-03-10T15:22:52+08:00
url: "/2022/03/10/工厂模式/"
draft: false
tags: ["设计模式"]
---
## 工厂方法和抽象工厂



### 工厂方法
**定义一个创建对象的接口，让子类决定创建哪一个类。**
![](https://upload-images.jianshu.io/upload_images/27610647-074107ba6bb3cf98.jpg)
代码如下：
```c++
#include <bits/stdc++.h>
using namespace std;


class Product {
public:
    virtual ~Product() {}
protected:
    Product() {}
};

class concreteProductA : public Product {
public:
    concreteProductA() {
        cout << "create concreteProductA" <<endl;
    }
    virtual ~concreteProductA() {}
};

class concreteProductB : public Product {
public:
    concreteProductB() {
        cout << "create concreteProductB" <<endl;
    }
    virtual ~concreteProductB() {}
};

class Factory {
public:
    Factory() {}
    virtual ~Factory() {}
    virtual Product* creatFactory() = 0;
};

class createProductA : public Factory {
public:
    Product* creatFactory() {
        return new concreteProductA;
    }
};

class createProductB : public Factory {
public:
    Product* creatFactory() {
        return new concreteProductB;
    }
};


int main(int argc, char const *argv[])
{
    Factory* fac1 = new createProductA();
    Factory* fac2 = new createProductB();
    cout << "**********" << endl;
    Product* proA = fac1->creatFactory();
    Product* proB = fac2->creatFactory();
    return 0;
}
```
工厂模式实现比较简单，但是工厂模式对于对象的创建仅仅局限于一个类（即Product是一个类），若要为不同的类实现对象创建的接口，需要使用**抽象工厂模式**
***
### 抽象工厂
结构图如下：
![](https://upload-images.jianshu.io/upload_images/27610647-7616d064968cd7fc.jpg)
抽象工厂可以创建多个抽象产品类，比如说一个游戏种野怪有三种难度，共十个野怪，那么对于玩家开始游戏，就需要实例化三十个类创建野怪，这时候可以选择抽象工厂方式，将难度分为三种，解决一组相关或依赖的对象。
代码结构如下：
```c++
#include <bits/stdc++.h>
using namespace std;

//抽象产品A和B
class ProductA {
public:
    virtual ~ProductA() {}
};

class ProductB {
public:
    virtual ~ProductB() {}
};

class concreteProductA1 : public ProductA{
public:
    concreteProductA1() {
        cout << "create concreteProductA1" <<endl;
    }
};
class concreteProductA2 : public ProductA {
public:
    concreteProductA2() {
        cout << "create concreteProductA2" <<endl;
    }
};
class concreteProductB1 : public ProductB {
public:
    concreteProductB1() {
        cout << "create concreteProductB1" <<endl;
    }
};
class concreteProductB2 : public ProductB {
public:
    concreteProductB2() {
        cout << "create concreteProductB2" <<endl;
    }
};

//抽象工厂
class Factory {
public:
    Factory() {}
    virtual ~Factory() {}
    virtual ProductA* creatFactoryA() = 0;
    virtual ProductB* creatFactoryB() = 0;
};

//实例化工厂，生成类型1的产品 A1和B1
class createProduct1 : public Factory {
public:
    ProductA* creatFactoryA() {
        return new concreteProductA1();
    }
    ProductB* creatFactoryB() {
        return new concreteProductB1();
    }
};

//实例化工厂，生成类型2的产品 A2和B2
class createProduct2 : public Factory {
public:
    ProductA* creatFactoryA() {
        return new concreteProductA2();
    }
    ProductB* creatFactoryB() {
        return new concreteProductB2();
    }
};

int main(int argc, char const *argv[])
{
    Factory* fac1 = new createProduct1();
    Factory* fac2 = new createProduct2();
    ProductA* A1 = fac1 -> creatFactoryA();
    ProductB* B1 = fac1 -> creatFactoryB();
    ProductA* A2 = fac2 -> creatFactoryA();
    ProductB* B2 = fac2 -> creatFactoryB();
    return 0;
}
```
可以把A、B想象成野怪，1、2想象成难度，如果玩家选择难度2，直接使用一个工厂`createProduct2`即可。
***
**注意：一定要区分工厂方法和抽象工厂！！！**
