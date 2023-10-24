# useRequest

:::warning 提示
待完善
:::

参考：

- [ahooks - useRequest 文档](https://ahooks.js.org/zh-CN/hooks/use-request/index)
- [ahooks - useRequest 核心原理解析](https://gpingfeng.github.io/ahooks-analysis/hooks/request/use-request)

## 前言

在学习 useRequest 的源码之前，有两点要求：

1. 必须先把 ahooks 中关于 useRequest 的文档先熟悉一下
2. 必须先了解下 ahooks 里面的这几个自定义 hooks

:::tip

- useCreation：useCreation 是 useMemo 或 useRef 的替代品。
- useLatest：返回当前最新值的 Hook。
- useMemoizedFn：持久化 function 的 Hook，理论上，可以代替 useCallback。
- useMount：组件初始化时执行的 Hook。
- useUnmount：组件卸载时执行的 Hook。
- useUpdate：返回一个函数，调用该函数会强制组件重新渲染。
- useUpdateEffect: 用法等同于 useEffect，但是会忽略首次执行，只在依赖更新时执行
  :::

---

另外就是 useRequest 大致的架构设计

:::tip
- src
  - plugins
  - utils
  - useRequest.ts
  - useRequestImplement.ts
  - Fetch.ts
- index.ts
:::

![](https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/202310242249414.png)


---

## 源码学习

源码的学习可以拆分为 4 部分:

- useRequest
- useRequestImplement
- Fetch
- plugins

### useRequest

```typescript
// useRequest/index.ts
import useRequest from './src/useRequest';
import { clearCache } from './src/utils/cache';

export { clearCache };

export default useRequest;
```

可以看到，useRequest 对外暴露了两个东西

- useRequest：请求策略
- clearCache：缓存清理（后面讲 useRequest 怎么实现缓存的时候再细说）

所以我们看看 src/useRequest.ts 这个文件又实现了些什么？

```typescript
// useRequest/src/useRequest.ts
import useAutoRunPlugin from './plugins/useAutoRunPlugin';
import useCachePlugin from './plugins/useCachePlugin';
import useDebouncePlugin from './plugins/useDebouncePlugin';
import useLoadingDelayPlugin from './plugins/useLoadingDelayPlugin';
import usePollingPlugin from './plugins/usePollingPlugin';
import useRefreshOnWindowFocusPlugin from './plugins/useRefreshOnWindowFocusPlugin';
import useRetryPlugin from './plugins/useRetryPlugin';
import useThrottlePlugin from './plugins/useThrottlePlugin';
import type { Options, Plugin, Service } from './types';
import useRequestImplement from './useRequestImplement';

function useRequest<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams>,
  plugins?: Plugin<TData, TParams>[],
) {
  return useRequestImplement<TData, TParams>(
     service,
      options,
      [
        // 插件列表，用来拓展功能，一般用户不使用。文档中没有看到暴露 API
        ...(plugins || []),
        useDebouncePlugin,
        useLoadingDelayPlugin,
        usePollingPlugin,
        useRefreshOnWindowFocusPlugin,
        useThrottlePlugin,
        useAutoRunPlugin,
        useCachePlugin,
        useRetryPlugin,
      ] as Plugin<TData, TParams>[]);
  )
}

export default useRequest;

```

从 useRequest 函数实现可以看到，useRequest 函数接受 3 个茶树

- service：用户传入的异步函数，一般是用户封装的请求接口数据的函数
- options：用户传入的配置，用于设置是否轮询、防抖、节流、缓存数据、错误重试等操作
- plugins：插件系统，实现 options 传入配置的功能，支持自定义插件，但是官方文档没有暴露这个参数，也没说插件的实现需要那些必须的属性，估计是不希望用户去实现自定义插件

所以接下来重点就是看 useRequestImplement 这个函数了

---

### useRequestImplement

直接看源码

```typescript
import useCreation from '../../useCreation';
import useLatest from '../../useLatest';
import useMemoizedFn from '../../useMemoizedFn';
import useMount from '../../useMount';
import useUnmount from '../../useUnmount';
import useUpdate from '../../useUpdate';
import isDev from '../../utils/isDev';

import Fetch from './Fetch';
import type { Options, Plugin, Result, Service } from './types';

function useRequestImplement<TData, TParams extends any[]>(
	service: Service<TData, TParams>,
	options: Options<TData, TParams> = {},
	plugins: Plugin<TData, TParams>[] = []
) {
	const { manual = false, ...rest } = options;

	if (isDev) {
		// 忽略，开发阶段的一些错误提示
	}

	const fetchOptions = {
		manual,
		...rest,
	};

	// 缓存传入的异步请求函数
	const serviceRef = useLatest(service);

	// useUpdate 返回一个函数，调用函数，组件强制更新
	const update = useUpdate();

	// useCreation 功能类似 useMemo 和 useRef
	const fetchInstance = useCreation(() => {
		const initState = plugins
      .map(p => p?.onInit?.(fetchOptions))
      .filter(Boolean);

		return new Fetch<TData, TParams>(
      serviceRef, 
      fetchOptions, 
      update, 
      Object.assign({}, ...initState)
    );
	}, []);

	fetchInstance.options = fetchOptions;
	// run all plugins hooks
	fetchInstance.pluginImpls = plugins.map(p => p(fetchInstance, fetchOptions));

	// 组件挂载时，判断是否设置手动执行，默认时组件挂载时自动执行的
	useMount(() => {
		if (!manual) {
			// useCachePlugin can set fetchInstance.state.params from cache when init
			const params = fetchInstance.state.params || options.defaultParams || [];
			// @ts-ignore
			fetchInstance.run(...params);
		}
	});

	useUnmount(() => {
		fetchInstance.cancel();
	});

	// 这里返回的内容都和 fetchInstance 有关，所以需要先看下 Fetch 类具体实现了什么
	return {
		loading: fetchInstance.state.loading,
		data: fetchInstance.state.data,
		error: fetchInstance.state.error,
		params: fetchInstance.state.params || [],
		cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)),
		refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)),
		refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)),
		run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)),
		runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)),
		mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)),
	} as Result<TData, TParams>;
}

export default useRequestImplement;
```

从代码实现来看，重点就是这几行代码，也就是怎么创建一个 Fetch 实例

```typescript
// useCreation 功能类似 useMemo 和 useRef
const fetchInstance = useCreation(() => {
	// 遍历插件，执行插件的 onInit 方法获取插件初始值或者默认配置
	const initState = plugins
    .map(p => p?.onInit?.(fetchOptions))
    .filter(Boolean);

  return new Fetch<TData, TParams>(
    serviceRef, 
    fetchOptions, 
    update, 
    Object.assign({}, ...initState)
  );
}, []);

fetchInstance.options = fetchOptions;
// run all plugins hooks
fetchInstance.pluginImpls = plugins.map(p => p(fetchInstance, fetchOptions));
```

---

### Fetch

从上面 new Fetch 中可以看出在实例化的时候传入了 4 个参数

- serviceRef: 处理过的用户异步请求
- fetchOptions: 用户传入的配置信息
- update：强制刷新组件的函数
- Object.assign({}, ...initState)：插件的初始值

下面先分析下 Fetch 类内部的一些方法：

#### runPluginHandler

```typescript
/*
  * event: 插件生命周期名字
  * rest：插件执行相应生命周期函数的其余参数
  * 返回所有插件执行改生命周期后返回的结果
  */
runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
  const r = this.pluginImpls.map((i) => i[event]?.(...rest)).filter(Boolean);
  return Object.assign({}, ...r);
}
```

#### runAsync

执行异步请求

```typescript
type runAsync = (...params: TParams) => Promise<TData>;
```

```typescript
async runAsync(...params: TParams): Promise<TData> {
  this.count += 1; // 当前请求次数，用于请求异常发起错误重试判断使用
  const currentCount = this.count; // 轮询和错误重试插件使用
  // 执行插件 onBefore 生命周期
  const {
    stopNow = false,
    returnNow = false,
    ...state
  } = this.runPluginHandler('onBefore', params);

  // 停止发起请求
  if (stopNow) {
    return new Promise(() => {});
  }

  this.setState({
    loading: true, // 设置当前状态为请求还未相应状态
    params,
    ...state,
  });

  // 是否在请求发起之前 return
  if (returnNow) {
    return Promise.resolve(state.data);
  }

  // 再发起真实请求前，先执行用户传入的 onBefore 函数
  this.options.onBefore?.(params);

  try {
    // 获取经过插件功能封装过的请求策略函数
    let { servicePromise } = this.runPluginHandler(
      'onRequest',
      this.serviceRef.current,
      params
    );

    // 兜底方案，如果插进封装后没有返回请求策略函数，则用户传入的异步函数就是请求策略函数
    if (!servicePromise) {
      servicePromise = this.serviceRef.current(...params);
    }

    // 发起异步请求，真正获取服务端数据的步骤
    const res = await servicePromise;

    if (currentCount !== this.count) {
      // prevent run.then when request is canceled
      return new Promise(() => {});
    }

    // 修改内部状态，将请求结果保存到 data 里面
    this.setState({
      data: res,
      error: undefined,
      loading: false,
    });

    // 执行用户传入的执行成功的回调
    this.options.onSuccess?.(res, params);
    // 执行插件数据获取成功的生命周期
    this.runPluginHandler('onSuccess', res, params);
    // 执行用户请求结束的回调
    this.options.onFinally?.(params, res, undefined);
    // 执行插件请求结束的生命周期(轮询和错误重试插件)
    if (currentCount === this.count) {
      this.runPluginHandler('onFinally', params, res, undefined);
    }

    // 最后将请求结果抛出去
    return res;
  } catch (error) {
    // 请求异常，大致实现思路同上
    if (currentCount !== this.count) {
      // prevent run.then when request is canceled
      return new Promise(() => {});
    }

    this.setState({
      error,
      loading: false,
    });

    this.options.onError?.(error, params);
    this.runPluginHandler('onError', error, params);

    this.options.onFinally?.(params, undefined, error);

    if (currentCount === this.count) {
      this.runPluginHandler('onFinally', params, undefined, error);
    }

    throw error;
  }
}

```

#### run

执行异步请求

```typescript
type run = (...params: TParams) => void;
```

```typescript
run(...params: TParams) {
  // 调用 runAsync
  this.runAsync(...params)
    .catch((error) => {
      // 异常捕获
      if (!this.options.onError) {
        console.error(error);
      }
    });
}
```

和 runAsync 相比

- run 方法没有返回值，runAsync 返回的是 promise
- run 方法帮我们捕获了异常，runAsync 没有，需要我们自己去 catch 异常

#### mutate

用户自己修改 data

```typescript
mutate(data?: TData | ((oldData?: TData) => TData | undefined)) {
  const targetData = isFunction(data) ? data(this.state.data) : data;
  this.runPluginHandler('onMutate', targetData);
  this.setState({
    data: targetData,
  });
}
```

#### 其他

```typescript
cancel() {
  this.count += 1;
  this.setState({
    loading: false,
  });

  this.runPluginHandler('onCancel');
}

refresh() {
  this.run(...(this.state.params || []));
}

refreshAsync() {
  return this.runAsync(...(this.state.params || []));
}
```

#### Fetch 类全部代码

```typescript
/* eslint-disable @typescript-eslint/no-parameter-properties */
import { isFunction } from '../../utils';
import type { MutableRefObject } from 'react';
import type { FetchState, Options, PluginReturn, Service, Subscribe } from './types';

export default class Fetch<TData, TParams extends any[]> {
	pluginImpls: PluginReturn<TData, TParams>[];

	count: number = 0;

	state: FetchState<TData, TParams> = {
		loading: false,
		params: undefined,
		data: undefined,
		error: undefined,
	};

	constructor(
		public serviceRef: MutableRefObject<Service<TData, TParams>>,
		public options: Options<TData, TParams>,
		public subscribe: Subscribe,
		public initState: Partial<FetchState<TData, TParams>> = {}
	) {
		this.state = {
			...this.state,
			loading: !options.manual,
			...initState,
		};
	}

	setState(s: Partial<FetchState<TData, TParams>> = {}) {
		this.state = {
			...this.state,
			...s,
		};
		this.subscribe();
	}

	/*
	 * event: 插件生命周期名字
	 * rest：插件执行相应生命周期函数的其余参数
	 * 返回所有插件执行改生命周期后返回的结果
	 */
	runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {
		const r = this.pluginImpls
      .map(i => i[event]?.(...rest))
      .filter(Boolean);
		return Object.assign({}, ...r);
	}

	async runAsync(...params: TParams): Promise<TData> {
		this.count += 1;
		const currentCount = this.count;

		const { 
      stopNow = false, 
      returnNow = false, 
      ...state 
    } = this.runPluginHandler('onBefore', params);

		// stop request
		if (stopNow) {
			return new Promise(() => {});
		}

		this.setState({
			loading: true,
			params,
			...state,
		});

		// return now
		if (returnNow) {
			return Promise.resolve(state.data);
		}

		this.options.onBefore?.(params);

		try {
			// replace service
			let { servicePromise } = this.runPluginHandler(
        'onRequest', 
        this.serviceRef.current, 
        params
      );

			if (!servicePromise) {
				servicePromise = this.serviceRef.current(...params);
			}

			const res = await servicePromise;

			if (currentCount !== this.count) {
				// prevent run.then when request is canceled
				return new Promise(() => {});
			}

			this.setState({
				data: res,
				error: undefined,
				loading: false,
			});

			this.options.onSuccess?.(res, params);
			this.runPluginHandler('onSuccess', res, params);

			this.options.onFinally?.(params, res, undefined);

			if (currentCount === this.count) {
				this.runPluginHandler('onFinally', params, res, undefined);
			}

			return res;
		} catch (error) {
			if (currentCount !== this.count) {
				// prevent run.then when request is canceled
				return new Promise(() => {});
			}

			this.setState({
				error,
				loading: false,
			});

			this.options.onError?.(error, params);
			this.runPluginHandler('onError', error, params);

			this.options.onFinally?.(params, undefined, error);

			if (currentCount === this.count) {
				this.runPluginHandler('onFinally', params, undefined, error);
			}

			throw error;
		}
	}

	run(...params: TParams) {
		this.runAsync(...params).catch(error => {
			if (!this.options.onError) {
				console.error(error);
			}
		});
	}

	cancel() {
		this.count += 1;
		this.setState({
			loading: false,
		});

		this.runPluginHandler('onCancel');
	}

	refresh() {
		this.run(...(this.state.params || []));
	}

	refreshAsync() {
		return this.runAsync(...(this.state.params || []));
	}

	mutate(data?: TData | ((oldData?: TData) => TData | undefined)) {
		const targetData = isFunction(data) ? data(this.state.data) : data;
		this.runPluginHandler('onMutate', targetData);
		this.setState({
			data: targetData,
		});
	}
}
```

到这，Fetch 类的内部实现基本清楚了，唯一还不知道的就是插件内部究竟实现了些什么
所以最后一部分我们就来学习插件系统的具体实现

---

### 插件系统

下面是查看所有插件后汇总的信息：

| 生命周期  | 生命周期说明   | 拥有改生命周期的插件                                                                          |
| --------- | -------------- | --------------------------------------------------------------------------------------------- |
| onInit    | 初始化时触发   | useAutoRunPlugin                                                                              |
| onBefore  | 在请求之前执行 | useAutoRunPlugin、useCachePlugin、useLoadingDelayPlugin、usePollingPlugin、useRetryPlugin     |
| onRequest | 发起请求       | useCachePlugin                                                                                |
| onSuccess | 请求成功时触发 | useCachePlugin、useRetryPlugin                                                                |
| onError   | 请求失败时触发 | useRetryPlugin                                                                                |
| onFinally | 请求完成时触发 | useLoadingDelayPlugin、usePollingPlugin                                                       |
| onCancel  | 取消请求时触发 | useDebouncePlugin、useLoadingDelayPlugin、usePollingPlugin、useRetryPlugin、useThrottlePlugin |

:::info ahooks 官方插件目前有这几个：

- useAutoRunPlugin
- useCachePlugin
- useDebouncePlugin
- useLoadingDelayPlugin
- usePollingPlugin
- useRefreshOnWindowFocusPlugin
- useRetryPlugin
- useThrottlePlugin
  :::
  所以，插件系统的学习有两条路线

- 按照生命周期顺序学习
- 一个一个插件学习

那到底用那种方式来学习插件系统比较好呢 ？

那我们就必须先知道 useRequest 的插件到底是什么 ？

结合上面表格插件的命名方式，我们可以推测每一个插件，其实是一个自定义 hooks，结合前面 Fetch 类里面说到的 runPluginHandler 方法是去执行插件的生命周期函数，所以我们可以知道

> useRequest 的插件其实就是一个自定义 hooks，这个 hooks 返回若干个符合 useRequest 要求的插件生命周期的对象

让我们回到 useRequestImplement 函数, 可以看出在实例化 Fetch 之前，实现遍历执行了所有插件的 onInit 方法

```typescript
// useCreation 功能类似 useMemo 和 useRef
const fetchInstance = useCreation(() => {
	// 遍历插件，执行插件的 onInit 方法获取插件初始值或者默认配置
	const initState = plugins
    .map(p => p?.onInit?.(fetchOptions))
    .filter(Boolean);

	return new Fetch<TData, TParams>(
    serviceRef, 
    fetchOptions, 
    update, 
    Object.assign({}, ...initState)
  );
}, []);
```

而根据我们上面的表格可知， onInit 方法只有 useAutoRunPlugin 这个插件有这个生命周期

#### onInit

```typescript
// useRequest/plugins/useAutoRunPlugin.ts
import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';
import type { Plugin } from '../types';

// support refreshDeps & ready
const useAutoRunPlugin: Plugin<any, any[]> = (
	fetchInstance,
	{ manual, ready = true, defaultParams = [], refreshDeps = [], refreshDepsAction }
) => {
	// ...

	return {
		onBefore: () => {
			if (!ready) {
				return {
					stopNow: true,
				};
			}
		},
	};
};

useAutoRunPlugin.onInit = ({ ready = true, manual }) => {
	return {
		loading: !manual && ready,
	};
};

export default useAutoRunPlugin;
```

所以，initState 实际上就只有 loading 一个字段

#### onBefore

#### onRequest

#### onSuccess

#### onError

#### onFinally

#### onCancel
