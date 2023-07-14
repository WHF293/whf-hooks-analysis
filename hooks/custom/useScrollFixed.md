# useScrollFixed

## 业务场景

如下图：

![](/useScrollFixed.png)

业务场景具体为：移动端触发浮层（popup 组件），浮层由两部分组成

- 数据汇总信息
- 虚拟列表数据（我们的业务场景下，存在 4000+ 以上的数据，所以需要使用虚拟列表）

> 产品想要的效果: 一开始滑动的时候，是整个板块一块滑动，当表头到达 popup 组件的标题部分时，表头吸附，表格高度为整个浮层高度减去 popup title 的高度，之后滚动发生在表格内部(描述可能不太清晰，各位自行体会)

## 具体实现

```ts

type TargetElement =
  MutableRefObject<HTMLElement | null> |
  HTMLElement |
  () => HTMLElement

interface ScrollFixedConfig {
	deps: any[];
	outBoxRef: TargetElement;
	innerRef: TargetElement;
	scrollMaxHeight: number | TargetElement;
}

export default function useScrollFixed(config: ScrollFixedConfig) {
	const fn = () => {
		const { outBoxRef, innerRef, scrollMaxHeight } = config;

		const outBoxScrollTop = outBoxRef?.current?.scrollTop || 0;
		const realMaxScrollHeight = isNumber(scrollMaxHeight)
      ? scrollMaxHeight
      : scrollMaxHeight.current;
		if (outBoxScrollTop > scrollMaxHeight) {
			innerRef.current.style.overflowY = "auto";
		} else {
			innerRef.current.style.overflowY = "hidden";
		}
	};

	useEffect(() => {
		if (!outBoxRef.current && !innerRef.current && !scrollMaxHeight) {
			console.log();
			return;
		}
		innerRef.current.style.overflowY = "hidden";
		outBoxRef.current.addEventLister("scroll", fn);

		return () => {
			outBoxRef.current.removeEventLister("scroll", fn);
		};
	}, config.deps);
}

const isNumber = (num) => typeof num === "number";

const getTargetElement = (element: TargetElement) => {
	let targetElement: HTMLElement;

	// 获取 dom 元素
	if (isFunction(target)) {
		targetElement = target();
	} else if ("current" in target) {
		targetElement = target.current;
	} else {
		targetElement = target;
	}
	return targetElement;
};
```
