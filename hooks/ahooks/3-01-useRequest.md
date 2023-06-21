# useRequest

:::warning 提示
待完善
:::

- [ahooks-useRequest](https://ahooks.js.org/zh-CN/hooks/use-request/index)
- [ahooks-useRequest 分析](https://gpingfeng.github.io/ahooks-analysis/hooks/request/use-request)

useRequest 通过插件式组织代码，核心代码极其简单，并且可以很方便的扩展出更高级的功能。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1b7e12f8f3440a0b168421268865e63~tplv-k3u1fbpfcp-zoom-1.image)

useRequest 代码的设计架构

入口函数是去调用 `useRequestImplement` 这个函数, 并且将插件列表作为这个函数的参数传进去，而这个函数内部又使用了 Fetch 类来统一管理接口请求和插件

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#93c5fd'}}}%%
flowchart TB
  subgraph 不传
    A(useRequest) --> D(types)
    A --> F(utils)
    A --> E(useRequestImplement)
    E --> B(Plugin 插件)
    E --> C(Fetch 核心)
    A --> D(utils)
    B --> B1(useAutoRunPlugin\n请求是否自动发起插件)
    B --> B2(useCachePlugin\n请求结果缓存插件)
    B --> B4(useLoadingDelayPlugin\n请求loading即loading延迟插件)
    B --> B5(usePollingPlugin\n接口轮询插件)
    B --> B6(useRefreshOnWindowFocusPlugin\n标签页聚焦重新发起请求插件)
    B --> B7(useRetryPlugin\n请求异常重试插件)
    B --> B3(useDebouncePlugin\n请求防抖插件)
    B --> B8(useThrottlePlugin\n请求节流插件)
  end
```
