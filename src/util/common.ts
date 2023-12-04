import { Platform } from "@/util/env"
import { Env } from "@/type/env"
/**
 * 判断登录信息是否齐全
 */
export const logged = () => {
	const token = uni.getStorageSync("token")
	const userInfo = uni.getStorageSync("userInfo")
	if (token === '' || token === null || token === undefined || userInfo === '' || userInfo === null || userInfo === undefined) {
		return false
	} else {
		return true
	}
}

// 通过网络url获取本地临时路径
export const genLocalFileUrl = (fileUrl : string) => {
	if (Platform.isWeb()) {
		return fileUrl
	}
	if (Platform.isApp()) {
		return `file://${plus.io.convertLocalFileSystemURL(fileUrl)}`
	}
}

// 获取后端地址
export const getBaseUrl = () => {
	let baseUrl = ""
	if (Platform.isApp()) {
		if (process.env.NODE_ENV === Env.DEV) {
			baseUrl = import.meta.env.VITE_BASE_API_URL_DEV
		}
		if (process.env.NODE_ENV === Env.PROD) {
			baseUrl = import.meta.env.VITE_BASE_API_URL_PROD
		}
	}
	if (Platform.isWeb()) {
		baseUrl = import.meta.env.VITE_BASE_API_URL_WEB
	}
	return baseUrl
}