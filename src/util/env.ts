
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

export const genLocalFileUrl = (fileUrl : string) => {
	if (Platform.isWeb()) {
		return fileUrl
	}
	if (Platform.isApp()) {
		return `file://${plus.io.convertLocalFileSystemURL(fileUrl)}`
	}
}

export const getBaseUrl = () => {
	let baseUrl = ""
	if (Platform.isApp()) {
		if (process.env.NODE_ENV === 'development') {
			baseUrl = import.meta.env.VITE_BASE_API_URL_DEV
		}
		if (process.env.NODE_ENV === 'production') {
			baseUrl = import.meta.env.VITE_BASE_API_URL_PROD
		}
	}
	if (Platform.isWeb()) {
		baseUrl = "/api/"
	}
	return baseUrl
}