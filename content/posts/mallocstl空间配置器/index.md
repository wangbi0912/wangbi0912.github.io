---
title: "malloc、STL空间配置器"
date: 2022-06-19T16:36:22+08:00
url: "/2022/06/19/mallocstl空间配置器/"
draft: false
tags: ["C/C++"]
---
> malloc一直是困惑我好久的事情，今天记录一下。


```c++
/*源码描述
  The main properties of the algorithms are:
  * For large (>= 512 bytes) requests, it is a pure best-fit allocator,
    with ties normally decided via FIFO (i.e. least recently used).
  * For small (<= 64 bytes by default) requests, it is a caching
    allocator, that maintains pools of quickly recycled chunks.
  * In between, and for combinations of large and small requests, it does
    the best it can trying to meet both goals at once.
  * For very large requests (>= 128KB by default), it relies on system
    memory mapping facilities, if supported.
*/
```
* `malloc`工作原理
  1. `malloc`开始搜索空闲内存块，如果能找到一块大小合适的就分配出去
  2. 如果`malloc`找不到一块合适的空闲内存，那么调用brk等系统调用扩大堆区从而获得更多的空闲内存（这里使用`brk`还是`mmap`取决于申请的大小）
  3. `malloc`调用`brk`后开始转入内核态，此时操作系统中的虚拟地址系统开始工作，扩大进程的堆区，操作系统并没有为此分配真正的物理内存
  4. `brk`执行结束后返回到`malloc`，从内核态切换到用户态，`malloc`找到一块合适的空闲内存后返回
  5. 进程拿到内存，继续干活。
  6. 当有代码读写新申请的内存时系统内部出现缺页中断，此时再次由用户态切换到内核态，操作系统此时真正的分配物理内存，之后再次由内核态切换回用户态，程序继续。
***
* SGI STL空间配置器

考虑到小型区块可能造成内存碎片问题，SGI 采用两级配置器，第一级配置器直接使用 `malloc()` 和 `free()`实现；第二级配置器使用 memory pool 内存池管理。

第二级配置器的原理：
 * 当配置区块超过 128 bytes，就使用第一级配置器
* 当配置区块小于 128 bytes，使用内存池管理

```c++
enum {_ALIGN = 8};  // 小型区块的上调边界
enum {_MAX_BYTES = 128}; // 小区区块的上限
enum {_NFREELISTS = 16}; // _MAX_BYTES/_ALIGN  free-list 的个数

// free-list 的节点结构，降低维护链表 list 带来的额外负担
union _Obj {
    union _Obj* _M_free_list_link;  // 利用联合体特点
    char _M_client_data[1];    /* The client sees this. */
};
static _Obj* __STL_VOLATILE _S_free_list[_NFREELISTS];  // 注意，它是数组，每个数组元素包含若干相等的小额区块
```
其中 `free-list `是指针数组，16 个数组元素，就是 16 个 `free-list`，各自管理大小分别为 8， 16， 24， 32，...128 bytes(8 的倍数)的小额区块。

小额区块的结构体 union _Obj 使用链表连接起来。如图所示：
![](https://upload-images.jianshu.io/upload_images/27610647-53a735a6284192db.png)


配置器负责配置，同时也负责回收。
