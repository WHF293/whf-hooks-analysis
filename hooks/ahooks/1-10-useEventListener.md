<!--
 * @Author: HfWang
 * @Date: 2023-06-12 10:21:33
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 19:46:01
 * @FilePath: \code\whf-hooks-analysis\hooks\ahooks\1-10-useEventListener.md
-->

# useEventListener

> 优雅的使用 addEventListener。

- [useEventListener](https://ahooks.js.org/zh-CN/hooks/use-event-listener)

## 源码

```ts
import useLatest from '../useLatest';
import type { BasicTarget } from '../utils/domTarget';
import { getTargetElement } from '../utils/domTarget';
import useEffectWithTarget from '../utils/useEffectWithTarget';

function useEventListener(
	eventName: string,
	handler: noop,
	options: Options = {}
) {
	const handlerRef = useLatest(handler);

	useEffectWithTarget(
		() => {
			const targetElement = getTargetElement(options.target, window);
			if (!targetElement?.addEventListener) {
				return;
			}

			const eventListener = (event: Event) => {
				return handlerRef.current(event);
			};

			targetElement.addEventListener(eventName, eventListener, {
				capture: options.capture,
				once: options.once,
				passive: options.passive,
			});

			return () => {
				targetElement.removeEventListener(eventName, eventListener, {
					capture: options.capture,
				});
			};
		},
		[eventName, options.capture, options.once, options.passive],
		options.target
	);
}
```
