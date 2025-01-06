import * as dingding from "dingtalk-jsapi";

// 判断平台
export class Platform {
	static platform = ""
	static webPlatform = ""
	static deviceId = ""
	static windowWidth = 0
	static windowHeight = 0

	// 纯app
	static isApp() {
		return Platform.platform === 'app'
	}
	// H5（包括应用内嵌H5）
	static isWeb() {
		return Platform.platform === 'web'
	}
	// 如果钉钉内嵌H5
	static isInDD() {
		return Platform.isWeb() && dingding && dingding.env.platform !== "notInDingTalk"
	}
	// 如果是微信内嵌H5
	static isInWx() {
		return Platform.isWeb() && navigator.userAgent.toLowerCase().indexOf("micromessenger") != -1
	}
	// 如果是ios浏览器
	static isIosWeb() {
		return Platform.webPlatform === 'ios'
	}
	// 如果是安卓浏览器
	static isAndrodWeb() {
		return Platform.webPlatform === 'android'
	}
	// 判断是否是大屏且宽要大于高
	static isBigScreen() {
		return Platform.windowWidth > 1000 && Platform.windowWidth > Platform.windowHeight
	}

	// 判断使用的公司是否是内部公司
	static isInterCompany() {
		return true
		// return ["zongbu", "shanghai", "sdyl_single"].includes(import.meta.env.VITE_COMPANY)
	}
}

uni.getSystemInfo({
	success(res) {
		console.log("系统信息:", res)
		Platform.platform = res.uniPlatform
		Platform.webPlatform = res.platform

		Platform.deviceId = res.deviceId

		Platform.windowWidth = res.windowWidth
		Platform.windowHeight = res.windowHeight
	}
})