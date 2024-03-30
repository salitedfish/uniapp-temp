import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import commonjs from 'vite-plugin-commonjs';
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		uni(),
		commonjs(),
		basicSsl()
	],
	base: "h52",
	server: {
		// https: true,
		proxy: {
			"^/api": {
				// 文博
				// target: 'http://192.168.0.6:8082/',
				// 晓楠
				target: 'http://192.168.0.98:8082/',
				// target: "http://182.106.226.177:64123/api/",
				rewrite: (path) => path.replace(/^\/api/, ""),
				changeOrigin: true,
			},
		},
	}
});