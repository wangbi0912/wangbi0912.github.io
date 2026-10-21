---
title: "图论基础"
date: 2021-09-16T11:04:23+08:00
url: "/2021/09/16/图论基础/"
draft: false
tags: ["数据结构与算法"]
---
### 文章对应的题目
797 所有可能的路径（M）



***
图基本的实现方式分为**邻接表**和**邻接矩阵**
* 邻接表：把每一个节点`x`的邻居都存到一个列表里，然后把`x`和这个列表关联起来，就可以通过一个节点`x`找到其所有相邻节点。
* 邻接矩阵：是一个`bool`数组，例如`matrix[n][n]`，例如节点`x`和`y`是相连的，则`matrix[x][y]`就为`true`，若需要找x的邻居，遍历一遍`matrix[x]`即可。

对于**图的遍历**，和多叉树类似
```cpp
void traverse(GraphNode* root) {
    if(root == nullptr)  return;
    for(auto child : root -> child) {
        traverse(child);
    }
}
```
但是对于有环图，会陷入死循环，这时候可以添加一个`visited`数组
```cpp
//记录被遍历过的节点
vector<bool> visited(graph.size());
void traverse(GraphNode* root) {
    if(root == nullptr || visited[root])  return;
    visited[root] == true;
    for(auto child : root -> child) {
        traverse(child);
    }
}
```
***
### 797 所有可能的路径
题目如下：
![](https://upload-images.jianshu.io/upload_images/27610647-6de8816f86e87ace.png)
解法很简单，以`0`为起点遍历图，同时记录遍历过的路径，当遍历到终点时将路径记录下来即可。而且由于是无向图，所以不需要`visited`数组。
代码如下（图的遍历）：
```cpp
class Solution {
public:
    vector<vector<int>> res;
    vector<int> path;
    vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {
        traverse(graph, 0);
        return res;
    }
    void traverse(vector<vector<int>>& graph, int s) {
        path.push_back(s);
        int size = graph.size();
        if(s == size - 1) {
            res.push_back(path);
            path.pop_back();
            return;
        }
        for(int i : graph[s]) {
            traverse(graph, i);
        }
        path.pop_back();
    }
};
```
***
### Reference
[图论基础 :: labuladong的算法小抄 (gitee.io)](https://labuladong.gitee.io/algo/2/19/35/)




​
