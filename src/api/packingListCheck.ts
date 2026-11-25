import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 校验预览返回：装箱单 + 零件对比行 + 已扫码
export type PackingListCheckPartRow = {
	partNo : string
	partName ?: string
	expectedQuantity : number
	scannedQuantity : number
	diffQuantity : number
	boxCount : number
	status : number
}

export type PackingListCheckCodeRow = {
	codeType : number
	code : string
	palletCode ?: string
	boxCount : number
}

export type PackingListCheckPreview = {
	record : Obj
	list : PackingListCheckPartRow[]
	codes : PackingListCheckCodeRow[]
	palletCount : number
	boxCount : number
	diffCount : number
	pass : boolean
	// 当前装箱单自己的最新校验记录已用过的码（允许继续使用，前端提示）
	alreadyCheckedCodes ?: string[]
}

// 校验预览（不落库）：codes 是数组，必须走 JSON
export const previewPackingListCheckApi = async (data : { toNo : string; codes : string[] }) => {
	return await uRequest.post<Return<PackingListCheckPreview>>({
		url: "ldPackingListCheck/preview",
		data,
		header: {
			"Content-Type": "application/json"
		}
	})
}

// 提交校验（落库）
export const submitPackingListCheckApi = async (data : { toNo : string; codes : string[] }) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldPackingListCheck/submit",
		data,
		header: {
			"Content-Type": "application/json"
		}
	})
}
