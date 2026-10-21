---
title: "常见背包归纳"
date: 2021-11-28T14:32:27+08:00
url: "/2021/11/28/常见背包归纳/"
draft: false
tags: ["数据结构与算法"]
---
基本的0-1背包、完全背包问题。



# 一、首先对背包问题进行分类

* 1、组合问题
[377\. 组合总和 Ⅳ](https://leetcode-cn.com/problems/combination-sum-iv/description/)
[494\. 目标和](https://leetcode-cn.com/problems/target-sum/description/)
[518\. 零钱兑换 II](https://leetcode-cn.com/problems/coin-change-2/description/)
  **组合问题公式**
  ```cpp
  dp[i] = dp[i] + dp[i-num];
  ```

* 2、True/False问题
[139\. 单词拆分](https://leetcode-cn.com/problems/word-break/)
[416\. 分割等和子集](https://leetcode-cn.com/problems/partition-equal-subset-sum/description/)

  **True/False问题公式**
  ```cpp
  dp[i] = dp[i] or dp[i-num]
  //或
  dp[i] = dp[i] | dp[i-num]
  ```

* 3、 最大/最小问题
  [474\. 一和零](https://leetcode-cn.com/problems/ones-and-zeroes/description/)
  [322\. 零钱兑换](https://leetcode-cn.com/problems/coin-change/description/)

  **最大/最小问题公式**
  ```cpp
  dp[i] = min(dp[i], dp[i-num] + 1)
  //或
  dp[i] = max(dp[i], dp[i-num] + 1)
  ```

***
# 二、背包问题技巧
**背包问题具备的特征**：给定一个target，target可以是数字也可以是字符串，再给定一个数组nums，nums中装的可能是数字，也可能是字符串，问：能否使用nums中的元素做各种排列组合得到target。
  * 1、0-1背包
    **即数组中的元素不可重复使用，nums放在外循环，target在内循环，且内循环倒序。**
  ```cpp
  for(auto& num : nums) {
      for(int i = target; i >= nums; i--) {
          ***
      }
  }
  ```
  * 2、完全背包
    **即数组中的元素可重复使用，nums放在外循环，target在内循环。且内循环正序。**
  ```cpp
  for(auto& num : nums) {
      for(int i = num; i <= target; i++) {
          ***
      }
  }
  ```
  * 3、组合问题需要考虑顺序
    **如果组合问题需考虑元素之间的顺序，需将target放在外循环，将nums放在内循环。**
  ```cpp
  for(int i = 1; i <= target; i++) {
      for(auto& num : nums) {
          ***
      }
  }
  ```
***
参考链接：[希望用一种规律搞定背包问题 - 组合总和 Ⅳ - 力扣（LeetCode） (leetcode-cn.com)](https://leetcode-cn.com/problems/combination-sum-iv/solution/xi-wang-yong-yi-chong-gui-lu-gao-ding-bei-bao-wen-/)
