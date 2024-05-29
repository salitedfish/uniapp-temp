import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 
export const wxSignature = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "wechat/signature",
		data
	})
}

//
export const wxGetUser = async (data : Obj) => {
	data.loginSource = "WX"
	return await uRequest.post<Return<Obj>>({
		url: "dingdingUser/getUser",
		data
	})
}