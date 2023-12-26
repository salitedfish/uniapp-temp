import { uRequest } from "./instance"
import type { Return, ReturnList } from "@/type/common"
import type { } from "@/type/business"

// 查询采购到货
export const getPurchaseArrivalList = async (data : { code : string }) => {
	return await uRequest.post<Return<ReturnList<any[]>>>({
		url: "erp/getSrmDeliveryList",
		data,
	})
}

// 确认到货
export const confirmArrival = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/createArrivalVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}