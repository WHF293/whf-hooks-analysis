<!--
 * @Author: HfWang
 * @Date: 2023-06-12 09:58:31
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-12 13:15:24
 * @FilePath: \code\hooks-analysis\hooks\ahooks\2-05-useUpadteEffect.md
-->
# useUpdateEffect

> 作用：useUpdateEffect 和 useUpdateLayoutEffect 的用法跟 useEffect 和 useLayoutEffect 一样，只是会 `忽略首次执行，只在依赖更新时执行`。

```ts
// useUpdateEffect
import { useEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

export default createUpdateEffect(useEffect);
```

## createUpdateEffect

> 用于封装 `useUpdateEffect` 和 `useUpdateLayoutEffect`

```ts
import { useRef } from 'react';
import type { useEffect, useLayoutEffect } from 'react';

type EffectHookType = typeof useEffect | typeof useLayoutEffect;
type CreateUpdateEffect = (hook: EffectHookType) => EffectHookType;

export const createUpdateEffect: CreateUpdateEffect =
	hook => (effect, deps) => {
		// 用于标识是否是第一次进入
		const isMounted = useRef(false);

		// hook 其实就是 useEffect / useLayoutEffect
		hook(() => {
      // 组件卸载，修改挂载状态
			return () => {
				isMounted.current = false;
			};
		}, []);

		hook(() => {
			// 初次进入，将 isMounted 设置为 true，并且不执行 effect
			if (!isMounted.current) {
				isMounted.current = true;
			} else {
				// 之后进入的时候就会执行 effect，从而达到第一次进入时不渲染
				return effect();
			}
		}, deps);
	};

export default createUpdateEffect;
```

## useUpdateLayoutEffect

```ts
// useUpdateLayoutEffect
import { useLayoutEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

export default createUpdateEffect(useLayoutEffect);
```
