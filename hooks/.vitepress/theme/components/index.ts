/*
 * @Author: wanghaofeng
 * @Date: 2023-06-15 10:24:54
 * @LastEditors: wanghaofeng
 * @LastEditTime: 2023-06-15 10:25:36
 * @FilePath: \whf-hooks-analysis\hooks\.vitepress\theme\components\index.ts
 */
import TimeLine from './timeline.vue';
import type { App } from 'vue';

const customCoponentList = [TimeLine];

const registerCustomComponents = (app: App) => {
	customCoponentList.forEach(comp => app.components(comp.name, comp));
};

export default registerCustomComponents;
