import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 箱码已绑定的托码（扫码时即时提示，不能重复组托）
export type BoxBinding = {
	boxCode : string
	palletCode : string
}

// 查询箱码已绑定的托码
export const findBoxBindingsApi = async (boxCodes : string[]) => {
	return await uRequest.post<Return<BoxBinding[]>>({
		url: "ldPalletCode/bindings",
		data: { boxCodes },
		header: {
			"Content-Type": "application/json"
		}
	})
}

// 生成托码并绑定箱码（箱码是数组，必须走 JSON）
export const generatePalletCodeApi = async (data : { boxCodes : string[] }) => {
	return await uRequest.post<Return<string>>({
		url: "ldPalletCode/generate",
		data,
		header: {
			"Content-Type": "application/json"
		}
	})
}

// 打印托码装箱清单（后端生成 A4 PDF 并调指定打印机）
export const printPalletCodeApi = async (data : { palletCode : string; printerName : string }) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldPalletCode/print",
		data
	})
}
