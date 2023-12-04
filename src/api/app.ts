import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 登录
export const versionCheck = async () => {
	return await uRequest.get<Return<{
		versionCode : string,
		versionUrl : string
	}>>({
		url: "versionCheck",
	})
}