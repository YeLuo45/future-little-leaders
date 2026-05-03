import {
	createSSRApp
} from "vue";
import { createPinia } from 'pinia'
import App from "./App.vue";

// 导入ec-canvas组件（在微信小程序环境中使用）

export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();
	
	app.use(pinia);
	
	return {
		app,
	};
}
