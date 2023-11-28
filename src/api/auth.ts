import { uRequest } from "./instance"
import type { Return } from "../type/common"
import type { UserInfo } from "../type/auth"

// 登录
export const login = async (data : { jobNo : string, password : string }) => {
	return await uRequest.post<Return<string>>({
		url: "token/login",
		data,
	})
}

// 退出
export const logout = async () => {
	return await uRequest.post<Return<string>>({
		url: "token/loginOut",
	})
}

// 获取登录信息
export const geUserInfo = async () => {
	return await uRequest.post<Return<UserInfo>>({
		url: "token/getToken",
	})
}