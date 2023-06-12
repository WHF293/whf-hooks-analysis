# useResizeObserver

:::warning 概要
1. 介绍了 ResizeObserver 的作用和基本使用
2. 分析 vueuse 中 useResizeObserver 的源码以及如何使用
3. 对比 ahooks 中 useSize 的写法（待补充）
:::

- [vueuse-useResizeObserver](https://vueuse.org/core/useResizeObserver/#useresizeobserver)

## 前置知识： ResizeObserver

没有，开心不，直接上源码

骗你的。。。

- [一个较新的 JavaScript API——ResizeObserver 的使用](https://juejin.cn/post/6862321554686214158)

1. ResizeObserver 的作用：监听一个 DOM 节点的变化，包括 [某个节点的出现和隐藏] 、 [某个节点的大小变化]

2. 和 window.resize 的区别：

   - window.resize 事件会在一秒内触发将近 60 次，比较影响性能
   - window.resize 会监听页面上所有 dom 节点的变化
   - ResizeObserver 只监听特定元素的大小变化

3. 基础使用：

```js
const target = document.getElementById('target')
const target1 = document.getElementById('target1')
const resizeObserver = new ResizeObserver((entries) => {
  console.log('我的resize变化啦')
})
// 监听元素
resizeObserver.observer(target)
resizeObserver.observer(target1)
// 关闭特定元素的监听
resizeObserver.unobserve(target)
// 关闭对所有元素的监听
resizeObserver.disconnect()
```

## 开始学习

### 类型声明

```ts
export interface ResizeObserverSize {
  readonly inlineSize: number
  readonly blockSize: number
}

export interface ResizeObserverEntry {
  readonly target: Element
  readonly contentRect: DOMRectReadOnly
  readonly borderBoxSize?: ReadonlyArray<ResizeObserverSize>
  readonly contentBoxSize?: ReadonlyArray<ResizeObserverSize>
  readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>
}

// eslint-disable-next-line no-use-before-define
export type ResizeObserverCallback = (entries: ReadonlyArray<ResizeObserverEntry>, observer: ResizeObserver) => void

export interface ResizeObserverOptions extends ConfigurableWindow {
  box?: 'content-box' | 'border-box'
}

declare class ResizeObserver {
  constructor(callback: ResizeObserverCallback)
  disconnect(): void
  observe(target: Element, options?: ResizeObserverOptions): void
  unobserve(target: Element): void
}

export type UnrefElement = HTMLElement | SVGElement | undefined
```

### 源码实现

```ts
import { tryOnScopeDispose } from '@vueuse/shared'
import { watch } from 'vue-demi'
import { MaybeElementRef, unrefElement } from '../unrefElement'
import { ConfigurableWindow, defaultWindow } from '../_configurable'

export function unrefElement(elRef: MaybeElementRef): UnrefElement {
  const plain = unref(elRef)
  return (plain as VueInstance)?.$el ?? plain
}

export function useResizeObserver(
  target: MaybeElementRef,
  callback: ResizeObserverCallback,
  options: ResizeObserverOptions = {},
) {
  const { window = defaultWindow, ...observerOptions } = options

  let observer: ResizeObserver | undefined
  // 是否支持 ResizeObserver 这个 api
  const isSupported = window && 'ResizeObserver' in window

  // 清空所有监听并将 observer 设置为 undefined
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }
  }

  const stopWatch = watch(
    () => unrefElement(target),
    (el) => {
      cleanup()
      // 这一步的 && window 有点多余
      if (isSupported && window && el) {
        // @ts-expect-error missing type
        observer = new window.ResizeObserver(callback)
        // 观测用户传进去的元素
        observer!.observe(el, observerOptions)
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  const stop = () => {
    cleanup()
    stopWatch()
  }

  tryOnScopeDispose(stop)

  return {
    isSupported,
    stop,
  }
}

export type UseResizeObserverReturn = ReturnType<typeof useResizeObserver>
```

感觉这个 api 没啥好讲的啊。。。。。。。。。。。。。。

### 使用

官方文档的案例

```html
<template>
  <div ref="el">{{text}}</div>
</template>

<script>
  import { ref } from 'vue'
  import { useResizeObserver } from '@vueuse/core'

  export default {
    setup() {
      const el = ref(null)
      const text = ref('')

      useResizeObserver(el, (entries) => {
        const entry = entries[0]
        const { width, height } = entry.contentRect
        text.value = `width: ${width}, height: ${height}`
      })

      return {
        el,
        text,
      }
    },
  }
</script>
```
