<!--
 * @Author: HfWang
 * @Date: 2023-06-12 09:54:36
 * @LastEditors: HfWang
 * @LastEditTime: 2023-06-12 09:55:09
 * @FilePath: \code\hooks-analysis\hooks\ahooks\2-03-useThrottleEffect.md
-->

# useThrottleEffect +

> useThrottleEffect: 为 useEffect 增加节流的能力。
>
> useDebounceEffect: 为 useEffect 增加防抖的能力

- [useThrottleEffect 文档](https://ahooks.js.org/zh-CN/hooks/use-throttle-effect)
- [useDebounceEffect 文档](https://ahooks.js.org/zh-CN/hooks/use-debounce-effect)

内部实现其实就是使用 useThrottleFn/useDebounceFn 对 useEffect 里面的 effect 函数进行处理

## 武功秘籍

### useThrottleEffect

```ts
import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import type { ThrottleOptions } from '../useThrottle/throttleOptions';
import useThrottleFn from '../useThrottleFn';
import useUpdateEffect from '../useUpdateEffect';

function useThrottleEffect(
	effect: EffectCallback,
	deps?: DependencyList,
	options?: ThrottleOptions
) {
	// 用于 useUpdateEffect 判断是否更新
	const [flag, setFlag] = useState({});

	// run 函数：flag 设置为新的空对象，强制组件更新，对这部分逻辑进行节流处理
	const { run } = useThrottleFn(() => {
		setFlag({});
	}, options);

	useEffect(() => {
		// deps 发生变化，执行节流函数
		return run();
	}, deps);

	// 组件挂载不会执行 effect 函数，组件跟新时执行 effect 函数（flag 会发生变化的更新）
	useUpdateEffect(effect, [flag]);
}

export default useThrottleEffect;
```

### useDebounceEffect

同上，不分析

```ts
import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import type { DebounceOptions } from '../useDebounce/debounceOptions';
import useDebounceFn from '../useDebounceFn';
import useUpdateEffect from '../useUpdateEffect';

function useDebounceEffect(
	effect: EffectCallback,
	deps?: DependencyList,
	options?: DebounceOptions
) {
	const [flag, setFlag] = useState({});

	const { run } = useDebounceFn(() => {
		setFlag({});
	}, options);

	useEffect(() => {
		return run();
	}, deps);

	useUpdateEffect(effect, [flag]);
}

export default useDebounceEffect;
```

## 使用

略
