<!--
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-13 10:23:21
 * @FilePath: \code\whf-hooks-analysis\hooks\react-use\index.md
-->

# react-use

- [hooks 0 基础看这](../react-hooks)
- [react-use 官方文档](https://www.reactuse.com/)

## 安装

```shell
pnpm add @reactuses/core
```

## react-use 项目架构

> 这个系列的全部代码都是基于 react-use 2.2.8 版本

相比起 ahooks， react-use 的官方文档显得就比较简陋了

```shell
- react-use
  - .github
  - script
  - packages
    - core # 核心包
      - hooks  # 所有自定义 hook 都在这个文件夹里面
    - website # 项目文档
  - ...
```
