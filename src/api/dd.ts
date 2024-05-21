import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 获取corpId
export const ddQuery = async () => {
	return await uRequest.post<Return<Obj>>({
		url: "ding/query",
	})
}

// 
export const ddSignature = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ding/signature",
		data
	})
}

//
export const ddGetUser = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "dingdingUser/getUser",
		data
	})
}