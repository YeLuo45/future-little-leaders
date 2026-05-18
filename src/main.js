import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";
import { createLocaleI18n } from "./i18n/index.js";

const { t } = createLocaleI18n();

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();
	
	app.use(pinia);
	
	// 注入 i18n 全局方法
	app.config.globalProperties.$t = t;
	
	return {
		app,
	};
}
