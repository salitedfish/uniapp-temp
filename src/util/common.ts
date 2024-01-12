import { Platform } from "@/util/env"
import { Env } from "@/type/env"
import { batchFormat } from "@/store/common"
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
			baseUrl = import.meta.env.VITE_BASE_API_URL_APP_DEV
		}
		if (process.env.NODE_ENV === Env.PROD) {
			baseUrl = import.meta.env.VITE_BASE_API_URL_APP_PRO
		}
	}
	if (Platform.isWeb()) {
		baseUrl = import.meta.env.VITE_BASE_API_URL_WEB
	}
	return baseUrl
}

// 解析扫码后的数据
export const splitCodes = (code : string) => {
	const codes = code.split("^")
	if (codes.length > 1) {
		// 扫的是长码
		// 供应商编码
		const supplierCode = codes[6] && codes[6] !== 'null' ? codes[6] : ""
		// 批次号
		const batch = codes[4] && codes[4] !== 'null' ? codes[4] : batchFormat
		return {
			code: codes[0] === '1' ? codes[1].slice(0, -1) : codes[1],
			quantity: codes[5] !== 'null' ? codes[5] : "0",
			batch: supplierCode ? supplierCode + "-" + batch : batch
		}
	} else {
		// 扫的是物料编码
		return {
			code,
			quantity: '',
			batch: batchFormat
		}
	}
}