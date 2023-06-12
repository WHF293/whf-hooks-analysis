# useMount

> 只在组件初始化时执行的 Hook。

就是简单的利用 useEffect 第二个参数为空数组时，只会在组件挂载时执行 effect 函数的特性 ,相当于 componentWillMount

```ts
import { useEffect } from 'react'
import { isFunction } from '../utils'
import isDev from '../utils/isDev'

const useMount = (fn: () => void) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useMount: parameter \`fn\` expected to be a function, but got "${typeof fn}".`)
    }
  }

  useEffect(() => {
    fn?.()
  }, [])
}

export default useMount
```
