import { uRequest } from "./instance"
import type { Return, ReturnList } from "@/type/common"
import type { CheckVouchParams, CheckVouch, CheckVouchDetailParams, CheckVouchDetail } from "@/type/business"


// 盘点单
export const getCheckVouchList = async (data : CheckVouchParams) => {
	return await uRequest.post<Return<ReturnList<CheckVouch>>>({
		url: "checkVouch/list",
		data
	})
}

// 查看盘点单明细
export const getCheckVouchDetail = async (data : CheckVouchDetailParams) => {
	return await uRequest.post<Return<CheckVouchDetail>>({
		url: "checkVouch/getEntityById",
		data
	})
}

// 提交盘点结果
export const submitCheckVouch = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "checkVouch/finishCheckVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}