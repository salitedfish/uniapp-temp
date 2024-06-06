import { Platform } from "@/util/env"

/**
 * @param {string} url
 * @param {Object} data
 * @returns {Promise}
 */
export function jsonp(url : string, data : Obj) {
	if (!url) throw new Error("url is necessary");
	const baseApi = Platform.isInterCompany() ? import.meta.env.VITE_YL_BASE_API : "";
	const callback = "CALLBACK" + Math.random().toString().substr(9, 18);
	const JSONP = document.createElement("script");
	JSONP.setAttribute("type", "text/javascript");

	const headEle = document.getElementsByTagName("head")[0];

	let ret = "";
	if (data) {
		if (typeof data === "string") {
			ret = "&" + data;
		} else if (typeof data === "object") {
			for (let key in data) {
				ret += "&" + key + "=" + encodeURIComponent(data[key]);
			}
		}
		ret += "&_time=" + Date.now();
	}
	JSONP.src = `${baseApi}${url}?callback=${callback}${ret}`;
	return new Promise((resolve, reject) => {
		// @ts-ignore
		window[callback] = r => {
			// TODO: 可以增加拦截器
			// {
			//   "errcode":"0",//判断是否成功
			//   "message":"success",//错误消息
			//   "userid":"000000000",
			//   "jobNumber":"8616",
			//   "mobile":"13967609921",
			//   "name":"王超"
			// }
			resolve(r);
			headEle.removeChild(JSONP);
			// @ts-ignore
			delete window[callback];
		};
		headEle.appendChild(JSONP);
	});
}