/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-12 20:11:13
 * @FilePath: \code\hooks-analysis\hooks\.vitepress\utils\navbar.ts
 */
import { DefaultTheme } from 'vitepress';
import { getBaseDocsGroup } from './tools';

export default function getNavbar(): DefaultTheme.NavItem[] {
	const navbar: DefaultTheme.NavItem[] = [
		// {
		//   text: "官网链接",
		//   items: [
		//     { text: "ahooks", link: "https://ahooks.js.org/zh-CN/" },
		//     { text: "vueuse", link: "https://vueuse.org/" },
		//     { text: "react-use", link: "" },
		//   ],
		// },
		// {
		//   text: 'hooks 入门',
		//   link: '/react-hooks/'
		// },
		// getNavGroup(),
    ...getNavItem(),
	];

	return navbar;
}

// nav 合并
const getNavGroup = (): DefaultTheme.NavItem => {
	const baseDocsGroups = getBaseDocsGroup();
	const obj = {
		text: 'hooks 学习笔记',
		items: [],
	} as DefaultTheme.NavItem;
	baseDocsGroups.map((groupName: string) => {
		obj.items.push({
			text: groupName,
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
