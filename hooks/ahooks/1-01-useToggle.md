<!--
 * @Author: HfWang
 * @Date: 2023-05-29 19:43:37
 * @LastEditors: HfWang
 * @LastEditTime: 2023-06-05 09:06:00
 * @FilePath: \hooks-analysis\hooks\ahooks\01-useToggle.md
-->

# useToggle

> 用于在两个状态值间切换的 Hook

- [useToggle 文档](https://ahooks.js.org/zh-CN/hooks/use-toggle)

## 使用

```ts
const [state, { toggle, setLeft, setRight }] = useBoolean(true);
```

## 武功秘籍

```ts{3-8,17-18,24-26,41-44}
import { useMemo, useState } from 'react';

export interface Actions<T> {
	setLeft: () => void;
	setRight: () => void;
	set: (value: T) => void;
	toggle: () => void;
}

function useToggle<T = boolean>(): [boolean, Actions<T>];
function useToggle<T>(defaultValue: T): [T, Actions<T>];
function useToggle<T, U>(
	defaultValue: T,
	reverseValue: U
): [T | U, Actions<T | U>];
function useToggle<D, R>(
	defaultValue: D = false as unknown as D, // 默认值
	reverseValue?: R // 默认值反转后的值
) {
	const [state, setState] = useState<D | R>(defaultValue);
  // 使用 useMemo 对 action 进行缓存
	const actions = useMemo(() => {
		// 反转值
		const reverseValueOrigin = (
			reverseValue === undefined ? !defaultValue : reverseValue
		) as D | R;
		// 值反转切换
		const toggle = () =>
			setState(s => (s === defaultValue
        ? reverseValueOrigin
        : defaultValue
      ));
		// 根据传进来的 value 设置
		const set = (value: D | R) => setState(value);
		// 设置为默认值
		const setLeft = () => setState(defaultValue);
		// 设置为默认值的反转值
		const setRight = () => setState(reverseValueOrigin);

		return {
			toggle,
			set,
			setLeft,
			setRight,
		};
	}, []);

	return [state, actions];
}

export default useToggle;
```

使用场景

1. 主题切换，假设现在有 dark 和 light 两个主题：

```ts
const [theme, { toggle, setLeft, setRight }] = useToggle('dark', 'light');
```
