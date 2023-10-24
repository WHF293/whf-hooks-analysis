/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng 2860028714@qq.com
 * @LastEditTime: 2023-10-24 23:07:15
 * @FilePath: \whf-hooks-analysis\hooks\.vitepress\utils\navbar.ts
 */
import { DefaultTheme } from 'vitepress';
import { getBaseDocsGroup } from './tools';

export default function getNavbar(): DefaultTheme.NavItem[] {
	const navbar: DefaultTheme.NavItem[] = [
		// getNavGroup(),
		{
			text:'⛪主站',
			link: 'https://whf293.github.io/hf_blog/'
		},
    ...getNavItem(),
	];

	return navbar;
}

// nav 合并
const getNavGroup = (): DefaultTheme.NavItemChildren => {
	const baseDocsGroups = getBaseDocsGroup();
	const obj = {
		text: 'hooks 学习笔记',
		items: [],
	} as DefaultTheme.NavItemChildren;
	baseDocsGroups.map(groupName => {
		obj.items.push({
			text: `🛩️${groupName}`,
			link: `/${groupName}/`,
		});
	});
	return obj;
};

// nav 分开
const getNavItem = (): DefaultTheme.NavItem[] => {
	const baseDocsGroups = getBaseDocsGroup();
	const obj = [] as DefaultTheme.NavItem[];
	baseDocsGroups.map((groupName: string) => {
		obj.push({
			text: groupName,
			link: `/${groupName}/`,
		});
	});
	return obj;
};
