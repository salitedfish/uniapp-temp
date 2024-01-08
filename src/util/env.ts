// 判断平台
export class Platform {
	static platform = ""

	static isApp() {
		return Platform.platform === 'app'
	}
	static isWeb() {
		return Platform.platform === 'web'
	}
	static isWx() {
		if (!Platform.isWeb || !navigator) return false
		if (navigator.userAgent.toLowerCase().indexOf("micromessenger") != -1) {
			return true
		} else {
			false
		}
	}
}

uni.getSystemInfo({
	success(res) {
		Platform.platform = res.uniPlatform
	}
})