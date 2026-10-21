---
title: "手撕-KMP、堆排序、快排"
date: 2022-03-26T15:42:33+08:00
url: "/2022/03/26/手撕-kmp堆排序快排/"
draft: false
tags: ["数据结构与算法"]
---
> 经典算法手撕



## KMP算法

kmp算法的核心就是求`next`数组，即最长公共前后缀个数数组。
比如对于文本串`string s = "aabaabaaf"`，模式串`string t = "aabaaf"`，若要暴力检测的话，遍历到`s[5] != t[5]`，需要重新回到`s[1]`和`t[0]`重新遍历，但是若有一个数组记录最长公共前后缀的话，可以倒退到`s[next[5-1]+1]`即继续匹配`s[5]`和`t[2]`；如下图。[图源：卡哥](https://www.programmercarl.com/0028.实现strStr.html)
![](https://upload-images.jianshu.io/upload_images/27610647-445a75f6e75deb5a.gif)


求next数组
```c++
void m_next(string& str, vector<int>& next) {
    int j = -1;
    next[0] = j;
    for(int i = 1; i < str.size(); i++) {
        while(j >= 0 && str[i] != str[j+1]) {
            j = next[j];  
        }
        if(str[i] == str[j+1]) {
            j++;
        }
        next[i] = j;
    }
}
```
求出`next`数组之后就可以进行模式匹配了
```c++
//return value : start index of s.str(T)
int kmp(string & str, string& t) {
    vector<int> next(t.size());
    m_next(t, next);
    int j = -1;
    for(int i = 0; i < str.size(); i++) {
        while(j >= 0 && s[i] != t[j+1]) {
            j = next[j];
        }
        if(s[i] == t[j+1]) {
            j++;
        }
        if(j == t.size()-1) {
            return i - t.size() + 1;
        }
    }
    return -1;
}
```
***
## 堆排序
堆分为大顶堆和小顶堆，如图所示，即根节点是最大或者最小值。
![](https://upload-images.jianshu.io/upload_images/27610647-e3c284bf915c85ab.png)
对于数组`vector<int> nums = {7, 3, 9, 4, 6, 1, 5, 2, 8};`，若要降序输出，首先需要将该数组构造成一个小顶堆，结果为`9 8 7 4 6 1 5 2 3 `，然后交换`nums[0]`和`nums[nums.size()-1]`，继续构造小顶堆，如此循环。
注意：初始化构造小顶堆时，需要从第一个非叶子结点向上构造，即：
```c++
void heapify(vector<int>& nums, int start, int index);
void heap_sort(vector<int>& nums) {
    //第一次构造小顶堆
    for(int i = (nums.size()/2)-1; i >= 0; i--) {
        heapify(nums, i, nums.size()-1);
    }
    //构造小顶堆之后继续排序
    for(int i = nums.size()-1; i >0; i--) {
        //交换根节点和未排序的最后一个元素
        swap(nums[0], nums[i]);
        heapify(nums, 0, i-1);
    }
}
```
`heapify`的实现🌟🌟🌟🌟🌟
```c++
void heapify(vector<int>& nums, int start, int index) {
	int father = start;
	int son = 2*father + 1;
	while(son <= index) {
		if(son <= index - 1 && nums[son] > nums[son + 1])
			son++;
		if(nums[son] < nums[father])
			swap(nums[son], nums[father]);
		else
			return;
		father = son;
		son = 2*father + 1;
	}
}
```
***
## 优先队列
C++中实现了`template <class T, class Container = vector<T>,
  class Compare = less<typename Container::value_type> > class priority_queue;`这个STL，需要使用头文件`#include <queue>`

具体用法为`class T`是保存的参数类型，`class Container = vector<T>`是堆中储存元素的容器，默认是`vector<T>`，`class Compare = less<typename Container::value_type>`是堆的比较函数，默认是`less<T>`即小顶堆，也可以使用`greater<int>`构造大顶堆。

**注意，优先队列队首元素为`que.top()`不是`que.front()`**
- 具体用法
```c++
#include<iostream>
#include <queue>
using namespace std;

int main(int argc, char const *argv[])
{
	priority_queue<int, vector<int>, greater<int>> que;
	que.push(5);
	que.push(8);
	que.push(1);
	que.push(9);
	que.push(2);
	while(!que.empty()) {
		cout << que.top() << " ";
		que.pop();
	}
	return 0;
}
```
构造的是大顶堆，然后堆排序，**构造出的元素为队列头部为最小值。**
输出为
```cmd
wang@Wangs-MacBook-Pro test_cpp % ./priority_queue 
1 2 5 8 9 %              
```

- **自定义比较类**
以`pair<int, int>`举例子，将队列中按照`pair.first`降序排列
```c++
#include <iostream>
#include <queue>
using namespace std;

//自定义比较类
struct cmp {
	bool operator() (pair<int, int>& a, pair<int, int>& b) {
		return a.first < b.first;
	}
};

int main(int argc, char const *argv[])
{
	priority_queue<pair<int, int>, vector<pair<int, int>>, cmp> que;
	que.push(make_pair(1,0));
	que.push(make_pair(8,0));
	que.push(make_pair(7,0));
	que.push(make_pair(2,0));
	que.push(make_pair(3,0));
	while(!que.empty()) {
		cout << que.top().first << " ";
		que.pop();
	}
	return 0;
}
```
输出
```cmd
wang@Wangs-MacBook-Pro test_cpp % ./priority_queue
8 7 3 2 1 %   
```
***
## 快排
```cpp
#include <iostream>
#include <algorithm>
#include <vector>
#include <cstdlib>
#include <time.h>

using namespace std;

int partition(vector<int>& nums, int left, int right);

void quick_sort(vector<int>& nums, int left, int right) {
	if(left >= right)
		return;
	int pivotPosition = partition(nums, left, right);
	quick_sort(nums, left, pivotPosition - 1);
	quick_sort(nums, pivotPosition + 1, right);
}
int partition(vector<int>& nums, int left, int right) {
	srand((unsigned)time(NULL));
	int rand_num = left + (rand()%(right-left));
	cout << "rand_num: " << rand_num << endl;
	swap(nums[left], nums[rand_num]);
	int pivot = nums[left];
	while(left < right) {
		while(left < right && nums[right] >= pivot)
			right--;
		swap(nums[left], nums[right]);
		while(left < right && nums[left] <= pivot)
			left++;
		swap(nums[left], nums[right]);
	}
	return left;
}


int main(int argc, char const *argv[])
{
	vector<int> nums = {77,7,7,7,7,6, 3, 9, 4, 6, 1, 5, 2, 8};
	for(auto& num : nums) {
		cout << num << " ";
	}
	cout << endl;
	quick_sort(nums, 0, nums.size()-1);
	for(auto& num : nums) {
		cout << num << " ";
	}
	return 0;
}
```
