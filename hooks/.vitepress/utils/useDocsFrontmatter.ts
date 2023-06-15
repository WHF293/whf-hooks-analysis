/*
 * @Author: wanghaofeng
 * @Date: 2023-06-15 10:13:14
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 14:40:45
 * @FilePath: \whf-hooks-analysis\hooks\.vitepress\utils\useDocsFrontmatter.ts
 */
import docsFrontmatterData from './frontmatter.json';

export default function useDocsFrontmatter() {
	return {
		tags: [{ tagText: '', tagNum: 0 }],
		timeLineData: [{ date: '2023-02-03', docsName: '' }],
	};
}
