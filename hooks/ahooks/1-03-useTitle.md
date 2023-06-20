<!--
 * @Author: HfWang
 * @Date: 2023-06-05 09:09:11
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 19:25:00
 * @FilePath: \code\whf-hooks-analysis\hooks\ahooks\1-03-useTitle.md
-->

# useTitle

> 用于设置页面标题

- [useTitle 文档](https://ahooks.js.org/zh-CN/hooks/use-title)

## 武功秘籍

```ts{14-15,21-23,27-32}
import { useEffect, useRef } from 'react';
import useUnmount from '../useUnmount';
import isBrowser from '../utils/isBrowser';

export interface Options {
	restoreOnUnmount?: boolean;
}

const DEFAULT_OPTIONS: Options = {
	restoreOnUnmount: false,
};

function useTitle(
  title: string,
  options: Options = DEFAULT_OPTIONS
) {
	// 如果是浏览器，浏览器标签 title 的默认值就是传进来的值，
	// 如果是 node 端，则为空
	const titleRef = useRef(isBrowser ? document.title : '');
	// 闯进来的 title 发生变化就修改标签 title
	useEffect(() => {
		document.title = title;
	}, [title]);

	// useUnmount 组件卸载时执行，后面有分析，
	// 这里知道这个自定义 hooks 的执行时机就行
	useUnmount(() => {
		// 组件卸载时重置标题为初始标题
		if (options.restoreOnUnmount) {
			document.title = titleRef.current;
		}
	});
}

export default useTitle;
```

## 使用场景
