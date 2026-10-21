---
title: "HttpWebSever概述"
date: 2022-03-11T13:09:16+08:00
url: "/2022/03/11/httpwebsever/"
draft: false
tags: ["Linux 内核"]
---
根据游双老师的Linux高性能服务器编程做的一个轻量级Linux服务器，项目地址[GitHub](https://github.com/wangbi0912/light_web_server)



### 1、项目概述

**基于Linux的轻量级服务器**，主要目的是学习巩固APUE、UNP卷1、UNP卷2的知识。

- 使用**线程池+epoll+Reactor事件模式(Proactor)**的并发模型
- 使用**有限状态机(FSM)**解析HTTP请求报文
- 经过Webbench压力测试能够实现C10K的并发连接

#### 1.1 工作流程

服务器首先创建一个监听`socket`为`listen_fd`，并添加到epoll事件表中，浏览器向服务器发起请求连接，首先进行TCP三次握手，服务端监测到`listen_fd`有事件发生，服务端`accept`阻塞后返回一个新的`socket_fd`，并继续添加到内核事件表中。

- **Reactor：**若`epoll_wait`返回的为`socket_fd`，主线程将其插入到工作队列，通知线程池处理（读写请求，接受新连接），**通常由同步I/O实现**



![Reactor](https://i.loli.net/2020/05/29/9DlXZPUygOrHbE2.png)

- **Proactor：**主线程和内核负责读写数据接受请求，然后将解析后的请求插入到工作队列，由线程池负责业务逻辑，**通常由异步I/O实现**

![Proactor](https://i.loli.net/2020/05/29/lvdktpU5xYXwPTg.png)

> **也可以使用同步I/O模拟Proactor模式，提高服务器并发性能**

1. 主线程往epoll内核事件表注册socket上的读就绪事件。
2. 主线程调用epoll_wait等待socket上有数据可读
3. 当socket上有数据可读，epoll_wait通知主线程,主线程从socket循环读取数据，直到没有更多数据可读，然后将读取到的数据封装成一个请求对象并插入请求队列。
4. 睡眠在请求队列上某个工作线程被唤醒，它获得请求对象并处理客户请求，然后往epoll内核事件表中注册该socket上的写就绪事件
5. 主线程调用epoll_wait等待socket可写。
6. 当socket上有数据可写，epoll_wait通知主线程。主线程往socket上写入服务器处理客户请求的结果。
