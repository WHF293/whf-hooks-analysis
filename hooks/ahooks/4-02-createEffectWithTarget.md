# createEffectWithTarget

## 源码

这个工具函数比较重要，很多 hooks 都用到这个工具函数

- 引用到的包

```ts{7,10}
// 接口类型定义
import type { DependencyList, EffectCallback, useEffect, useLayoutEffect } from "react";
import { useRef } from "react";
// 组件卸载 hooks
import useUnmount from "../useUnmount";
// 使用 Object.is 遍历依赖项对应属性值是否一致
import depsAreSame from "./depsAreSame";
import type { BasicTarget } from "./domTarget";
// 获取 dom 节点
import { getTargetElement } from "./domTarget";
```

- 源码内容

```ts{3,12-14,29-33 }
const createEffectWithTarget = (
  // useEffect 或者 useLayoutEffect
  useEffectType: typeof useEffect | typeof useLayoutEffect
) => {
	/**
	 * @param target target should compare
   *  ref.current vs ref.current,
   *  dom vs dom,
   *  ()=>dom vs ()=>dom
	 */
	const useEffectWithTarget = (
		effect: EffectCallback, // effect 函数
		deps: DependencyList, // 依赖项数组
		target: BasicTarget<any> | BasicTarget<any>[] // dom 节点 / ref.current
	) => {
    // 用于是否是组件初次挂载
		const hasInitRef = useRef(false);

		const lastElementRef = useRef<(Element | null)[]>([]);
		const lastDepsRef = useRef<DependencyList>([]);
    // 用于缓存 effect 的 clear 函数
		const unLoadRef = useRef<any>();
    // useEffectType --> useEffect / useLayoutEffect
    // 由于没有设置第二个参数，所以组件每次更新都会执行里面的代码
		useEffectType(() => {
      // ... 内容有点多，放下面分析
		});

		useUnmount(() => {
			unLoadRef.current?.();
			// for react-refresh
			hasInitRef.current = false;
		});
	};

	return useEffectWithTarget;
};

export default createEffectWithTarget;
```

## useEffectType

```ts{3,5,16,27,32}
useEffectType(() => {
	// 参数归一化
	const targets = Array.isArray(target) ? target : [target];
	// 遍历 targets，调用 getTargetElement 获取对应 dom 节点
	const els = targets.map((item) => getTargetElement(item));

	// 组件挂载时执行，后续组件更新不在执行
	if (!hasInitRef.current) {
    // 修改组件状态
		hasInitRef.current = true;
    // 保存 dom 数组和依赖项数组
		lastElementRef.current = els;
		lastDepsRef.current = deps;
    // effect 函数会返回一个 clear 函数，
    // 组件挂载时将 clear 函数赋值给 unLoadRef
		unLoadRef.current = effect();
    // 组件挂载阶段到这阶段，后续代码不执行
		return;
	}

	if (
		els.length !== lastElementRef.current.length ||
		!depsAreSame(els, lastElementRef.current) ||
		!depsAreSame(deps, lastDepsRef.current)
	) {
    // 组件更新阶段，先执行上次缓存的 clear 函数
		unLoadRef.current?.();
    // 然后更新 dom 节点数组和依赖项数组
		lastElementRef.current = els;
		lastDepsRef.current = deps;
    // 更新 clear 函数
		unLoadRef.current = effect();
	}
});
```
