// 判断平台
export class Platform {
	static platform = ""

	static isApp() {
		return Platform.platform === 'app'
	}
	static isWeb() {
		return Platform.platform === 'web'
	}
}

uni.getSystemInfo({
	success(res) {
		Platform.platform = res.uniPlatform
	}
})