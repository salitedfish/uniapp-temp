import { uRequest } from "./instance"
import type { Return, ReturnList } from "@/type/common"
import type { BusinessParams, Business, LdProcessParams, LdProcess, CheckVouchParams, CheckVouch } from "@/type/business"

// 获取各种业务列表
export const getBusiness = async (data : BusinessParams) => {
	return await uRequest.post<Return<ReturnList<Business>>>({
		url: "dictionary/listChild",
		data,
	})
}

// 获取工序列表
export const getLdProcessList = async (data : LdProcessParams) => {
	return await uRequest.post<Return<ReturnList<LdProcess>>>({
		url: "ldProcess/pageList",
		data
	})
}

// 获取产品列表
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

// 获取到货明细
export const getArrivalMaterielApi = async (params : MaterielParams) => {
	return await uRequest.get<Return<ReturnList<Materiel>>>({
		url: "",
		params,
	})
}