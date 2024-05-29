import * as dd from "dingtalk-jsapi";

// 判断平台
export class Platform {
	static platform = ""

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
		return Platform.isWeb() && dd && dd.env.platform !== "notInDingTalk"
	}
	// 如果是微信内嵌H5
	static isInWx() {
		return Platform.isWeb() && navigator.userAgent.toLowerCase().indexOf("micromessenger") != -1
	}
}

uni.getSystemInfo({
	success(res) {
		console.log("systemInfo:", res)
		Platform.platform = res.uniPlatform
	}
})