<!--
 * @Author: HfWang
 * @Date: 2023-05-29 19:43:37
 * @LastEditors: HfWang
 * @LastEditTime: 2023-06-05 09:06:57
 * @FilePath: \hooks-analysis\hooks\ahooks\02-useBoolean.md
-->

# useBoolean

> 优雅的管理 boolean 状态的 Hook。

- [useBoolean 文档](https://ahooks.js.org/zh-CN/hooks/use-boolean)

useBoolean 是 useToggle 的衍生， 内部就是用的 useToggle 实现的

## 使用

```ts
const [state, { toggle, setTrue, setFalse }] = useBoolean(true);
```

## 源码

```ts{2,12,21-24}
import { useMemo } from "react";
import useToggle from "../useToggle";

export interface Actions {
  setTrue: () => void;
  setFalse: () => void;
  set: (value: boolean) => void;
  toggle: () => void;
}

export default function useBoolean(
  defaultValue = false
): [boolean, Actions] {
  // 调用 useToggle
  const [state, { toggle, set }] = useToggle(!!defaultValue);
  // 封装 action
  const actions: Actions = useMemo(() => {
    const setTrue = () => set(true);
    const setFalse = () => set(false);
    return {
      toggle,
      set: (v) => set(!!v),
      setTrue,
      setFalse,
    };
  }, []);
  // 返回状态和改变状态的方法对象
  return [state, actions];
}
```

## 使用场景

一般用于开关类场景，例如切换快关显示或隐藏某一组件
