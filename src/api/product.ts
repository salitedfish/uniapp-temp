import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 获取产品详情
export const getProductByCode = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldProduct/findByCode",
		data
	})
}