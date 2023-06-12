# useUpdate

> useUpdate 会返回一个函数，调用该函数会强制组件重新渲染

- [useUpdate 文档](https://ahooks.js.org/zh-CN/hooks/use-update)

> 原理：返回的函数通过变更 useState 返回的 state，从而促使组件进行更新。

```ts
import { useCallback, useState } from 'react';

const useUpdate = () => {
  // 不添加依赖性，组件每次更新都会执行 effect
	const [, setState] = useState({});

	return useCallback(() => setState({}), []);
};

export default useUpdate;
```

### 使用

```jsx
import React from 'react';
import { useUpdate } from 'ahooks';

export default () => {
	const update = useUpdate();

	return (
		<>
			<div>Time: {Date.now()}</div>
			{/* 每次点击都会强制渲染 */}
			<button
				type='button'
				onClick={update}
				style={{ marginTop: 8 }}
			>
				update
			</button>
		</>
	);
};
```