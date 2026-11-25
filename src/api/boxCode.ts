import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 箱码记录：箱码生成页「今日生成记录」用
export type BoxCodeRecord = {
	id : string;
	boxCode : string;
	partNo ?: string;
	palletCode ?: string;
	createTime : string;
}

// 生成箱码值：后端发流水号，返回「条码值,数量,日期,流水号」
export const generateBoxCodeApi = async (data : { barcode : string; quantity : number }) => {
	return await uRequest.post<Return<string>>({
		url: "boxCode/generate",
		data
	})
}

// 当天本人生成的箱码(倒序)
export const todayBoxCodesApi = async () => {
	return await uRequest.post<Return<BoxCodeRecord[]>>({
		url: "boxCode/myToday"
	})
}
