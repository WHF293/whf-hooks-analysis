/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-21 13:32:03
 * @FilePath: \whf-hooks-analysis\hooks\.vitepress\config.ts
 */
import { baseUrl } from './utils/constant';
import { defineConfig } from 'vitepress'
import getSidebar from './utils/sidebar'
import getNavbar from './utils/navbar';
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
    base: baseUrl,
    title: "hooks 葵花宝典",
    lastUpdated: true,
    appearance: 'dark',
    markdown: {
      lineNumbers: true,
    },
    head: [
      ['link', { rel: 'icon',  href: 'https://whf-img.oss-cn-hangzhou.aliyuncs.com/img/h-theme.png' }],
    ],
    themeConfig: {
      nav: getNavbar(),
      sidebar: getSidebar(),
      socialLinks: [
        { icon: 'github', link: 'https://github.com/WHF293/whf-hooks-analysis' }
      ],
      lastUpdatedText: '最后更新时间',
      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2023.06-present wanghaofeng'
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
)


