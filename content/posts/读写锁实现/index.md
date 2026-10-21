---
title: "读写锁实现"
date: 2022-05-08T14:36:30+08:00
url: "/2022/05/08/读写锁实现/"
draft: false
tags: ["C/C++"]
---
### 使用互斥锁和条件变量实现读写锁



代码
```cpp
class rw_lock {
 private:
    int stat;   //0 : 无锁，-1 : 写锁， >0 : 读锁的数量
    pthread_mutex_t mutex;  
    pthread_cond_t cond;  
    
 public:
    rw_lock() : stat(0) {
        pthread_mutex_init(&mutex, NULL);
        pthread_cond_init(&cond, NULL);
    }

    ~rw_lock() {}

    void rdlock() {
        pthread_mutex_lock(&mutex);
        while (stat < 0) {
            pthread_cond_wait(&cond, &mutex);
        }
        ++stat;
        pthread_mutex_unlock(&mutex);
    }

    void rwunlock() {
        pthread_mutex_lock(&mutex);
        --stat;
        if (stat == 0)
            pthread_cond_signal(&cond);
        pthread_mutex_unlock(&mutex);
    }

    void wrlock() {
        pthread_mutex_lock(&mutex);
        while (stat > 0) {
            pthread_cond_wait(&cond, &mutex);
        }
        --stat;
        pthread_mutex_unlock(&mutex);
    }

    void wrunlock() {
        pthread_mutex_lock(&mutex);
        ++stat;
        pthread_cond_signal(&cond);
        pthread_mutex_unlock(&mutex);
    }
};
```
