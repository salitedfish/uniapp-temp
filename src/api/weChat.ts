
import { uRequest } from "./instance"
import type { Return } from "@/type/common"

export const wechatSignature = async ({ isShowLoading = false, ...data }) => {
	return await uRequest.post<Return<any>>({
		url: "wechat/signature",
		data,
	})
}