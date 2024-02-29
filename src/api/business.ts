import { uRequest } from "./instance"
import type { Return, ReturnList, Paging } from "@/type/common"
import type { BusinessParams, Business, LdProcessParams, LdProcess } from "@/type/business"

// 获取各种业务列表
export const getBusiness = async (data : BusinessParams) => {
	return await uRequest.post<Return<ReturnList<Business>>>({
		url: "dictionary/listChild",
		data,
	})
}

// 获取工序列表
export const getLdProcessList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listWorkCenter",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 获取现存量
export const listCurrentStock = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listCurrentStock",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 根据货位编码获取货位信息
export const getPositionInfo = async (data : { cPosCode : string }) => {
	return await uRequest.post<Return<Obj>>({
		url: "dictionary/getPosition",
		data,
	})
}

// 获取参照生产订单工序派工资料
export const getProductionOrderDispatchProcessInfos = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listProductionOrderDispatchProcessInfo",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 领料申请单
export const listMaterialAppVouch = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listMaterialAppVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 获取检验单
export const getTestDocList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listQmCheckVoucher",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

//获取到货单
export const getArrivalDocList = async (data : Paging & Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listArrivalVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 货位调整
export const shelfChange = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addAdjustPVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 调拨
export const stockroomChange = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addTransVouch",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 其他入库单
export const addRdRecord08 = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addRdRecord08",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 其他出库单
export const addRdRecord09 = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addRdRecord09",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 参照派工资料获取出库明细
export const getOutSrListApiByDispatchProcessInfo = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listMaterialOutboundInfo",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 参照领料单获取材料出库明细
export const getOutSrListApiByMaterialAppVouch = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listMaterialOutboundInfo",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 查询发货单列表
export const getDispatchList = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "erp/listDispatchList",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 执行退货
export const refundSubmit = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addDispatchList",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 材料出库单新增
export const addRdRecord11 = async (data : Obj) => {
	return await uRequest.post<Return<string>>({
		url: "erp/addRdRecord11",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}

// 获取重打印列表
export const getRePrintList = async (data : Obj) => {
	return await uRequest.post<Return<ReturnList<Obj>>>({
		url: "/erp/listRdRecord11RePrint",
		data,
		header: {
			"Content-Type": "application/json",
		}
	})
}
// //----------------------------------------------------------------------------------------


// // 获取产品列表
export const getProductInfo = async (data : { code : string }) => {
	return await uRequest.post<Return<Obj>>({
		url: "erp/getU8ProductInfo",
		data
	})
}




const list = [
	[
		{
			code: "1",
			name: "生产部1"
		},
		{
			code: "2",
			name: "采购部2 "
		},
	],
	[
		{
			code: "3",
			name: "生产部3"
		},
		{
			code: "4",
			name: "采购部4 "
		},
	],
	[
		{
			code: "5",
			name: "生产部5"
		},
		{
			code: "6",
			name: "采购部6 "
		},
	],
]

// 获取部门列表
export const getDepartment = async (params : DepartmentParams) => {
	// 模拟数据
	if (params.keyword === undefined || params.keyword === "") {
		return Promise.resolve({
			data: {
				data: [
					{
						code: "-1",
						name: "生产部1"
					},
					{
						code: "0",
						name: "采购部2 "
					},
				]
			}
		})
	}

	return Promise.resolve({
		data: {
			data: list[params.keyword]
		}
	})
	// return await uRequest.get<Return<ReturnList<Department>>>({
	// 	url: "",
	// 	params,
	// })
}