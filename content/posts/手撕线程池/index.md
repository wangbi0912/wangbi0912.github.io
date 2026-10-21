---
title: "手撕线程池"
date: 2022-01-22T20:51:03+08:00
url: "/2022/01/22/手撕线程池/"
draft: false
tags: ["C/C++"]
---
## 线程池Threadpool简单实现



作为web服务器实现高并发的基本组件之一，单独用I/O多路复用很可能会导致后续请求阻塞，但是不断创建线程和销毁线程会增加性能开销，于是采用线程池从工作队列抢占任务。

```cpp
#include <bits/stdc++.h>

using namespace std;

template<typename T>
class threadpool {
public:
	threadpool(int thread_num = 5, int max_request = 10000);
	~threadpool();
	bool add(T* request);

	static void* worker(void* arg);
	void concreateWork();

private:
	int m_thread_num;
	int m_max_requests;
	pthread_t* m_thread_arr;
	queue<T> m_workqueue;
	bool m_stop;

	locker m_locker;
	sem m_stat;

};

template<typename T>
threadpool<T>::threadpool(int thread_num = 5, int max_request = 10000) 
: m_thread_num(thread_num), m_max_requests(max_request), m_stop(false), m_thread_arr(nullptr) {
	m_thread_arr = new pthread_t[m_thread_num];
	for(int i = 0; i < m_thread_num; i++) {
		//work必须为静态成员函数
		pthread_create(m_thread_arr + i, NULL, worker, this)；
		pthread_detach(m_thread_arr[i]);
	}
}

template<typename T>
threadpool<T>::~threadpool() {
	delete[] m_thread_arr;
}

template<typename T>
bool threadpool<T>::add(T* request) {
	m_locker.lock();
	if(m_workqueue.size() > m_max_requests) {
		m_locker.unlock();
		return false;
	}
	m_workqueue.push_back(request);
	m_workqueue.unlock();
	m_stat.post();
	return true;
}

template<typename T>
void* threadpool<T>::worker(void* arg) {
	threadpool* work = (threadpool*) arg;
	work -> concreateWork();
	return work;
}

template<typename T>
void threadpool<T>::run() {
	m_stat.wait();
	m_locker.lock();
	T* cur_request = m_workqueue.front();
	m_workqueue.pop_front();
	m_locker.unlock();

	cur_request->process();
}

//封装互斥锁
class locker {
private:
	pthread_mutex_t m_mutex = PTHREAD_MUTEX_INITIALIZER;
public:
	locker() {
		if(pthread_mutex_init(&mutex, NULL) != 0)
			throw exception();
	}
	~locker() {
		pthread_mutex_destory(&m_mutex);
	}
	void lock() {
		return pthread_mutex_lock(&m_mutex);
	}
	void unlock() {
		return pthread_mutex_unlock(&m_mutex);
	}
};
//封装信号量
class sem {
private:
	sem_t m_sem;
public:
	sem() {
		sem_init(&m_sem, 0, 0);
	}
	sem(int num) {
		sem_init(&m_sem, 0, num);
	}
	~sem() {
		sem_destory(&m_sem);
	}
	void post() {
		sem_post(&m_sem);
	}
	void wait() {
		sem_eait(&m_sem);
	}
};
```
***
