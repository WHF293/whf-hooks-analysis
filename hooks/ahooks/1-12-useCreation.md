<!--
 * @Author: wanghaofeng
 * @Date: 2023-06-21 10:07:12
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-21 10:12:52
 * @FilePath: \whf-hooks-analysis\hooks\ahooks\1-12-useCreation.md
-->

# useCreation

> useCreation 是 useMemo 或 useRef 的替代品

- [useCreation 文档](https://ahooks.js.org/zh-CN/hooks/use-creation)

## 武功秘籍

```ts
import type { DependencyList } from 'react';
import { useRef } from 'react';
import depsAreSame from '../utils/depsAreSame';

export default function useCreation<T>(
	factory: () => T, // 函数，返回要持久化缓存的结果
	deps: DependencyList // 依赖项
) {
	const { current } = useRef({
		deps, // 依赖项
		obj: undefined as undefined | T, // 需要持久化缓存的值
		initialized: false, // 是否是第一次加载
	});

	// 第一次加载或者是依赖项发生变化才执行里面的代码
	if (current.initialized === false || !depsAreSame(current.deps, deps)) {
		current.deps = deps; // 跟新依赖项
		current.obj = factory(); // 更新缓存的值
		current.initialized = true; // 修改状态为非第一次加载
	}
	return current.obj as T;
}
```

- [depsaresame 原理](./4-01-工具函数.html#depsaresame)
