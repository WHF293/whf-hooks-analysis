# createUseStorageState

## 源码

类型声明和导入

```ts
import { useState } from 'react';
import useMemoizedFn from '../useMemoizedFn'; // 函数缓存
import useUpdateEffect from '../useUpdateEffect'; // 组件跟新时才执行的 effect
import { isFunction, isUndef } from '../utils';

export interface IFuncUpdater<T> {
	(previousState?: T): T;
}
export interface IFuncStorage {
	(): Storage;
}

export interface Options<T> {
	// 自定义序列化方法, 默认使用 JSON.stringify
	serializer?: (value: T) => string;
	// 自定义反序列化方法，默认使用 JSON.parse
	deserializer?: (value: string) => T;
	// 默认值
	defaultValue?: T | IFuncUpdater<T>;
	// 错误回调
	onError?: (error: unknown) => void;
}
```

createUseStorageState

```ts{25-28,33-36,70-81,84}
export function createUseStorageState(
	// localStorage 或者 sessionStorage
	getStorage: () => Storage | undefined
) {
	function useStorageState<T>(
		key: string, // 保存到 storage 中的 key
		options: Options<T> = {}
	) {
		let storage: Storage | undefined;
		const {
			onError = (e) => {
				console.error(e);
			},
		} = options;

		// https://github.com/alibaba/hooks/issues/800
		try {
			storage = getStorage();
		} catch (err) {
			onError(err);
		}

		// 序列化要保存的数据
		const serializer = (value: T) => {
			if (options?.serializer) {
				return options?.serializer(value);
			}
			return JSON.stringify(value);
		};

		// 反序列化要保存的数据
		const deserializer = (value: string): T => {
			if (options?.deserializer) {
				return options?.deserializer(value);
			}
			return JSON.parse(value);
		};

		// 从 storage 中取出值
		function getStoredValue() {
			try {
				const raw = storage?.getItem(key);
				if (raw) {
					return deserializer(raw);
				}
			} catch (e) {
				onError(e);
			}
			if (isFunction(options?.defaultValue)) {
				return options?.defaultValue();
			}
			// 组件初次挂载时，如果从 storage 获取不到对应的 key 的话，返回默认值
			return options?.defaultValue;
		}

		// state 默认值通过调用 getStoredValue 函数获取
		const [state, setState] = useState(() => getStoredValue());

		// 组件的 key 更新，调用 getStoredValue 函数获取
		useUpdateEffect(() => {
			setState(getStoredValue());
		}, [key]);

		// 更新 state 和 storage 中的数据
		const updateState = (value?: T | IFuncUpdater<T>) => {
			// 获取最新的值，判断传入的是不是函数，如果是，执行函数，取函数的返回值
			const currentState = isFunction(value) ? value(state) : value;
			setState(currentState);

			if (isUndef(currentState)) {
				// 如果要保存的值时 undefinded，从 storage 移除对应的 key-value
				// 这里应该时为了兼容 SSR 的场景
				storage?.removeItem(key);
			} else {
				try {
					// 保存数据
					storage?.setItem(key, serializer(currentState));
				} catch (e) {
					console.error(e);
				}
			}
		};

		return [state, useMemoizedFn(updateState)] as const;
	}
	return useStorageState;
}
```
