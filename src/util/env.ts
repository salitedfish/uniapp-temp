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

const applySystemInfo = (res: any) => {
	console.log("系统信息:", res)
	Platform.platform = res.uniPlatform
	Platform.webPlatform = res.platform

	Platform.deviceId = res.deviceId

	Platform.windowWidth = res.windowWidth
	Platform.windowHeight = res.windowHeight
}

// App.vue 的 onLaunch 要靠 platform / 屏幕宽高分流（大屏进看板、其余走 initXxx），
// 异步接口的回调在个别设备上可能晚于 onLaunch：那时 Platform 还是初值，
// isApp() / isBigScreen() 全 false，任何分支都不进，应用就停在空白启动页。
// 所以启动前先同步取一次，异步回调只作后续刷新。
try {
	applySystemInfo(uni.getSystemInfoSync())
} catch (err) {
	console.log("getSystemInfoSync 失败:", err)
}
uni.getSystemInfo({
	success: applySystemInfo
})