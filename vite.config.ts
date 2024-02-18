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
	base: "h5",
	server: {
		// https: true,
		proxy: {
			"^/api": {
				target: "http://192.168.0.87:8082/",
				// target: "http://192.168.0.87:8085/",
				rewrite: (path) => path.replace(/^\/api/, ""),
				changeOrigin: true,
			},
		},
	}
});