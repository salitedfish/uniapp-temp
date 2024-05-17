import { uRequest } from "./instance"
import type { Return } from "@/type/common"

// 获取打印机列表
export const getPrinterList = async () => {
	return await uRequest.post<Return<string[]>>({
		url: "printer/list",
	})
}