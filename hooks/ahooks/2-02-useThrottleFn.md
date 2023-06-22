# useThrottleFn + useDebounceFn

> useThrottleFn: 用来处理函数节流的 Hook。
>
> useDebounceFn: 用来处理防抖函数的 Hook。

- [useThrottleFn 文档](https://ahooks.js.org/zh-CN/hooks/use-throttle-fn)
- [useDebounceFn 文档](https://ahooks.js.org/zh-CN/hooks/use-debounce-fn)
- [lodash-throttle 文档](https://www.lodashjs.com/docs/lodash.throttle)
- [lodash-debounce 文档](https://www.lodashjs.com/docs/lodash.debounce)

防抖、节流是前端最基础的一块知识，也是日常开发中经常使用到的

loadsh、 underscore 等工具库更是已经为我们提供了功能更加完善的防抖节流函数

所以无论是 ahooks、react-use 还是 vueuse，它们封装的防抖节流 hooks 都是基于 lodash 提供的

而我们日常开发中最常见的需要防抖节流的场景

- 函数节流/防抖：比如按钮点击操作
- 值节流/防抖：比如输入框里面的值

## 武功秘籍

引入和类型声明

:::code-group
```ts [useThrottleFn]{1,8-12}
import throttle from "lodash/throttle";
import { useMemo } from "react";
import useLatest from "../useLatest";
import useUnmount from "../useUnmount";
import { isFunction } from "../utils";
import isDev from "../utils/isDev";

export interface ThrottleOptions {
	wait?: number;
	leading?: boolean;
	trailing?: boolean;
}

type noop = (...args: any[]) => any;
```

```ts [useDebounceFn]{1,8-13}
import debounce from "lodash/debounce";
import { useMemo } from "react";
import useLatest from "../useLatest";
import useUnmount from "../useUnmount";
import { isFunction } from "../utils";
import isDev from "../utils/isDev";

export interface DebounceOptions {
	wait?: number;
	leading?: boolean;
	trailing?: boolean;
	maxWait?: number;
}

type noop = (...args: any[]) => any;
```
:::

具体实现

:::code-group

```ts [useThrottleFn]{16-37}
function useThrottleFn<T extends noop>(
	fn: T, // 需要节流的函数
	options?: ThrottleOptions // 配置项
) {
	// 开发环境提示
	if (isDev) {
		if (!isFunction(fn)) {
			console.error(
				`useThrottleFn expected parameter
        is a function, got ${typeof fn}
      `
			);
		}
	}

	// 使用 useLatest(useRef) 封装 fn，包装每次调用的函数地址不会发生变化
	const fnRef = useLatest(fn);
	// 节流默认时间 1s
	const wait = options?.wait ?? 1000;
	// 使用 useMemo 缓存经过包装的节流函数
	const throttled = useMemo(
		() =>
			// 调用 loadsh 的节流函数
			throttle(
				(...args: Parameters<T>): ReturnType<T> => {
					return fnRef.current(...args);
				},
				wait,
				options
			),
		[]
	);

	// 组件卸载
	useUnmount(() => {
		throttled.cancel();
	});

	return {
		run: throttled, // 节流函数
		cancel: throttled.cancel, // 终端节流函数操作
		flush: throttled.flush,
	};
}

export default useThrottleFn;
```

```ts [useDebounceFn]{1,27-43}
function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
	if (isDev) {
		if (!isFunction(fn)) {
			console.error(`
        useDebounceFn expected parameter
        is a function, got ${typeof fn}
      `);
		}
	}

	const fnRef = useLatest(fn);
	const wait = options?.wait ?? 1000;
	const debounced = useMemo(
		() =>
			debounce(
				(...args: Parameters<T>): ReturnType<T> => {
					return fnRef.current(...args);
				},
				wait,
				options
			),
		[]
	);

	useUnmount(() => {
		debounced.cancel();
	});

	return {
		run: debounced,
		cancel: debounced.cancel,
		flush: debounced.flush,
	};
}

export default useDebounceFn;
```

:::

## 使用

大侠我懒了，你们自己取官网看吧
