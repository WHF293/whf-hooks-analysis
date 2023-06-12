# useIntersectionObserver

:::tip 概要

1. 介绍了 IntersectionObserver 的作用和基本使用
2. 分析 vueuse 中 useIntersectionObserver 的源码以及如何使用
3. 对比 ahooks 中 useInViewport 的写法
4. 业务中利用 IntersectionObserver 实现表格数据懒加载的简单实现
:::

## 前置知识：IntersectionObserver

- [超好用的 API 之 IntersectionObserver](https://juejin.cn/post/6844903874302574599)

1. IntersectionObserver api 的作用

提供了一种异步观察目标元素与祖先元素或顶级文档 viewport 的交集中的变化的方法，其中祖先元素与视窗 viewport 被称为根(root)

2. 使用

```js
const io = new IntersectionObserver(callback, options)
io.observe(DOM)
```

```js
const options = {
  // 所监听对象的具体祖先元素。如果未传入值或值为null，
  // 则默认使用顶级文档的视窗(一般为html)
  root: null,
  // 计算交叉时添加到根(root)边界盒bounding box的矩形偏移量，默认为0
  rootMargin: 0,
  // 一个包含阈值的列表, 按升序排列, 列表中的每个阈值都是监听对象的交叉
  // 区域与边界区域的比率。可以是一个具体的数值或是一组 0.0 到 1.0 之间的数组，
  // 若指定值为 0.0，则意味着监听元素即使与根有 1 像素交叉，
  // 此元素也会被视为可见。若指定值为 1.0，则意味着整个元素都在可见范围内时才算可见
  thresholds: 1,
}
// callback: 当监听目标发生滚动变化时触发的回调函数
const handless = (entries) => {
  console.log(entries)
  // Do something
}

const io = new IntersectionObserver(handless, options)

io.observe(DOM)
```

3. 实际应用的例子 —— 图片懒加载

```js
const imgList = [...document.querySelectorAll('img')]

var io = new IntersectionObserver(
  (entries) => {
    entries.forEach((item) => {
      // isIntersecting是一个Boolean值，判断目标元素当前是否可见
      if (item.isIntersecting) {
        item.target.src = item.target.dataset.src
        // 图片加载后即停止监听该元素
        io.unobserve(item.target)
      }
    })
  },
  {
    root: document.querySelector('.root'),
  },
)

// observe遍历监听所有img节点
imgList.forEach((img) => io.observe(img))
```

## 开始学习

- [vueuse——useintersectionobserver](https://vueuse.org/core/useintersectionobserver/#useintersectionobserver)

了解完 IntersectionObserver 这个 api 的用法后，我们开始学习 vueuse 中的 useIntersectionObserver。

先放源码：

```ts
import { watch } from 'vue-demi' // 第三方开源库，用于兼容 vue2 / vue3
import { noop, tryOnScopeDispose } from '@vueuse/shared'
import { ConfigurableWindow, defaultWindow } from '../_configurable'
import { MaybeElementRef, unrefElement } from '../unrefElement'

// 定义 IntersectionObserver 的 options 入参的类型
export interface IntersectionObserverOptions extends ConfigurableWindow {
  root?: MaybeElementRef
  rootMargin?: string
  threshold?: number | number[]
}

export function useIntersectionObserver(
  target: MaybeElementRef,
  callback: IntersectionObserverCallback,
  options: IntersectionObserverOptions = {},
) {
  const {
    root, // 监听的根元素
    rootMargin = '0px',
    threshold = 0.1, // 元素 10% 可见时触发
    window = defaultWindow,
  } = options

  // 判断当前是否是浏览器环境，是否支持 IntersectionObserver
  const isSupported = window && 'IntersectionObserver' in window
  // noop 是一个返回空对象的箭头函数: const noop = () => {}
  let cleanup = noop

  const stopWatch = isSupported
    ? watch(
        () => ({
          el: unrefElement(target),
          root: unrefElement(root),
        }),
        ({ el, root }) => {
          cleanup()
          // 如果没有观察的元素，直接 return
          if (!el) return

          // @ts-expect-error missing type
          // 创建一个 IntersectionObserver 实例
          const observer = new window.IntersectionObserver(
            callback, {
              root,
              rootMargin,
              threshold,
            }
          )
          // 观察目标元素
          observer.observe(el)

          cleanup = () => {
            // 取消监听
            observer.disconnect()
            // 并且重置为 noop
            cleanup = noop
          }
        },
        {
          immediate: true,
          flush: 'post',
        },
      )
    : noop

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

export type UseIntersectionObserverReturn =
  ReturnType<typeof useIntersectionObserver>
```

是不是脑壳嗡嗡的，开局新手村就给详细介绍一下各部分的作用，后面接下来的文章可能只会重点分析一部分代码，大部分比较简单明了的就直接写注释好了。好了，开启新手村任务。。。

第一步,先看所需要的依赖

```ts
import { watch } from 'vue-demi' // 第三方开源库，用于兼容 vue2 / vue3
import { noop, tryOnScopeDispose } from '@vueuse/shared'
import { ConfigurableWindow, defaultWindow } from '../_configurable'
import { MaybeElementRef, unrefElement } from '../unrefElement'
```

可以看到，第一个导入的就是 [vue-demi](https://github.com/vueuse/vue-demi)

[![jv3ens.png](https://s1.ax1x.com/2022/07/25/jv3ens.png)](https://imgtu.com/i/jv3ens)

作用是用于兼容 vue2 / vue3。

看到第二行,找到对应的源码

```ts
export const noop = () => {}
// tryOnScopeDispose 比较复杂，放在后面一块分析
export function tryOnScopeDispose(fn: Fn) {
  // 巴拉巴拉。。。
}
```

同样，找到第三、四行对应的源码

```ts
// 第三行
export interface ConfigurableWindow {
  window?: Window
}
export const isClient = typeof window !== 'undefined'
export const defaultWindow = /* #__PURE__ */ isClient ? window : undefined
```

```ts
// 第四行
export type MaybeRef<T> = T | Ref<T>
export type MaybeElementRef = MaybeRef<
  HTMLElement | SVGElement | VueInstance | undefined | null
>
export type UnrefElement = HTMLElement | SVGElement | undefined
export function unrefElement(elRef: MaybeElementRef): UnrefElement {
  const plain = unref(elRef)
  return (plain as VueInstance)?.$el ?? plain
}
```

ok， 接下来终于是正文了，先看源码实现

```ts
export function useIntersectionObserver(
  target: MaybeElementRef, // 用户要监听的目标元素
  callback: IntersectionObserverCallback, // 触发 IntersectionObserver 后的回调
  options: IntersectionObserverOptions = {}, // 用户传入的 IntersectionObserver 配置项
) {
  const {
    // 根元素（不传或为 null，则默认为 html 元素）
    root,
    // 监听元素与根的偏移量，默认为 0px
    rootMargin = '0px',
    // 监听的元素可见范围达到指定比例时触发 callback， 默认 10%
    threshold = 0.1,
    // 判断是在浏览器环境还是node环境
    window = defaultWindow,
  } = options

  // 在浏览器环境并判断浏览器是否支持 IntersectionObserver 这个api
  const isSupported = window && 'IntersectionObserver' in window
  // 定义清空函数，返回一个空对象
  let cleanup = noop

  // node 环境或者浏览器不支持 IntersectionObserver api，则直接返回一个空对象
  const stopWatch = isSupported
    ? watch(
        // vue-demi 提供的监听函数，用于兼容 vue2/3 的 watch
        () => ({
          // 监听用户传入的需要监听的元素
          el: unrefElement(target),
          // 监听用户传入的根元素
          root: unrefElement(root),
        }),
        // 需要监听的元素或根元素发生变化时触发的回调
        ({ el, root }) => {
          // 进入回调先清空上一次的 IntersectionObserver
          cleanup()
          // 用户没有传入需要监听的元素或被监听元素为 null / undefined，直接 return
          if (!el) return
          // 实例化一个 IntersectionObserver
          const observer = new window.IntersectionObserver(callback, {
            root,
            rootMargin,
            threshold,
          })
          // 监听用户传入的需要监听的元素
          observer.observe(el)

          // 修改清空函数，执行时先移除对用户传入元素的监听后，在返回一个空对象
          cleanup = () => {
            // 终止对所有目标元素可见性变化的观察
            observer.disconnect()
            cleanup = noop
          }
        },
        {
          immediate: true,
          flush: 'post',
        },
      )
    : noop

  // 定义停止函数，先清空，在调用上面定义的 stopWatch 函数
  // 作用：vue 组件使用的时候，可以在组件卸载时用于移除监听
  const stop = () => {
    cleanup()
    stopWatch()
  }

  // 如果在 vue 生命周期内，则执行 stop 函数，否则啥也不做
  tryOnScopeDispose(stop)

  return {
    isSupported,
    stop,
  }
}
```

接下来就剩下 `tryOnScopeDispose(stop)` 这一行代码我没还不知道它的作用，let's go

还是先看源码

```ts
import { getCurrentScope, onScopeDispose } from 'vue-demi'

type Fn = () => void

/**
 * Call onScopeDispose() if it's inside a effect scope lifecycle, if not, do nothing
 * 翻译：如果在作用域生命周期内，则调用onScopeDispose（），如果不在，则什么也不做
 * @param fn
 */
export function tryOnScopeDispose(fn: Fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn)
    return true
  }
  return false
}
```

备注： `getCurrentScope` 和 `onScopeDispose`, 这两货没在 github 的 readme 文档上找到，后面有机会再补充这两货的作用。不过 `tryOnScopeDispose` 的大致作用应该就是用于判断是否处于 vue 的生命周期内，如果不在就什么都不做，如果在的话就执行传入的函数，在这里传入的是 `stop` 函数。

到这里 useIntersectionObserver 的源码分析基本结束，最后看下实际应用。

## vueuse 官网案例

```html
<template>
  <div ref="target">
    <h1>Hello world</h1>
  </div>
</template>
<script>
  import { ref } from 'vue'
  import { useIntersectionObserver } from '@vueuse/core'

  export default {
    setup() {
      const target = ref(null)
      const targetIsVisible = ref(false)

      const { stop } = useIntersectionObserver(
        target,
        // 这一步需要验证下 callback 为什么有两个入参
        ([{ isIntersecting }], observerElement) => {
          targetIsVisible.value = isIntersecting
        },
      )

      return {
        target,
        targetIsVisible,
      }
    },
  }
</script>
```

## 对比 ahooks

- [ahooks - useInViewport](https://ahooks.js.org/zh-CN/hooks/use-in-viewport)

同样，直接上源码

```ts
import 'intersection-observer'
import { useState } from 'react'
import type { BasicTarget } from '../utils/domTarget'
import { getTargetElement } from '../utils/domTarget'
import useEffectWithTarget from '../utils/useEffectWithTarget'

export interface Options {
  rootMargin?: string
  threshold?: number | number[]
  root?: BasicTarget<Element>
}

function useInViewport(target: BasicTarget, options?: Options) {
  const [state, setState] = useState<boolean>()
  const [ratio, setRatio] = useState<number>()

  useEffectWithTarget(
    () => {
      const el = getTargetElement(target)
      if (!el) {
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            setRatio(entry.intersectionRatio)
            setState(entry.isIntersecting)
          }
        },
        {
          ...options,
          root: getTargetElement(options?.root),
        },
      )

      observer.observe(el)

      return () => {
        observer.disconnect()
      }
    },
    [],
    target,
  )

  return [state, ratio] as const
}

export default useInViewport
```

同样，先看导入的都是写什么东西

```ts
import 'intersection-observer'
import { useState } from 'react'
import type { BasicTarget } from '../utils/domTarget'
import { getTargetElement } from '../utils/domTarget'
import useEffectWithTarget from '../utils/useEffectWithTarget'
```

第一个导入的看着像一个封装好的 intersectionObserver 的第三方包，找到对应的 `packages.json` 看看 ---> `packages/hooks/packages.json`

[![vPE4eI.png](https://s1.ax1x.com/2022/07/29/vPE4eI.png)](https://imgtu.com/i/vPE4eI)

第二个不用说了，了解 react 的都知道是啥, 第三个是一个类型提示，找到它看看到底是啥

```ts
// packages/hooks/src/utils/domTarget.ts
type TargetValue<T> = T | undefined | null

type TargetType = HTMLElement | Element | Window | Document

export type BasicTarget<T extends TargetType = Element> =
  | (() => TargetValue<T>)
  | TargetValue<T>
  | MutableRefObject<TargetValue<T>>
```

结合 ahooks 代码和前文的分析，可以知道这个类型提示是给 `intersectionObserver 的 options.root` 用的，所以它表达的类型是 `element | null | undefined`

接下来看剩下的这两货（`getTargetElement`、`useEffectWithTarget`）是啥东西了：

<!-- getTargetElement -->

```ts
// 获取要监控的元素
import { getTargetElement } from '../utils/domTarget'
```

分析直接写在里面了

```ts
// utils/isBrowser.js
const isBrowser = !!(
  typeof window !== 'undefined' && window.document && window.document.createElement
)
export default isBrowser

// utils/domTarge
export function getTargetElement<T extends TargetType>(
  target: BasicTarget<T>,
  defaultElement?: T
) {
  // 判断是否是浏览器
  if (!isBrowser) {
    return undefined
  }
  // 判断用户有没有传入要监控的节点
  if (!target) {
    return defaultElement
  }

  let targetElement: TargetValue<T>

  if (isFunction(target)) {
    // 判断是否是函数（是的话执行函数获取 dom），传入一个可以获取 dom 元素的函数
    targetElement = target()
  } else if ('current' in target) {
    // 判断是否是 ref， 使用 createRef / useRef 获取的
    targetElement = target.current
  } else {
    // 判断是否是 dom， 直接使用 document 获取的
    targetElement = target
  }

  return targetElement
}
```

<!-- useEffectWithTarget -->

```ts
import useEffectWithTarget from '../utils/useEffectWithTarget'
```

```ts
// utils/useEffectWithTarget.ts
import { useEffect } from 'react'
import createEffectWithTarget from './createEffectWithTarget'

const useEffectWithTarget = createEffectWithTarget(useEffect)
export default useEffectWithTarget
```

```ts
// utils/createEffectWithTarget.ts
import type { DependencyList, EffectCallback, useEffect, useLayoutEffect } from 'react'
import { useRef } from 'react'
import useUnmount from '../useUnmount'
import depsAreSame from './depsAreSame'
import type { BasicTarget } from './domTarget'
import { getTargetElement } from './domTarget'

const createEffectWithTarget = (
  useEffectType: typeof useEffect | typeof useLayoutEffect
) => {
  const useEffectWithTarget = (
    effect: EffectCallback,
    deps: DependencyList,
    target: BasicTarget<any> | BasicTarget<any>[],
  ) => {
    const hasInitRef = useRef(false)
    const lastElementRef = useRef<(Element | null)[]>([])
    const lastDepsRef = useRef<DependencyList>([])

    const unLoadRef = useRef<any>()

    useEffectType(() => {
      // 在当前 useInViewport 中 useEffectType 相当于 useEffect
      const targets = Array.isArray(target) ? target : [target]
      const els = targets.map((item) => getTargetElement(item))

      // init run
      // 用于缓存数据
      if (!hasInitRef.current) {
        hasInitRef.current = true
        lastElementRef.current = els
        lastDepsRef.current = deps
        unLoadRef.current = effect()
        return
      }

      if (
        els.length !== lastElementRef.current.length ||
        !depsAreSame(els, lastElementRef.current) ||
        !depsAreSame(deps, lastDepsRef.current)
      ) {
        unLoadRef.current?.()
        lastElementRef.current = els
        lastDepsRef.current = deps
        unLoadRef.current = effect()
      }
    })

    useUnmount(() => {
      unLoadRef.current?.()
      hasInitRef.current = false
    })
  }

  return useEffectWithTarget
}

export default createEffectWithTarget
```

## 实际应用

```ts
// lazyLoadTable.types.ts
interface ITableHeaderItem {
  slot: string
  name: string
  width?: number
}
interface LazyLoadProps {
  tableHeader: ITableHeaderItem[]
  tableList: unknown[]
  updateDataLength: number
}
```

```html
<!-- 延迟加载表格组件 lazyLoadTable.vue -->
<template>
    <table class="lazy-load-table">
        <thead>
            <tr>
                <colGroup>
                    <col
                      v-for="item in props.tableHeader"
                      :width="`${item}px`"
                      :key="item.slot"
                    ><col>
                </colGroup>
                <th>
                    <th v-for="item in props.tableHeader"
                      :key="item.slot">
                      {{ item.name }}
                    </th>
                </th>
            </tr>
        </thead>
        <tbody>
            <colGroup>
                <col
                  v-for="item in props.tableHeader"
                  :width="`${item}px`"
                  :key="item.slot"
                ><col>
            </colGroup>
            <tr v-for="(item, index) in props.tableList">
                <td v-for="thItem in props.tableHeader">
                    <!-- 使用作用域插槽封装表格内容 -->
                    <slot
                      :name="thItem.slot"
                      :item="item"
                      :index="index">
                      {{ item[thItem.slot] ? item[thItem.slot] : ''}}
                    </slot>
                </td>
            </tr>
            <!-- 标识符，这个可见说明需要加载更多内容 -->
            <div ref="target" style="height: 3px;"></div>
        </tbody>
    </table>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnMounted } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import type { LazyLoadProps } from './lazyLoadTable.types.ts'

const props = withDefaults(defineProps<ITableHeaderItem>(), {
    tableHeader: [],
    tableList: [],
    updateDataLength: 10
})

const renderList = ref<unknown[]>([])
const target = ref<HTMLElement|null>(null);
const targetIsVisible = ref<boolean>(false);

onMounted(() => {
    updateRenderList();
})

onUnMounted(() => {
    stop();
})

watch(targetIsVisible, (val) => {
    if (val) {
        updateRenderList();
    }
})

watch(props.tableList, () => {
    renderList.value = [];
    updateRenderList();
})

const updateRenderList = () => {
    const currentLen = renderList.value.length;
    const totalDataLen = props.tableList.length;
    if (totalDataLen > currentLen) {
        const startIndex = currentLen;
        let endIndex = currentLen + props.updateDataLength;
        endIndex = endIndex > totalDataLen ? totalDataLen : endIndex;
        const addData = props.tableList.slice(startIndex, endIndex);
        renderList.value.push(addData);
    }
}

const { stop } = useIntersectionObserver(
    target,
    ([{ isIntersecting }], observerElement) => {
        targetIsVisible.value = isIntersecting;
    }
);
</script>

<style lang="scss" scoped>
.lazy-load-table {
    table-layout: fixed;

    th, td {
        padding: 12px;
    }
}
</style>
```

## 项目中的简单使用及实现懒加载表格数据

```html
<template>
  <!-- 简单实现 -->
  <div>
    <table>
      <thead>
        <tr>
          ......
        </tr>
      </thead>
    </table>
  </div>
  <!-- tbody 和 thead 分开是为了可以固定表头 -->
  <div ref="body-content">
    <table>
      <tbody>
        <tr v-for="item in rows">
          .......
        </tr>
        <div ref="lazyLoadRef"></div>
      </tbody>
    </table>
  </div>
</template>
<script>
  export default {
      props: {
          tableList: {  // 所有的数据
              type: Array,
              default: () => []
          },
          isNeedLazyLoad: { // 是否开启延迟加载数据
              type: Boolean,
              default: false,
          },
          lazyAddDataNum: { // 每次延迟加载的数量
              type: Number,
              default: 15
          }
      },
      data() {
          return {
              rows: [],
              allRows: [],
              ob: null,
              isSupportInterSectionObserver: false
          }
      },
      watch: {
          tableList(newVal) {
              this.formatRows()
          }
      },
      mounted() {
          this.isSupportInterSectionObserver = this.isNeedLazyLoad && !!window.IntersectionObserver ? true : false
          if (this.isSupportInterSectionObserver) {
              this.setInterSectionObserver()
          }
      },
      unMounted() {
          if (!!this.ob) {
              this.ob.unobserve(this.$refs['interSectionObserverDom']);
              this.ob = null;
          }
      }
      methods: {
          setInterSectionObserver() {
              this.ob = new IntersectionObserver((entries) => {
                  entries.forEach(item => {
                      // 元素进入可见区域
                      if (item.isIntersecting) {
                          const allLength = this.allRows.length;
                          const currentLength = this.rows.length;
                          if (allLength - currentLength > 0)  {
                              if (allLength - currentLength <= this.lazyAddDataNum) {
                                  this.rows = [...this.rows, ...this.allRows.slice(currentLength)];
                              } else {
                                  this.rows = [...this.rows, ...this.allRows.slice(currentLength, currentLength + this.lazyAddDataNum)];
                              }
                          }
                      }
                  })
              }, {
                  root: this.$refs['body-content'],
                  threshold: 0.5,  // 可见区域百分比
              })
              const target = this.$refs['interSectionObserverDom'];
              this.ob.observe(target)
          },
          formatRows() {
              this.allRows = this.tableList.map((item) => {
                  return Object.assign(item, {
                      // 合并单元格的
                      rowspan: item.hasOwnProperty('rowspan') ? item.rowspan : 1,
                  })
              });
              // 传入的所有数据数量小数每次延迟加载的数据 / 没开启延迟加载 / 浏览器不支持 IntersectionObserver 这个 api 的都直接渲染所有数据
              if (this.allRows.length < this.lazyAddDataNum || !this.isSupportInterSectionObserver) {
                  this.rows = this.allRows;
              } else {
                  this.rows = this.allRows.slice(0, this.lazyAddDataNum)
              }
              // 。。。。。。。。。其他具体操作
          },
      }
  }
</script>
```
