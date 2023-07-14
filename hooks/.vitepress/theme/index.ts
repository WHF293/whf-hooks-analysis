/*
 * @Author: wanghaofeng
 * @Date: 2023-06-13 10:07:20
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 10:24:50
 * @FilePath: \whf-hooks-analysis\hooks\.vitepress\theme\index.ts
 */
import DefaultTheme from 'vitepress/theme'
import './custom.scss'
import MyLayout from './MyLayout.vue'

export default {
  ...DefaultTheme,
  Layout: MyLayout
}