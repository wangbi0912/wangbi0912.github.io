---
title: "回溯问题"
date: 2021-08-10T21:28:18+08:00
url: "/2021/08/10/回溯问题/"
draft: false
tags: ["数据结构与算法"]
---
### 文章对应的题目
46 全排列（M）
51 N皇后（H）



***
解决一个回溯问题，基本上就是一个决策树的遍历过程。有三点需要考虑：
* **路径**：也就是已经做出的选择。
* **选择列表**：当前可以做的选择（for循环）
* **结束条件**：已经遍历到决策树底层，返回结果。
代码框架：
```cpp
result = []
def backtrack(路径, 选择列表):
    if 满足结束条件:
        result.add(路径)
        return

    for 选择 in 选择列表:
        做选择（一般是把当前节点加入到路径中）
        backtrack(路径, 选择列表)
        撤销选择（一般是从路径中剔除当前节点，直接pop）
```
***
### 46 全排列（M）
![](https://upload-images.jianshu.io/upload_images/27610647-9062ea46e717d84d.png)
* **首先是第一点**
路径：在本题中，需要遍历决策树，所以路径就是节点的值、
* **第二点**
选择列表：选择列表是从所有数字中剔除路径中已经存在的节点之后，剩下的所有的选项。
如何判断路径中已经添加过当前节点了呢？可以使用一个布尔数组`used`。
* **第三点**
结束条件：`path.size() == nums.size()`路径长度和给定的数字数量相等时，即遍历到了决策树的最底层。
* **第四点**
做选择和撤销选择：这个理解较简单，在往下遍历时（做选择），在路径中加入当前节点即可，但由于我们还有个`used`数组，所以还要将判断`used[i]`，并将其置为`true`.
撤销选择时，即回溯，需要撤销选择，将`path`中的节点`pop`出，并将`used[i]`其置为`false`。
代码如下：
```cpp
class Solution {
public:
    vector<int> path;
    vector<vector<int>> res;
    vector<vector<int>> permute(vector<int>& nums) {
        vector<bool> used(nums.size());
        backtrack(nums, used);
        return res;
    }
    void backtrack(vector<int>& nums, vector<bool> used) {
        if(path.size() == nums.size()) {
            res.push_back(path);
            return;
        }
        for(int i = 0; i < nums.size(); i++) {
            if(used[i] == true)
                continue;
            used[i] = true;
            path.push_back(nums[i]);
            backtrack(nums, used);
            path.pop_back();
            used[i] = false;
        }
    }
};
```
***
### 51 N皇后（H）
![](https://upload-images.jianshu.io/upload_images/27610647-d9f944251d24d1af.png)
*注：皇后可以攻击同一行、同一列、左上左下右上右下四个方向的任意单位。*
首先，回溯框架中的路径即对应一个棋盘，定义为`vector<string> board(n, string(n, '.'))`
然后遍历每一行（对应一个`string`）中的每一列，将满足条件的置为`'Q'`，决策树如下：
![](https://upload-images.jianshu.io/upload_images/27610647-7bbcbb50182567da.png)，
然后对于做选择和撤销选择，即将棋盘`board`中的每一个点换成`'Q'`和`'.'`，对于判断在当前位置放置皇后是否有效，可以使用一个`valid`辅助函数判断是否有效（注：皇后可以攻击同一行、同一列、左上左下右上右下四个方向的任意单位。）
```cpp
    bool valid(vector<string>& board, int row, int col) {
        int n = board.size();
        // 检查列是否有皇后互相冲突
        for (int i = 0; i < n; i++) {
            if (board[i][col] == 'Q')
                return false;
        }
        // 检查右上方是否有皇后互相冲突
        for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q')
                return false;
        }
        // 检查左上方是否有皇后互相冲突
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q')
                return false;
        }
        return true;
    }
```
整体代码如下：
```cpp
class Solution {
public:
    vector<vector<string>> res;
    vector<vector<string>> solveNQueens(int n) {
        vector<string> board(n, string(n, '.'));
        backtrack(board, 0);
        return res;
    }

    void backtrack(vector<string>& board, int row) {
        if(row == board.size()) {
            res.push_back(board);
            return;
        }
        for(int col = 0; col < board.size(); col ++) {
            if(!valid(board, row, col))
                continue;
            board[row][col] = 'Q';
            backtrack(board, row + 1);
            board[row][col] = '.';
        }
    }
    bool valid(vector<string>& board, int row, int col) {
        int n = board.size();
        // 检查列是否有皇后互相冲突
        for (int i = 0; i < n; i++) {
            if (board[i][col] == 'Q')
                return false;
        }
        // 检查右上方是否有皇后互相冲突
        for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q')
                return false;
        }
        // 检查左上方是否有皇后互相冲突
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q')
                return false;
        }
        return true;
    }
};
```
* 小拓展：
如果我们获得一个N皇后的解法就返回结果，我们只需在得到第一个结果的时候`return true;`即可，如下：
```cpp
// 函数找到一个答案后就返回 true
bool backtrack(vector<string>& board, int row) {
    // 触发结束条件
    if (row == board.size()) {
        res.push_back(board);
        return true;
    }
    ...
    for (int col = 0; col < n; col++) {
        ...
        board[row][col] = 'Q';

        if (backtrack(board, row + 1))
            return true;

        board[row][col] = '.';
    }

    return false;
}
```
可以思考一下解数独。
***
### Reference
[图论基础 :: labuladong的算法小抄 (gitee.io)](https://labuladong.gitee.io/algo/2/19/35/)
