/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: HfWang
 * @LastEditTime: 2023-06-01 09:27:44
 * @FilePath: \hooks-analysis\hooks\.vitepress\config.ts
 */
import { baseUrl } from './utils/constant';
import { defineConfig } from 'vitepress'
import getSidebar from './utils/sidebar'
import getNavbar from './utils/navbar';

export default defineConfig({
  base: baseUrl,
  outDir: "../dist",
  title: "霞露小伙-hooks学习",
  lastUpdated: true,
  themeConfig: {
    nav: getNavbar(),
    sidebar: getSidebar(),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    lastUpdatedText: '最后更新时间',
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present wanghaofeng'
    },
    editLink: {
      pattern: 'https://github.com/WHF293/whf-hooks-analysis/tree/master/hooks/:path',
      text: '编辑当期页面'
    },
    docFooter: {
      prev: '< 上一篇',
      next: '下一篇 >'
    },
    outline: {
      level: 'deep'
    }
  }
})
