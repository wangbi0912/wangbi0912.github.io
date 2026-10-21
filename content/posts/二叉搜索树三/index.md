---
title: "二叉搜索树（三）"
date: 2021-06-15T22:01:43+08:00
url: "/2021/06/15/二叉搜索树三/"
draft: false
tags: ["数据结构与算法"]
---
### 文章对应的题目
96 不同的二叉搜索树
95 不同的二叉搜索树II



***
### 96.不同的二叉搜索树
![96.不同的二叉搜索树](https://upload-images.jianshu.io/upload_images/27610647-fb884c22652bbbb1.png)
若输入`n=3`，总共有5种BST，结果为5，这就需要**穷举**。
若`n=5`，或者说用`{1, 2, 3, 4, 5}`构造平衡二叉树，首先每一个点都能作为根节点，若我们固定`3`为根节点，左子树为`{1, 2}`，右子树为`{4, 5}`，左右两棵子树分别有2种情况。所以对于固定`3`为根节点这个情况来讲，共有**2x2=4**种结果.
对于如何计算左子树`{1, 2}`、右子树`{4, 5}`的情况，这是一个计算树的组合的子问题，直接用递归即可。需要一个辅助函数。

```cpp
int count(int low, int high);  //闭区间[low, high]的数字能组成count(low, high)种BST
```
具体实现代码如下：
```cpp
class Solution {
public:
    int numTrees(int n) {
        return count(1, n);
    }
    int count(int low, int high) {
        if(low > high)
            return 1;
        int res = 0;
        for(int mid = low; mid <= high; mid++) {
            int left = count(low, mid - 1);
            int right = count(mid + 1, high);
            res += left * right;
        }
        return res;
    }
};
```
提交之后并不能通过，超出时间限制，因为存在**重叠子问题**，在动态规划中消除重叠子问题的方法，就是加一个**备忘录**`memo`。代码如下：
```cpp
class Solution {
public:
    int numTrees(int n) {
        vector<vector<int>> memo(n, vector<int>(n)); //初始化二维vector，每一个元素都为0
        return count(1, n, memo);
    }
    int count(int low, int high, vector<vector<int>> memo) {
        if(low > high)
            return 1;
        if(memo[low - 1][high - 1] !=0)
            return memo[low - 1][high - 1];
        int res = 0;
        for(int mid = low; mid <= high; mid++) {
            int left = count(low, mid - 1, memo);
            int right = count(mid + 1, high, memo);
            res += left * right;
        }
        memo[low - 1][high - 1] = res;
        return res;
    }
};
```
但是提交之后还是超过时间限制...

***

### 95.不同的二叉搜索树II
此题思路和上题一样，都是遍历每一个节点作为根节点，迭代求出以当前点为根节点其他子树的树的形状。
具体的步骤为：
1. 穷举```root```节点的所有可能。
2. 递归构造左右子树的BST。
3. 穷举左右子树作为```root```的左右子树
具体代码如下
```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<TreeNode*> generateTrees(int n) {
        if(n == 0)
            return {};
        return build(1, n);
        
    }
    vector<TreeNode*> build(int low, int high) {
        if(low > high) {
            return {nullptr};
        }
        vector<TreeNode*> res;    //保存当前root节点的结果
        for(int mid = low; mid <= high; mid ++) {
            vector<TreeNode*> left = build(low, mid - 1);
            vector<TreeNode*> right = build(mid + 1, high);
            //给root节点穷举所有所有子树的组合
            for(auto i : left) {
                for(auto j : right) {
                    TreeNode* root = new TreeNode(mid);
                    root -> left = i;
                    root -> right = j;
                    res.push_back(root);
                }
            }
        }
        return res;
    }
};
```
