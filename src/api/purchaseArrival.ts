import { uRequest } from "./instance"
import type { Return, ReturnList } from "@/type/common"
import type { } from "@/type/business"

// 采购到货-直接扫码查询
export const purchaseArrivalSearch = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/getSrmDeliveryListPlus",
		data,
	})
}

// 查询采购到货
export const getPurchaseArrivalList = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/getSrmDeliveryList",
		data,
	})
}

// 查询到货单入库数据
export const getArrivalVouchList = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/getArrivalVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 查询检验单入库数据
export const getTestVouchList = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/getQmCheckVoucher",
		data,
		header: {
			"Content-Type": "application/json",
		}
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

// 生成来料报检单
export const createQmInspectVoucher = async (data : { arrivalVouchId : string }) => {
	return await uRequest.post<Return<Objs>>({
		url: "erp/createQmInspectVoucher",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 提交入库
export const purchaseStockroomSubmit = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addRdRecord01",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 产成品入库
export const pdStockroomSubmit = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addRdRecord10",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 获取产成品二维码入库信息
export const getQrcodeSrInfo = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/queryWorkOrderHasInStore",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}