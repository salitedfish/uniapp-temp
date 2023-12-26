import { uRequest } from "./instance"
import type { Return, ReturnList } from "@/type/common"
import type { DeliveryMaterialParams, DeliveryMaterial, DeliveryDocDetail, OutSrDocDetail, DeliveryMaterialInfo } from "@/type/business"


// 查询发货备料列表接口
export const getDeliveryMaterialList = async (data : DeliveryMaterialParams) => {
	return await uRequest.post<Return<ReturnList<DeliveryMaterial>>>({
		url: "deliveryMaterial/list",
		data,
	})
}

// 查询发货计划单详情
export const getDeliveryPlanDocDetail = async (data : { id : number }) => {
	return await uRequest.post<Return<any>>({
		url: "deliveryMaterial/getEntityById",
		data,
	})
}

// 发货备料获取发货信息
export const getShippingInformation = async (data : { id : number }) => {
	return await uRequest.post<Return<DeliveryDocDetail>>({
		url: "deliveryMaterial/getShippingInformation",
		data,
	})
}

// 根据发货信息获取发货和出库信息
export const getShippingAndOutboundInformation = async (data : DeliveryDocDetail) => {
	return await uRequest.post<Return<OutSrDocDetail>>({
		url: "deliveryMaterial/getShippingAndOutboundInformation",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 新增发货出库 
export const deliveryMaterialInsert = async (data : OutSrDocDetail) => {
	return await uRequest.post<Return<string>>({
		url: "deliveryMaterial/insert",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 获取出库单信息
export const deliveryMaterialInfo = async (data : { outboundCode : string }) => {
	return await uRequest.post<Return<DeliveryMaterialInfo>>({
		url: "deliveryMaterial/getOutbound",
		data,
	})
}

// 出库单新增附件 
export const deliveryMaterialAddFile = async (data : { annexUrl : string, annexName : string, outboundCode : string }) => {
	return await uRequest.post<Return<String>>({
		url: "deliveryMaterial/insertAnnex",
		data,
	})
}