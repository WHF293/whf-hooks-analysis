<!--
 * @Author: HfWang
 * @Date: 2023-06-05 09:24:15
 * @LastEditors: HfWang
 * @LastEditTime: 2023-06-05 09:25:41
 * @FilePath: \hooks-analysis\hooks\ahooks\tools.md
-->
# ahooks 工具函数介绍

## isBrowser

```ts
// packages/hooks/src/uttills/isBrower.ts
const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export default isBrowser;
```
