/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-13 10:10:47
 * @FilePath: \code\whf-hooks-analysis\hooks\.vitepress\utils\sidebar.ts
 */
import { DefaultTheme } from 'vitepress';
import { docsGroupMap } from './constant';
import { getBaseDocsGroup, getBaseDocsPath, getDirFiles } from './tools';

export default function getSidebar(): DefaultTheme.Sidebar {
  const sidebar: DefaultTheme.Sidebar = {};
  const basePath = getBaseDocsPath();
  const baseDocsGroups = getBaseDocsGroup();

  baseDocsGroups.forEach(file => {
    const currentPath = `${basePath}/${file}`;
    sidebar[`/${file}/`] = [
      {
        text: file,
        items: getSidebarItem(currentPath),
      },
    ];
  });
  return sidebar;
}

const getSidebarItem = (dirPath: string): DefaultTheme.SidebarItem[] => {
  const currentDirFiles = getDirFiles(dirPath);
  const levelOne = dirPath.split('/').pop();
  const sideItem: DefaultTheme.SidebarItem[] = [];

  const easyMiddleHardMap: Record<
    'easy' | 'middle' | 'hard' | 'other' | 'end',
    DefaultTheme.SidebarItem[]
  > = {
    easy: [], // 简单
    middle: [], // 中等
    hard: [], // 困难
    other: [], // 工具类
    end: [], // 总结
  };

  currentDirFiles.map((item: string) => {
    const levelTwo = item.includes('.md') ? item.replace('.md', '') : item;
    if (levelTwo === 'index') {
      sideItem.unshift({
        text: docsGroupMap.index,
        link: `/${levelOne}/${levelTwo}`,
      });
    } else if (levelTwo === '总结') {
      easyMiddleHardMap.end.push({
        text: levelTwo,
        link: `/${levelOne}/${levelTwo}`
      });
    } else {
      const obj: DefaultTheme.SidebarItem = {
        text: levelTwo.replace(/[0-9]+-/g, ''),
        link: `/${levelOne}/${levelTwo}`,
      };
      if (levelTwo.startsWith('1-')) {
        easyMiddleHardMap.easy.push(obj);
      } else if (levelTwo.startsWith('2-')) {
        easyMiddleHardMap.middle.push(obj);
      } else if (levelTwo.startsWith('3-')) {
        easyMiddleHardMap.hard.push(obj);
      } else {
        easyMiddleHardMap.other.push(obj);
      }
    }
  });

  const _sideItem = [
    {
      text: `🚲 ${docsGroupMap.easy}`,
      items: easyMiddleHardMap.easy,
      collapsed: true,
    },
    {
      text: `🛥️ ${docsGroupMap.other}`,
      items: easyMiddleHardMap.other,
      collapsed: true,
    },
    {
      text: `🚅 ${docsGroupMap.middle}`,
      items: easyMiddleHardMap.middle,
      collapsed: true,
    },
    {
      text: `🛩️ ${docsGroupMap.hard}`,
      items: easyMiddleHardMap.hard,
      collapsed: true,
    },
    {
      text: `🚀 ${docsGroupMap.end}`,
      items: easyMiddleHardMap.end,
      collapsed: true,
    },
  ] as DefaultTheme.SidebarItem[];

  sideItem.push(..._sideItem);

  return sideItem;
};
