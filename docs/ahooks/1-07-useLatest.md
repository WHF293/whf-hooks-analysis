# useLatest

> 返回当前最新值的 Hook，可以避免闭包问题。

其实就是返回一个 ref

```ts
import { useRef } from 'react';

function useLatest<T>(value: T) {
	const ref = useRef(value);
	ref.current = value;

	return ref;
}

export default useLatest;
```

使用场景, 如下例子，组件挂载后会在 3 秒后打印 num，，那如果在3秒内点击 + 按钮，num 变成了 1，但是最终输出的结果确还是 2，
这就是 useEffect 的闭包陷阱

通常我们使用 useRef 来答题 useState 或者给 useEffect 的 deps 中加上 num 来解决

而 useLatest 就是利用 useRef 这个方案


```tsx
const Demo = () => {
	const [num, setNum] = useState(0);
	useEffect(() => {
		setTimeout(() => console.log(num), 3000)
	}, []);

	const handleClick = () => {
		setNum(n => n++);
	};
	return (
		<div>
			<p>{num}</p>
			<button onClick={handleClick}>+</button>
		</div>
	);
};
```

-------------------使用 useLatest 修改后--------------------->

```tsx
const Demo = () => {
	const num = useLatest(0);
	useEffect(() => {
		setTimeout(() => console.log(num.currennt), 3000)
	}, []);

	const handleClick = () => {
		num.current++
	};
	return (
		<div>
			<p>{num}</p>
			<button onClick={handleClick}>+</button>
		</div>
	);
};
```


