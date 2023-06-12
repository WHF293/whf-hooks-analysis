<!--
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-12 20:19:41
 * @FilePath: \code\hooks-analysis\hooks\ahooks\index.md
-->

# ahooks

- [hooks 0 基础看这](../react-hooks)
- [ahooks 官方文档](https://ahooks.js.org/zh-CN/)

## ahooks 项目架构

> 这个系列的全部代码都是基于 ahooks 3.7.7

ahooks 采用 pnpm + monorepo 结构组织代码

```shell
- hooks
 - .github github 工作流
 - .husky 代码提交规范
 - config 文档配置，即配置那个自定义 hooks 在那个具体的分类下面
 - docs 文档，基于 dumi2
 - example 本地开发测试时的测试文件
 - public 静态资源
 - packages
  - hooks 绝大部分自定义 hooks 都在这个目录下(后面介绍的自定义 hooks 都在这个里面)
  - use-url-state 和路由相关的自定义hooks，单独作为一个项目
 - ...
```
