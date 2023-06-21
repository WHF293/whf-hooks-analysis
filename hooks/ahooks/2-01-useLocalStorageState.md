# useLocalStorageState + useSessionStorageState

> 将状态存储在 localStorage / sessionStorage 中的 Hook 。

- [useLocalStorageState 文档](https://ahooks.js.org/zh-CN/hooks/use-local-storage-state)
- [useSessionStorageState 文档](https://ahooks.js.org/zh-CN/hooks/use-session-storage-state)

## 武功秘籍

### useLocalStorageState

```ts{6}
import { createUseStorageState } from '../createUseStorageState';
import isBrowser from '../utils/isBrowser';

const useLocalStorageState = createUseStorageState(() =>
	// 如果不是浏览器，传入 undefined，避免 SSR 中使用时报错
	isBrowser ? localStorage : undefined
);

export default useLocalStorageState;
```

### useSessionStorageState

```ts{6}
import { createUseStorageState } from '../createUseStorageState';
import isBrowser from '../utils/isBrowser';

const useSessionStorageState = createUseStorageState(() =>
	// 如果不是浏览器，传入 undefined，避免 SSR 中使用时报错
	isBrowser ? sessionStorage : undefined
);

export default useSessionStorageState;
```

是的，你没看错，useLocalStorageState 和 useSessionStorageState 源码就是这么点，而且源码基本一致，都是调用 `createUseStorageState` 这个函数，所我们只要分析这个函数即可

具体实现看这篇 [createUseStorageState](./4-03-createUseStorageState) 源码分析
