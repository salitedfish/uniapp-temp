import type { Paging } from "@/type/common"

// 各种业务对应的id
export enum PickerTypeId {
	MATERIAL = 1,
	SUPPLIER,
	CUSTOMER,
	STOCKROOM,
	SHELF,
	DEPARTMENT,
	BUSINESS_TYPE,
	PURCHASE_TYPE,
	STOCKROOM_SAVE,
	OUT_STOCKROOM,
	SALE_TYPE
}

// 各种业务统一返回的格式
export type Business = {
	id : number,
	spec : string,
	name : string,
	code : string,
	bPropertyCheck : string
	bInvBatch : string,
	parentId : number,
	preset : string,
	createTime : string
}

// 各种业务统一请求的参数
export type BusinessParams = Paging & {
	id : number,
	condition ?: string,
}


// 发货备料
export type DeliveryMaterial = {
	annexState : string;
	billCode : string;
	busType : string;
	createId : string;
	createJobNo : string;
	createName : string;
	createTime : string;
	customerCode : string;
	customerName : string;
	detailList : {
		cBatch : string;
		cInvCode : string;
		cInvFigNo : string;
		cInvName : string;
		createId : string;
		createJobNo : string;
		createName : string;
		createTime : string;
		customerFigNo : string;
		id : number;
		mainId : number;
		outboundQuantity : number;
		planNum : number;
		shipmentQuantity : number;
		soSoDetailId : number;
		totalPlanNum : number;
		warehouseCode : string;
		warehouseName : string;
	}[];
	id : number;
	isJit : number;
	outboundCodes : string;
	planDate : string;
	planType : string;
	saleBillCode : string;
	saleBillDate : string;
	saleDepartment : string;
	saleDepartmentCode : string;
	saleType : string;
	saleTypeCode : string;
	salesman : string;
	sendUserIds : string;
	sendUserNames : string;
	state : number;
	updateId : string;
	updateJobNo : string;
	updateName : string;
	updateTime : string;
	version : number;
};

export type DeliveryMaterialParams = Paging & {
	cInvCode ?: string
	planDateStart ?: string
	planDateEnd ?: string
	customerCode ?: string
	warehouseCode ?: string
	state ?: string
}

// 发货单详情
export type DeliveryDocDetail = Obj

// 出库单详情
export type OutSrDocDetail = Obj

// 工序
export type LdProcessParams = Paging & {
	condition ?: string,
}
export type LdProcess = Obj

// 盘点单
export type CheckVouchParams = Paging & {
	condition ?: string,
}
export type CheckVouch = Obj
export type CheckVouchDetailParams = {
	id : string
}
export type CheckVouchDetail = Obj & {
	detailList : Obj[]
}

// 出库单信息
export type DeliveryMaterialInfo = Obj

//------------------------------------

// 等数据结构确定后再修改

// 物料数据类型
export type Materiel = Partial<{
	code : string,
	name : string,
	num : number
}>
export type MaterielParams = Paging & {
	keyword ?: string
}

// 到货单相关
export type ArrivalDoc = {
	code : string,
	name : string,
}
export type ArrivalDocParams = Paging & {
	keyword ?: string
}

// 检验单相关
export type TestDoc = {
	code : string,
	name : string,
}
export type TestDocParams = Paging & {
	keyword ?: string
}

// 工序相关
export type Process = {
	code : string,
	name : string,
}
export type ProcessParams = Paging & {
	keyword ?: string
}

// 物料申请单
export type MaterielApplyDoc = {
	code : string,
	name : string,
}
export type MaterielApplyDocParams = Paging & {
	keyword ?: string
}

// 工序派工资料单
export type ProcessSendDoc = {
	code : string,
	name : string,
}
export type ProcessSendDocParams = Paging & {
	keyword ?: string
}

// 盘点单
export type CheckDoc = {
	code : string,
	name : string,
}
export type CheckDocParams = Paging & {
	keyword ?: string
}

// 出库单
export type OutSrDoc = {
	code : string,
	name : string,
}
export type OutSrDocParams = Paging & {
	keyword ?: string
}

// 发货单
export type DeliveryDoc = {
	code : string,
	name : string,
}
export type DeliveryDocParams = Paging & {
	keyword ?: string
}