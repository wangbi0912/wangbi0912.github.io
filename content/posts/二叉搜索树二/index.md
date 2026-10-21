---
title: "二叉搜索树（二）"
date: 2021-06-14T21:53:37+08:00
url: "/2021/06/14/二叉搜索树二/"
draft: false
tags: ["数据结构与算法"]
---
### 文章对应的题目
450 删除BST的节点（M）
701 二叉搜索树的插入操作（M）
700 二叉搜索树的搜索（E）
98 验证二叉搜索树



***
对于BST相关的问题，基本上有一个代码框架
```cpp
void traverse(TreeNode* root, int target) {
    if(root -> val == target) {
        //找到目标操作
    }
    if(root -> val < target) {
        traverse(root -> right, target);
    }
    if(root -> val > target) {
        traverse(root -> left, target);    
    }
}
```
***
### 98.验证二叉搜索树
![98.验证二叉搜索树](https://upload-images.jianshu.io/upload_images/27610647-9783181e5d62b6b8.png)

首先，直接思路就是递归遍历每一个节点，比较节点的左右孩子的值和本身相比，
但是，二叉搜索树不仅仅是对于一个节点的孩子节点相比，还要保证整个子树都要小于该节点的值，这时候需要一个辅助函数，函数签名为：
```cpp
bool is_valid(TreeNode* root, TreeNode* max, TreeNode* min);
```
辅助函数将该节点作为后续遍历节点的根节点，遍历到左子树时为`root`为`max`节点，遍历到右子树时为`root`为`min`节点。
正确的代码如下：
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
    bool isValidBST(TreeNode* root) {
        return isValid(root, nullptr, nullptr);
    }
    bool isValid(TreeNode* root,TreeNode* max,TreeNode* min) {
        if(root == nullptr)
            return true;
        if(max != nullptr && root -> val >= max -> val)
            return false;
        if(min != nullptr && root -> val <= min -> val)
            return false;
        return isValid(root -> left, root, min) && isValid(root -> right, max, root);
    }
};
```
使用辅助函数增加携带的参数信息，将约束传递到子树的所有节点，这是个小技巧。
***
### 700 二叉搜索树的搜索（E）
![700 二叉搜索树的搜索](https://upload-images.jianshu.io/upload_images/27610647-544da1606b2d1135.png)

这题比较简单，直接递归就行，代码如下：
```cpp
class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        if(root == nullptr) return nullptr;
        //可以省略判别相等的情况
        // if(root -> val == val)
        //     return root;
        if(root -> val > val)
            return searchBST(root -> left, val);
        if(root -> val < val)
            return searchBST(root -> right, val);
        return root;
    }
};
```
***
### 701 二叉搜索树的插入操作
![701 二叉搜索树的插入操作](https://upload-images.jianshu.io/upload_images/27610647-72a3d334adccdb60.png)
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
    TreeNode* insertIntoBST(TreeNode* root, int val) {
        if(root == nullptr)
            return new TreeNode(val);
        if(root -> val > val)
            root -> left = insertIntoBST(root -> left, val);
        if(root -> val < val)
            root -> right = insertIntoBST(root -> right, val);
        return root;
    }
};/**
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
    TreeNode* insertIntoBST(TreeNode* root, int val) {
        if(root == nullptr)
            return new TreeNode(val);
        if(root -> val > val)
            root -> left = insertIntoBST(root -> left, val);
        if(root -> val < val)
            root -> right = insertIntoBST(root -> right, val);
        return root;
    }
};
```
***
### 450 删除BST的节点
![450 删除BST的节点](https://upload-images.jianshu.io/upload_images/27610647-5ad6ea611902cade.png)
要删除二叉搜索树中的节点，必须要保证删除之后二叉搜索树保持原有性质。删除节点可以分为三种情况：
* 1、删除的节点为叶子节点，左右孩子都为`nullptr`；
        这种情况，直接返回`nullptr`作为上一个递归的子树；
* 2、删除的节点只有一个孩子，另一个孩子为`nullptr`；
        这种情况，直接返回其唯一的孩子作为上一个递归的子树；
* 3、删除的节点有两个孩子
        在此情况下，为了不破坏二叉搜索树的性质，必须找到该节点`node`的左子树`node -> left`中的最大节点`maxNode`或右子树`node -> right`中的最小节点`minNode`代替该节点，然后递归的删除其右子树`node -> right`中的`minNode`（以`minNode`为例子）
```cpp
class Solution {
public:
    TreeNode* deleteNode(TreeNode* root, int key) {
        if(root == nullptr)
            return nullptr;
        if(root -> val == key) {
            if(root -> left == nullptr && root -> right == nullptr) return nullptr;
            if(root -> left != nullptr && root -> right == nullptr) return root -> left;
            if(root -> left == nullptr && root -> right != nullptr) return root -> right;
            TreeNode* temp = getMax(root -> right);
            root -> val = temp -> val;
            //删除右子树的最小节点
            root -> right = deleteNode(root -> right, temp -> val);
            
        }
        if(root -> val > key) {
            root -> left = deleteNode(root -> left, key);
        }
        if(root -> val < key) {
            root -> right = deleteNode(root -> right, key);
        }
        return root;
    }
    //获取右子树的最小节点
    TreeNode* getMax(TreeNode* root) {
        while(root -> left) {
            root = root -> left;
        }
        return root;
    }
};
```
