<!--
 * @Author: wanghaofeng
 * @Date: 2023-06-12 09:45:56
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 19:34:31
 * @FilePath: \code\whf-hooks-analysis\hooks\ahooks\1-06-useUnmount.md
-->
# useUnmount

> 在组件卸载（unmount）时执行的 Hook

- [useUnmount 文档](https://ahooks.js.org/zh-CN/hooks/use-unmount)

利用 useEffect 的 effect 函数返回的函数会在组件卸载时执行，相当于 componentWillUnmount

## 武功秘籍

```ts{7,20-23}
import { useEffect } from 'react';
import useLatest from '../useLatest';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

const useUnmount = (
  fn: () => void
) => {
	// 判断是不是开发环境
	if (isDev) {
		// 判断是不是函数
		if (!isFunction(fn)) {
			console.error(
        `useUnmount expected parameter
        is a function, got ${typeof fn}`
      );
		}
	}

	const fnRef = useLatest(fn);
	useEffect(() => {
		return () => fnRef.current();
	}, []);
};

export default useUnmount;
```

## 使用

```jsx
const Demo = () => {
	useUnmount(() => {
		console.log('我在组件卸载的时候执行了');
	});
	return <div>...</div>;
};
```
