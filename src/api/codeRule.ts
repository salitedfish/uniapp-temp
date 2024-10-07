import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 条码生成
export const getBoxBarcode = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "ldPrintBarcode/add2",
		data
	})
}

// 历史条码列表
export const getBarcodeList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldPrintBarcode/pageList",
		data
	})
}