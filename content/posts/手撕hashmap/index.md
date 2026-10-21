---
title: "手撕HashMap"
date: 2022-04-15T15:01:23+08:00
url: "/2022/04/15/手撕hashmap/"
draft: false
tags: ["C/C++"]
---
***
## HashMap不完整实现，大概意思是这样



```cpp
/*
* @author Bi Wang
* @version 创建时间：2022-3-18
* 说明：本程序实现了一个HashMap。
* 功能：使用开链法解决Hash冲突，实现了查找、插入、删除功能。
*/
#ifndef HASHMAP_H
#define HASHMAP_H


template<class Key, class Value>
class HashNode {
private:
    Key _key;
    Value _value;
    HashNode* next;

public:
    HashNode(Key key, Value Value):_key(key), _value(value), next(nullptr) {
    }
    ~HashNode(){};

    //重载赋值函数
    HashNode& operator=(const HashNode& node) {
        _key = node._key;
        _value = node._value;
        next = node.next;
        return *this;
    }
};

template<class Key, class Value, class HashFunc, class EqualKey>
class HashMap
{
private:
    unsigned int _size;
    HashFunc hash;
    EqualKey equal;
    HashNode<Key, Value> ** hash_table;
    Value valueNUll;
public:
    HashMap(const unsigned int size));
    ~HashMap();
    bool insert(const Key& key, const Value& value);
    bool del(const Key& key);
    Value& find(const Key& key);
};

//构造
template<class Key, class Value, class HashFunc, class EqualKey>
HashMap<Key, Value, HashFunc, EqualKey>::HashMap(const unsigned int size) : 
_size(size), hash(), equal() {
    hash_table = new HashNode<Key, Node>*[_size];
    for(unsigned int i = 0; i < _size; i++) {
        hash_table[i] = nullptr;
    }
}

//析构
template<class Key, class Value, class HashFunc, class EqualKey>
HashMap<Key, Value, HashFunc, EqualKey>::~HashMap() {
    for(unsigned int i = 0; i < _size; i++) {
        HashNode<Key, Value>* cur = hash_table[i];
        while(cur) {
            HashNode<Key, Value>* temp = cur;
            delete temp;
            cur = cur->next;
        }
    }
    delete[] hash_table;
}

//插入
template<class Key, class Value, class HashFunc, class EqualKey>
bool HashMap<Key, Value, HashFunc, EqualKey>::insert(const Key& key, const Value& value) {
    unsigned int index = hash(key)%_size;
    HashNode<Key, Value>* node = new HashNode<Key, Value>(key, value);
    node->next = hash_table[index];
    hash_table[index] = node;
    return true;
}

//删除
template<class Key, class Value, class HashFunc, class EqualKey>
bool HashMap<Key, Value, HashFunc, EqualKey>::del(const Key& key) {
    unsigned int index = hash(key)%_size;
    HashNode<Key, Value>* node = hash_table[index];
    HashNode<Key, Value>* prev = nullptr;
    prev -> next = node;
    while (node) {
        if(node -> _key == key) {
            prev -> next = node -> next;
            delete node;
            return true;
        }
        node = node -> next;
        prev = prev -> next;
    }
    return false;
}

//查找
template<class Key, class Value, class HashFunc, class EqualKey>
Value& HashMap<Key, Value, HashFunc, EqualKey>::find(const Key& key) {
    unsigned int index = hash(key)%_size;
    HashNode<Key, Value>* node = hash_table[index];
    if(!node)   return valueNUll;
    while(node) {
        if(node -> _key == key)
            return node -> _value;
        node = node -> next;
    }
}

//哈希函数
// class HashFunc
// {
// public:
//     int operator()(const unsigned int & key )
//     {
//         int hash = 0;
//         for(int i = 0; i < key.length(); ++i)
//         {
//             hash = hash << 7 ^ key[i];
//         }
//         return (hash & 0x7FFFFFFF);
//     }
// };

//比较函数，上面实现的哈希表默认是数值类型，不需要比较函数
// class EqualKey
// {
// public:
//     bool operator()(const string & A, const string & B)
//     {
//         if (A.compare(B) == 0)
//             return true;
//         else
//             return false;
//     }
// };

#endif
```
