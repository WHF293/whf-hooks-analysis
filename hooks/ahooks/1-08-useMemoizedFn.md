<!--
 * @Author: HfWang
 * @Date: 2023-06-12 09:46:29
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 19:41:01
 * @FilePath: \code\whf-hooks-analysis\hooks\ahooks\1-08-useMemoizedFn.md
-->

# useMemoizedFn

> - 在某些场景中，我们需要使用 useCallback 来记住一个函数，但是在第二个参数 deps 变化时，会重新生成函数，导致函数地址变化
> - 使用 useMemoizedFn，可以省略第二个参数 deps，同时保证函数地址永远不会变化。

- [useMemoizedFn 文档](https://ahooks.js.org/zh-CN/hooks/use-memoized-fn)

## 源码

和 useLaster 一样，内部都是使用 useRef 实现的

```ts
import { useMemo, useRef } from 'react';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
	this: ThisParameterType<T>,
	...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
	// 处于开发环境时的提示
	if (isDev) {
		if (!isFunction(fn)) {
			console.error(
				`useMemoizedFn expected parameter is a function, got ${typeof fn}`
			);
		}
	}

	const fnRef = useRef<T>(fn);

	// 这里为什么不直接写 fnRef.current = fn ？
	// 原因：
	// https://github.com/alibaba/hooks/issues/728
	// github 上大佬的解答：兼容 react-devtools，react devtool inspect 组件时会进行 shallow render，并且替换所有 hooks 为 mock hooks, 用来获取 hook 信息。这就会导致在选中时，触发 render，并且因为在 render 中修改 ref，导致 ref.current 被替换成 devtool mock 的空函数（无法触发更新）。但是用 useMemo 包一层，mock useMemo 会始终返回组件正常 render 时的 memorized value，也就不会破坏原有的功能了
	// 好吧。。。。。。大佬们都这么牛的吗
	fnRef.current = useMemo(() => fn, [fn]);

	const memoizedFn = useRef<PickFunction<T>>();

	if (!memoizedFn.current) {
		memoizedFn.current = function (this, ...args) {
			return fnRef.current.apply(this, args);
		};
	}

	return memoizedFn.current as T;
}

export default useMemoizedFn;
```

## 使用

useMemoizedFn 和 useCallback 都能缓存函数，那他们两的区别是什么？

如下例子，在 count 发生变化时，callbackFn 会创建新的函数地址，但是 memoizedFn 则永远不会产生新的函数地址

- `useMemoizedFn 持久化缓存函数`
- `useCallback 在 deps 不变时，持久化缓存函数`

```js
const [count, setCount] = useState(0);

const callbackFn = useCallback(() => {
	message.info(`Current count is ${count}`);
}, [count]);

const memoizedFn = useMemoizedFn(() => {
	message.info(`Current count is ${count}`);
});
```
