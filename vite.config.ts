import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import commonjs from 'vite-plugin-commonjs';
// import basicSsl from '@vitejs/plugin-basic-ssl'


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
				// target: 'http://192.168.0.84:8097/',
				// 晓楠
				// target: 'http://192.168.0.98:8097/',
				// 测试环境
				// target: "http://10.32.13.222:8081/",
				// 测试环境
				// target: "http://192.168.0.8:8096/",
				// 正式环境
				// target: "http://182.106.226.177:64123/api/",
				// 赤壁追溯H5测试
				target: "http://119.3.17.60:8096/",
				// target: "http://192.168.0.87:8097/",
				// target: "http://119.3.91.43:18097/",
				// target: "http://192.168.0.40:8096/",
				rewrite: (path) => path.replace(/^\/api/, ""),
				changeOrigin: true,
			},
		},
	}
});