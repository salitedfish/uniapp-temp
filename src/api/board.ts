import { uRequest } from "./instance"
import type { Return } from "@/type/common"
import type { UserInfo } from "@/type/auth"
import { Platform } from "@/util/env"


// 根据设备uuid获取看板
export const getBoardsByTvUUID = async (data : Obj) => {
	return await uRequest.post<Return<Obj[]>>({
		url: "ldBoardTvSub/listAllByTvCode",
		data
	})
}