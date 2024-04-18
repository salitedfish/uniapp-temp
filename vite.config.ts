import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import commonjs from 'vite-plugin-commonjs';
import basicSsl from '@vitejs/plugin-basic-ssl'


// https://vitejs.dev/config/
export default ({ mode }) => defineConfig({
	plugins: [
		uni(),
		commonjs(),
		// basicSsl()
	],
	base: loadEnv(mode, process.cwd()).VITE_BASE_PAGE_PATH_WEB,
	server: {
		// https: true,
		proxy: {
			"^/api": {
				// 文博
				// target: 'http://192.168.0.6:8082/',
				// 晓楠
				// target: 'http://192.168.0.98:8082/',
				// 南昌测试环境
				target: "http://10.32.13.222:8081/",
				// 南昌正式环境
				// target: "http://10.32.13.222:8082/",
				rewrite: (path) => path.replace(/^\/api/, ""),
				changeOrigin: true,
			},
		},
	}
});