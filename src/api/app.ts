import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 版本检查
export const versionCheck = async () => {
	return await uRequest.post<Return<{
		version : string,
		url : string,
		remark : string
	}>>({
		url: "app/versionCheck",
	})
}