<!--
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 19:27:30
 * @FilePath: \code\whf-hooks-analysis\hooks\ahooks\index.md
-->

# ahooks

- [hooks 0 基础看这](../react-hooks)
- [ahooks 官方文档](https://ahooks.js.org/zh-CN/)

> 本系列不会把 ahooks 中的所有 hooks 都分析一边，只会从从中挑选部分和 UI 库无关以及自己平时用的比较多的 hooks 进行分析，如果要学习全部 hooks 的话，建议直接去看项目

## 安装

```shell
pnpm add ahooks
npm i ahooks
yarn add ahooks
```

## ahooks 项目架构

> 这个系列的全部代码都是基于 ahooks 3.7.7

ahooks 采用 pnpm + monorepo 结构组织代码

```shell{8-11}
- hooks
 - .github github 工作流
 - .husky 代码提交规范
 - config 文档配置，即配置那个自定义 hooks 在那个具体的分类下面
 - docs 文档，基于 dumi2
 - example 本地开发测试时的测试文件
 - public 静态资源
 - packages
  - hooks
    - src 绝大部分自定义 hooks 都在这个目录下(后面介绍的自定义 hooks 都在这个里面)
  - use-url-state 和路由相关的自定义hooks，单独作为一个项目
 - ...
```

## ahooks 设计理念

- [ahooks 函数处理规范](https://ahooks.js.org/zh-CN/guide/blog/function)

在使用 ahooks 提供的各种自定义 hooks 时有的 hooks 我们会传入一个函数，如 useMount，有的 hooks 又会返回出一个函数，如 useToggle

ahooks 使用 useRef 对我们输入的函数进行包装，这样可以保证函数对应的内存地址不变

而对于输出的函数使用 useCallback 进行包装，这样可以保证输出函数对应的内存地址永远为最新的地址

从而避免闭包问题


## 本系列的分类标准

- 初入江湖：只用到 react 提供的 hooks 就能实现功能
- 副本刷怪：分析 ahooks 中 utils 文件夹中提供的工具函数
- 掉入悬崖：除了使用到 react 提供的 hooks，还是需要用到 utils 中的工具函数或者其他第三方工具函数，但是难度不大
- 大难不死: ahooks 中难度比较大的自定义 hooks
- 习得神功：对本系列分析的 hooks 进行一下总结以及思考

每个分类都有对应的 `武功招数` 可以给大侠们学习
