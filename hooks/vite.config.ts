/*
 * @Author: HfWang
 * @Date: 2023-05-29 19:35:47
 * @LastEditors: HfWang
 * @LastEditTime: 2023-06-05 09:42:00
 * @FilePath: \hooks-analysis\hooks\vite.config.ts
 */
import { defineConfig } from 'vite';
import { SearchPlugin } from 'vitepress-plugin-search';

export default defineConfig({
	plugins: [
		SearchPlugin(),
	],
});
