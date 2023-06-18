<!--
 * @Author: HfWang
 * @Date: 2023-06-12 09:57:21
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 19:42:53
 * @FilePath: \code\whf-hooks-analysis\hooks\ahooks\1-09-useLockFn.md
-->

# useLockFn

> 用于给一个异步函数增加竞态锁，防止并发执行

- [useLockFn](https://ahooks.js.org/zh-CN/hooks/use-lock-fn)

:::tip
不建议使用这个 hooks，对于接口请求来说，如果使用的时 axios，那么可以使用 axios 的请求拦截进行拦截，或者使用 ahooks 的 useRequest，除了极少部分的场景外，这种防止并发操作的方式还有很多
:::

## 源码

```ts{4,7-27}
import { useRef, useCallback } from 'react';

function useLockFn<P extends any[] = any[], V extends any = any>(
	fn: (...args: P) => Promise<V>
) {
	// 加锁的标识
	const lockRef = useRef(false);

	return useCallback(
		async (...args: P) => {
			// 如果被锁，直接 return
			if (lockRef.current) return;
			// 若处于未被锁住的状态，则设置为被锁住状态
			lockRef.current = true;

			// 让后执行相关操作，无论操作成功还是失败，在执行操作后都解锁
			try {
				const ret = await fn(...args);
				lockRef.current = false;
				return ret;
			} catch (e) {
				lockRef.current = false;
				throw e;
			}
		},
		[fn]
	);
}

export default useLockFn;
```

## 使用

直接参考官网就行

```jsx
const submit = useLockFn(async () => {
	message.info('Start to submit');
	await mockApiRequest();
	setCount(val => val + 1);
	message.success('Submit finished');
});
```
