/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-12 11:33:51
 * @FilePath: \code\hooks-analysis\hooks\.vitepress\utils\sidebar.ts
 */
import { DefaultTheme } from 'vitepress';
import { getBaseDocsGroup, getBaseDocsPath, getDirFiles } from './tools';
import { docsGroupMap } from './constant';

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
	currentDirFiles.map(item => {
		const levelTwo = item.includes('.md') ? item.replace('.md', '') : item;
		if (levelTwo === 'index') {
			sideItem.unshift({
				text: '目录',
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
		},
		{
			text: `🚅 ${docsGroupMap.middle}`,
			items: easyMiddleHardMap.middle,
		},
		{
			text: `🚀 ${docsGroupMap.hard}`,
			items: easyMiddleHardMap.hard,
		},
		{
			text: `☂ ${docsGroupMap.other}`,
			items: easyMiddleHardMap.other,
		},
	] as DefaultTheme.SidebarItem[];
	sideItem.push(..._sideItem);

	if (easyMiddleHardMap.end[0]) {
		sideItem.push(easyMiddleHardMap.end[0])
	}

	return sideItem;
};
