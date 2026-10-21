---
title: "缓存淘汰策略-LRU、LFU"
date: 2022-04-06T20:22:14+08:00
url: "/2022/04/06/缓存淘汰策略-lrulfu/"
draft: false
tags: ["数据结构与算法"]
---
LRU和LFU简单实现



#### 1. LRU（最近最少使用缓存）

> 力扣146题
```c++
struct Node {
    int key, val;
    Node* prev;
    Node* next;
    Node(int x, int y) : key(x), val(y), prev(nullptr), next(nullptr) {};
};

class DoubleList {
private:
    Node* head = new Node(0, 0);
    Node* tail = new Node(0, 0);
    int size = 0;
public:
    DoubleList() {
        head -> next = tail;
        tail -> prev = head;
    }

    void push_back(Node* l_node) {
        l_node -> next = tail;
        l_node -> prev = tail -> prev;
        tail -> prev -> next = l_node;
        tail -> prev = l_node;
        size++;
    }

    void remove(Node* l_node) {
        l_node -> prev -> next = l_node -> next;
        l_node -> next -> prev = l_node -> prev;
        l_node -> prev = nullptr;
        l_node -> next = nullptr;
        size--;
    }

    Node* removeFirst() {
        if(head -> next == tail)
            return nullptr;
        Node* First = head -> next;
        remove(First);
        
        return First;
    }

    int List_size() {
        return size;
    }
};

class LRUCache {
private:
    int capacity;
    unordered_map<int, Node*> map;
    DoubleList dlist;
    
public:
    LRUCache(int capacity) : capacity(capacity){
    }
    
    int get(int key) {
        auto it = map.find(key);
        if(it == map.end())
            return -1;
        Node* temp = map[key];
        dlist.remove(temp);
        dlist.push_back(temp);
        return temp -> val;
    }
    
    void put(int key, int value) {
        auto it = map.find(key);
        if(it != map.end()) {
            Node* temp = map[key];
            temp -> val = value;
            dlist.remove(temp);
            dlist.push_back(temp);
            return;
        }
        if(dlist.List_size() == capacity) {
            Node* first = dlist.removeFirst();
            map.erase(map.find(first -> key));
        }
        Node* x = new Node(key, value);
        map.emplace(key, x);
        dlist.push_back(x);
    }
};

/**
 * Your LRUCache object will be instantiated and called as such:
 * LRUCache* obj = new LRUCache(capacity);
 * int param_1 = obj->get(key);
 * obj->put(key,value);
 */
```

***

#### 2. LFU（最不经常使用缓存）
> 力扣460题
```c++
class Solution {
private:
    unordered_map<int, int> key2val;
    unordered_map<int, int> key2freq;
    unordered_map<int, list<int>> freq2keys;
    int minFreq = 0;
public:
    void increaseFreq(int key) {
        int freq = key2freq[key];
        key2freq[key]++;
        freq2keys[freq].remove(key);
        if(freq2keys[freq].empty()) {
            freq2keys.erase(freq);
            if(freq == this->minFreq)
                this->minFreq++;
        }
        freq2keys[freq+1].push_front(key);
    }
    
    void removeMinfreqKey() {
        int key = freq2keys[this->minFreq].back();
        freq2keys[this->minFreq].pop_back();
        if(freq2keys[this->minFreq].empty()) {
            freq2keys.erase(this->minFreq);
        }
        key2val.erase(key);
        key2freq.erase(key);
    }
    
    vector<int> LFU(vector<vector<int> >& operators, int k) {
        vector<int> res;
        int size = 0;
        for(auto oper : operators) {
            if(oper[0] == 2) {
                auto it = key2val.find(oper[1]);
                if(it == key2val.end()) {
                    res.push_back(-1);
                } else {
                    res.push_back(it->second);
                    increaseFreq(oper[1]);
                }
            } else if(oper[0] == 1) {
                auto it = key2val.find(oper[1]);
                if(it != key2val.end()) {
                    key2val[oper[1]] = oper[2];
                    increaseFreq(oper[1]);
                } else {
                    if(size == k) {
                        removeMinfreqKey();
                        size--;
                    }
                    key2val[oper[1]] = oper[2];
                    key2freq[oper[1]] = 1;
                    freq2keys[1].push_front(oper[1]);
                    this->minFreq = 1;
                    size++;
                }
            }
        }
        return res;
    }
};
```
