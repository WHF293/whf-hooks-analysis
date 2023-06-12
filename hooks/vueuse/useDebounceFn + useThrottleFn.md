# useDebounceFn 和 useThrottleFn

:::warning 概要

1. 介绍了防抖节流的基本概念、应用场景和基本实现
2. 分析 vueuse 中 useDebounceFn 和 useThrottleFn 的源码以及如何使用
3. 对比 ahooks 中 useDebounceFn 和 useThrottleFn 的写法
:::

## 防抖节流的基本实现

- 节流: n 秒内只运行一次，若在 n 秒内重复触发，只有一次生效
- 防抖: n 秒后在执行该事件，若在 n 秒内被重复触发，则重新计时

节流

```js
function throttled2(fn, delay = 500) {
 let timer = null;
 return function (...args) {
  if (!timer) {
   timer = setTimeout(() => {
    fn.apply(this, args);
    timer = null;
   }, delay);
  }
 };
}
```

防抖

```js
function debounce(func, wait) {
 let timeout;

 return function () {
  let context = this; // 保存this指向
  let args = arguments; // 拿到event对象

  clearTimeout(timeout);
  timeout = setTimeout(function () {
   func.apply(context, args);
  }, wait);
 };
}
```

## vueuse 中的 useDebounceFn、useThrottleFn

### 基本使用

```html
<template>
 <button @click="debouncedFn">防抖</button>
 <button @click="throttledFn">节流</button>
</template>

<script setup>
 import { useDebounceFn, useThrottleFn } from "@vueuse/core";

 // 防抖
 const debouncedFn = useDebounceFn(() => {
  // do something
 }, 1000);

 // 节流
 const throttledFn = useThrottleFn(() => {
  // do something
 }, 1000);
</script>
```

### 源码分析

1. 节流

```ts
import { createFilterWrapper, FunctionArgs, throttleFilter, MaybeRef } from "../utils";

export function useThrottleFn<T extends FunctionArgs>(fn: T, ms: MaybeRef<number> = 200, trailing = true): T {
return createFilterWrapper(throttleFilter(ms, trailing), fn);
}
```

找到 utils 里的东西

```ts
export type FunctionArgs<Args extends any[] = any[], Return = void> = (...args: Args) => Return;

export type MaybeRef<T> = T | Ref<T>;

export function createFilterWrapper<T extends FunctionArgs>(filter: EventFilter, fn: T) {
function wrapper(this: any, ...args: any[]) {
  filter(() => fn.apply(this, args), { fn, thisArg: this, args });
}

return wrapper as any as T;
}

export function throttleFilter(ms: MaybeRef<number>, trailing = true) {
  let lastExec = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    if (timer) {
    clearTimeout(timer);
    timer = undefined;
    }
  };

  const filter: EventFilter = (invoke) => {
    const duration = unref(ms);
    const elapsed = Date.now() - lastExec;

    clear();

    if (duration <= 0) {
      lastExec = Date.now();
      return invoke();
    }

    if (elapsed > duration) {
      lastExec = Date.now();
      invoke();
    } else if (trailing) {
      timer = setTimeout(() => {
        lastExec = Date.now();
        clear();
        invoke();
      }, duration);
    }
  };

  return filter;
}
```
