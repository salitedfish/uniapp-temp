import { Env } from "@/type/env"
import { batchFormat } from "@/store/common"
/**
 * 判断登录信息是否齐全
 */
export const logged = () => {
	const token = uni.getStorageSync("token")
	// const userInfo = uni.getStorageSync("userInfo")
	// if (token === '' || token === null || token === undefined || userInfo === '' || userInfo === null || userInfo === undefined) {
	if (token === '' || token === null || token === undefined) {
		return false
	} else {
		return true
	}
}

// 通过网络url获取本地临时路径
export const genLocalFileUrl = (fileUrl : string) => {
	// #ifdef APP-PLUS
	return `file://${plus.io.convertLocalFileSystemURL(fileUrl)}`
	// #endif
	// #ifdef H5
	return fileUrl
	// #endif
}

// 获取后端地址
export const getBaseUrl = () => {
	let baseUrl = ""
	// #ifdef APP-PLUS
	if (process.env.NODE_ENV === Env.DEV) {
		baseUrl = import.meta.env.VITE_BASE_API_URL_APP_DEV
	}
	if (process.env.NODE_ENV === Env.PROD) {
		baseUrl = import.meta.env.VITE_BASE_API_URL_APP_PRO
	}
	// #endif
	// #ifdef H5
	baseUrl = import.meta.env.VITE_BASE_API_URL_WEB
	// #endif
	return baseUrl
}

// 展示用: 库里(报工附件/文档/检验单图片/APK地址)存的是后端映射的相对路径(如 uploadFiles/file/fujian/202609/xxx.png),
// 各端按自己环境的 base 拼成可直接访问的地址 —— 与 web 的 utils/index.js#fileUrl 同口径。
// 带守卫: 值已是绝对地址(http/https/data/blob)或以 / 开头的一律原样返回 —— 兼容外部地址与改造前的历史数据。
// 入库前一律还原成相对路径(别把拼好的地址存回去)。
export const genFileUrl = (url : string) => {
	const target = url || ""
	if (!target) return ""
	if (/^(https?:|data:|blob:)/i.test(target) || target.charAt(0) == "/") return target
	return getBaseUrl() + target
}

// 入库用: 展示地址还原成后端映射的相对路径(与 genFileUrl 互逆)。
// 上传组件列表里存的是拼好 base 的展示地址(缩略图/放大预览要能直接用), 提交前必须过这里再落库,
// 否则库里又存成带 IP 的绝对地址(换机器就是死链)。外部地址不会被本函数改动。
export const genFilePath = (url : string) => {
	const target = url || ""
	if (!target) return ""
	const base = getBaseUrl()
	if (base && base.length > 1 && target.indexOf(base) === 0) return target.slice(base.length)
	return target
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
			// batch: supplierCode ? supplierCode + "-" + batch : batch
			batch: supplierCode ? supplierCode + batch : batch
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