# useVirtualList

:::warning 概要
1. 介绍了虚拟列表的概念和基本实现思路
2. 分析 vueuse 中 useVirtualList 的源码以及如何使用
3. 关于动态高度虚拟列表的实现
:::

## 前置知识：虚拟列表

概念： 虚拟列表其实是按需显示的一种实现，即只对可见区域进行渲染，对非可见区域中的数据不渲染或部分渲染的技术，从而达到极高的渲染性能

虚拟列表需要注意点：

- 由于虚拟列表是通过 外层盒子高度 / 子项高度 来获取具体需要渲染的数据条数以及计算上下留白，所以必选保证每一个子项的高度必须一致
- 视图窗口大小发生改变或移动端窗口发生翻转时需要从新计算最大渲染量和上下留白
- 实际渲染数据量除计算出来的最大渲染量之外还需要加上缓冲区，避免滑动时出现短暂白屏虚拟列表缺点：
- 子项高度必须确定，对于某些特定的场景无法确定子项高度时无法使用（后面会补充怎么解决）
- 在页面上 ctrl+F 搜索时，由于之渲染少量数据，可能找不到存在的数据

实现步骤：

- 1. 计算外层盒子最多可以装下多少个子项
- 2. 添加缓冲区到实际渲染数据上下，避免滑动时出现短暂白屏
- 3. 根据计算结果，裁剪用户传入的数据作为实际渲染的数据
- 4. 监听 外层盒子元素的大小变化，发生变化时从步骤一从新开始执行

## 开始学习

直接放源码

```ts
// vue-demi ---> 兼容 vue2 / vue3
import { watch, Ref, ref, computed } from 'vue-demi'
import { useElementSize } from '../useElementSize'

export interface UseVirtualListOptions {
  itemHeight: number | ((index: number) => number) // 每条数据的高度
  overscan?: number // 视图区域外的额外缓冲区项, 默认 5 条
}

export function useVirtualList<T = any>(
  list: T[],  // 用户传进来的数据列表
  options: UseVirtualListOptions // 用户配置项
) {
  // 当前列表外层盒子
  const containerRef: Ref = ref<HTMLElement | null>()
  // useElementSize 监听 window 的大小变化，具体可以看 vueuse 的 useResizeObserver
  const size = useElementSize(containerRef)
  // 实际渲染的数据列表
  const currentList: Ref = ref([])
  // 记录状态
  const state: Ref = ref({
    start: 0,  // 开始渲染的数据下标
    end: 10    // 结束渲染的数据下标
  })

  // itemHeight: 每一列的高度
  // overscan： 上下缓冲区的数量，默认 5 条
  const { itemHeight, overscan = 5 } = options

  // 如果传入的数据没有 itemHeight 属性就警告
  if (!itemHeight) console.warn('please enter a valid itemHeight')

  // 计算可视区域的最大容纳量
  const getViewCapacity = (containerHeight: number) => {
    // 如果传入的 itemHeight 是 number 类型
    if (typeof itemHeight === 'number') {
      // 实际视图最大渲染数量 == 当前盒子高度 / 每一列的高度， 并向上取整
      return Math.ceil(containerHeight / itemHeight)
    }

    // 如果 itemHeight 是个函数，说明不同数据行的高度是不一致的
    const { start = 0 } = state.value
    let sum = 0
    let capacity = 0
    for (let i = start; i < list.length; i++) {
      // 如果数据是动态高度的
      const height = (itemHeight as (index: number) => number)(i)
      sum += height
      // 加起来高度大于可视区域的高度
      if (sum >= containerHeight) {
        capacity = i
        break
      }
    }
    // 实际视图最大渲染数量 = 结束下标 - 开始下标
    return capacity - start
  }

  // 获取元素 scrollTop 可容纳的数据量，用于计算实际渲染的初始下标
  const getOffset = (scrollTop: number) => {
    if (typeof itemHeight === 'number')
      // Math.floor 向下取整
      return Math.floor(scrollTop / itemHeight) + 1

    let sum = 0
    let offset = 0

    // 从数据的第 0 项开始累加，当累加高度大于等于 scrollTop，
    // 说明最后加上去的这一项数据已经处于可视区域了
    // 那么它的下标就是开始下标
    for (let i = 0; i < list.length; i++) {
      const height = (itemHeight as (index: number) => number)(i)
      sum += height
      if (sum >= scrollTop) {
        offset = i
        break
      }
    }
    return offset + 1
  }

  // 获取实际渲染数据
  const calculateRange = () => {
    const element = containerRef.value
    if (element) {
      // 视图区域之上被隐藏的数据量
      const offset = getOffset(element.scrollTop)
      // 视图所能容纳的最大数据量
      const viewCapacity = getViewCapacity(element.clientHeight)
      // 开始坐标 = 视图区域之上被隐藏的数据量 - 缓冲区的数据量
      const from = offset - overscan
      // 结束坐标 = 视图区域之上被隐藏的数据量 + 视图所能容纳的最大数据量 + 缓冲区的数据量
      const to = offset + viewCapacity + overscan

      // 计算当前实际渲染列表的上下坐标（注意边界处理）
      state.value = {
        start: from < 0 ? 0 : from,
        end: to > list.length ? list.length : to,
      }

      // 裁剪出实际渲染的数据 （到这一步，可视区域的上下放各有 5（默认值）条数据的缓冲区）
      currentList.value = list.slice(state.value.start, state.value.end).map((ele, index) => ({
        data: ele,
        index: index + state.value.start,
      }))
    }
  }
  // 外层盒子高度或宽度发生变化时，重新计算实际渲染数据
  watch([size.width, size.height], () => {
    calculateRange()
  })

  // 计算整个盒子的高度
  const totalHeight = computed(() => {
    // 如果 itemHeight 是 number，说明每一列数据的高度都一样，那么整个盒子的高度 = 每一个子项的高度 * 子项的数量
    if (typeof itemHeight === 'number') return list.length * itemHeight

    // 如果传进来的是函数，那么累加起来
    return list.reduce((sum, _, index) => sum + itemHeight(index), 0)
  })

  // 计算可视区域列表的 marginTop
  const getDistanceTop = (
    index: number // 开始渲染的位置下标
  ) => {
    if (typeof itemHeight === 'number') {
      const height = index * itemHeight
      return height
    }
    const height = list.slice(0, index).reduce((sum, _, i) => sum + itemHeight(i), 0)
    return height
  }

  // 列表滚动重新计算
  const scrollTo = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollTop = getDistanceTop(index)
      calculateRange()
    }
  }

  const offsetTop = computed(() => getDistanceTop(state.value.start))

  // 外层盒子的样式
  const wrapperProps = computed(() => {
    return {
      style: {
        width: '100%',
        height: `${totalHeight.value - offsetTop.value}px`, // 动态修改盒子高度
        marginTop: `${offsetTop.value}px`, // 计算 margin-top
      },
    }
  })

  const containerStyle: Partial<CSSStyleDeclaration> = { overflowY: 'auto' }

  return {
    list: currentList,
    scrollTo,
    containerProps: { // 外层盒子
      ref: containerRef, // 用于绑定外层盒子
      onScroll: () => { // 外层盒子滚动事件
        calculateRange()
      },
      style: containerStyle, // 外层盒子的样式
    },
    wrapperProps, // 外层盒子的样式
  }
}
```

## 实际使用

```html
<script setup lang="ts">
  import type { Ref } from 'vue'
  import { computed, ref } from 'vue'
  import { useVirtualList } from '@vueuse/core'

  const index: Ref = ref()
  const search = ref('')

  const allItems = Array.from(Array(99999).keys()).map((i) => ({
    height: i % 2 === 0 ? 42 : 84,
    size: i % 2 === 0 ? 'small' : 'large',
  }))

  const filteredItems = computed(() => {
    return allItems.filter((i) => i.size.startsWith(search.value.toLowerCase()))
  })

  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(filteredItems, {
    itemHeight: (i) => filteredItems.value[i].height + 8,
    overscan: 10,
  })
  const handleScrollTo = () => {
    scrollTo(index.value)
  }
</script>

<template>
  <div>
    <div>
      <div class="inline-block mr-4">
        Jump to index
        <input v-model="index" placeholder="Index" type="number" />
      </div>
      <button type="button" @click="handleScrollTo">Go</button>
    </div>
    <div>
      <div class="inline-block mr-4">
        Filter list by size
        <input v-model="search" placeholder="e.g. small, medium, large" type="search" />
      </div>
    </div>
    <div v-bind="containerProps" class="h-300px overflow-auto p-2 bg-gray-500/5 rounded">
      <div v-bind="wrapperProps">
        <div
          v-for="{ index, data } in list"
          :key="index"
          class="border border-$c-divider mb-2"
          :style="{
						height: `${data.height}px`,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}">
          Row {{ index }}
          <span opacity="70" m="l-1"> ({{ data.size }}) </span>
        </div>
      </div>
    </div>
  </div>
</template>
```

> 可以看到 useVirtualList 对于高度确定的数据来说，已经实现了虚拟渲染的能力了，但是对于高度不固定，比如列表行高度由中图片或其他元素时的高度确定时，这个方法就不太好用了

## 对不确定高度的列表如何使用

- [「前端进阶」高性能渲染十万条数据(虚拟列表)](https://juejin.cn/post/6844903982742110216#heading-0)

