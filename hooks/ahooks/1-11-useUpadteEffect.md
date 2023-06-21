# useUpdateEffect + useLayoutUpdateEffect

> useUpdateEffect 用法等同于 useEffect，但是会忽略首次执行，只在依赖更新时执行
>
> useUpdateLayoutEffect 用法等同于 useLayoutEffect，但是会忽略首次执行，只在依赖更新时执行。

- [useUpdateEffect 文档](https://ahooks.js.org/zh-CN/hooks/use-update-effect)
- [useLayoutUpdateEffect 文档](https://ahooks.js.org/zh-CN/hooks/use-update-layout-effect)

## 武功秘籍

:::code-group

```ts [useUpdateEffect]{4}
import { useEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

export default createUpdateEffect(useEffect);
```

```ts [useLayoutUpdateEffect]{4}
import { useLayoutEffect } from 'react';
import { createUpdateEffect } from '../createUpdateEffect';

export default createUpdateEffect(useLayoutEffect);
```
:::


从源码可以看出，这两个 hooks 都是使用 createUpdateEffect 创建的

### createUpdateEffect

```ts{14-16,20-26}
import { useRef } from 'react';
import type { useEffect, useLayoutEffect } from 'react';

type EffectHookType = typeof useEffect | typeof useLayoutEffect;

export const createUpdateEffect = hook => {
	return (effect, deps) => {
    // 组件状态标识: 用于判断组件是不是第一次挂载
		const isMounted = useRef(false);

		// for react-refresh
		hook(() => {
      // 组件卸载修改组件状态标识
			return () => {
				isMounted.current = false;
			};
		}, []);

		hook(() => {
      // 组件初次加载，修改组件状态标识
			if (!isMounted.current) {
				isMounted.current = true;
			} else {
        // 之组件跟新执行 effect，从而达到第一次进入时不渲染
				return effect();
			}
		}, deps);
	};
} as (
	hook: EffectHookType // useEffect 或者 useLayoutEffect
) => EffectHookType;

export default createUpdateEffect;
```

