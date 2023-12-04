import { reactive, ref } from "vue"

export const printPage = ref({
	width: null,
	height: null,
	gap: null,
	QRCodeLevel: null,
	QRCodeLeftOffset: null,
	QRCodeTopOffset: null,
	textLeftOffset: null,
	textTopOffset: null,
})
export const savePrintPage = () => {
	uni.setStorageSync("printPage", printPage.value)
}
export const initPrintPage = () => {
	const printPageOrigin = uni.getStorageSync("printPage") as typeof printPage.value
	if (printPageOrigin) {
		printPage.value = printPageOrigin
	}
}

// 标签模版取值对应的key
export const textOptions = [
	"belongOrgName",
	"cardName",
	"cardCode",
	"toolingTypeName",
	"buyTime",
	"productionDate",
	"processName",
	"fixedAssetsCode",
	"factoryCode",
	"productLineName",
	"originalCode",
	"spec",
]
export const customTextOptions = ["c-text1", "c-text2"]
export const qrcodeOptions = ["shortUrl"]

// 标签模版key对应的语意
export const keyToLabel = {
	belongOrgName: "所属组织",
	cardCode: "卡片编号",
	cardName: "卡片名称",
	toolingTypeName: "分类名称",
	spec: "规格型号",
	buyTime: "购入日期",
	productionDate: "制造日期",
	processName: "工序名称",
	fixedAssetsCode: "固定资产编码",
	factoryCode: "出厂编号",
	productLineName: "产线名称",
	originalCode: "原卡片编码",
}