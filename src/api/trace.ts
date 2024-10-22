import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"

// 查询产线列表
export const getLineList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldLine/pageList",
		data
	})
}

// 追溯查询
export const getTraceList = async (data : Obj = {}) => {
	return await uRequest.post<Return<Objs>>({
		url: "trace/search",
		data
	})
}

// 追溯查询2
export const getTraceList2 = async (data : Obj = {}) => {
	return await uRequest.post<Return<Objs>>({
		url: "trace/search2",
		data
	})
}

// 通过编号获取卡片
export const getTmlmByCode = async (data : Obj = {}) => {
	return await uRequest.post<Return<Obj>>({
		url: "tmlm/findByCode",
		data
	})
}

// 获取设备保养方案
export const getEquipmentSchemeList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "checkEquipment/schemeList",
		data,
	})
}

// 获取设备点检项目
export const getEquipmentSchemeChildList = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "tmlm/schemeChildList",
		data
	})
}

// 设备点检审核
export const submitEquipentSchemeCheckout = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "checkEquipment/add",
		data
	})
}

// 获取追溯产线列表
export const getTraceLineList = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "ldLine/listLineAll",
		data
	})
}

// 获取追溯产线详情
export const getTraceLineDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldLine/findDetailByLineId",
		data
	})
}

// 获取流程
export const getProcessDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/findProcess",
		data
	})
}

// 获取产线详情
export const getLineDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldLine/findDetailByLineDetailId",
		data
	})
}

// 获取报工列表
export const getTracePageList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "trace/pageList",
		data
	})
}

// 获取气密报工列表
export const getAirtightnessTracePageList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "airtightness/pageList",
		data
	})
}

// 获取设备信息
export const getEquipmentByLineDetailId = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "trace/findEquipment",
		data
	})
}

// 获取失效模式
export const getFailureModList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "ldFailureMode/pageList",
		data
	})
}

// 获取检验单列表
export const getCheckItemListApi = async (data : Obj) => {
	return await uRequest.post<Return<Objs>>({
		url: "ldCheckItem/checkList",
		data
	})
}

// 报工提交
export const productJobSubmit = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/add",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 解绑
export const productJobDel = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/delete",
		data
	})
}

// 获取历史报工记录
export const getProductJobHistory = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		// url: "productJob/list",
		url: "trace/pageList",
		data
	})
}

// 获取报工详情
export const getProductJobDetail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/findDetail",
		data
	})
}

// 报工打印 
export const printProductJob = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "tracePrint/print",
		data
	})
}

// 首末件检查
export const checkHeadTail = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/checkFirstFinal",
		data,
	})
}

// 码规则、重码、上到工序及返工校验
export const codeCheckInfoApi = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/checkBarcode",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 通过网址获取设备编码
export const findCardByUrl = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "ldEquipment/findCardByUrl",
		data,
	});
};

// 重置设备开关
export const traceResetPlc = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/resetPlc",
		data
	})
}

// 获取终检两个设备的数据
export const getTwoEquipmentDataApi = async (data : Obj) => {
	return await uRequest.post<Return<Obj>>({
		url: "trace/otherToZj",
		data
	})
}

// 获取包装码装箱数量
export const getPackageNumApi = async (data : Obj) => {
	return await uRequest.post<Return<number>>({
		url: "trace/findPackageNum",
		data
	})
}