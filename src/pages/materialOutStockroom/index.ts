import { ref, watch, computed } from "vue"
import { useCheckEmptyInObj } from "@ultra-man/noa"
import { getOutSrListApiByDispatchProcessInfo, getOutSrListApiByMaterialAppVouch, addRdRecord11 } from "@/api/business"
import type {
	PageListApi
} from "@/type/common"

// 类型选择
export const typeSelect = ref(0)
// 是否打印
export const printTypeCheck = ref(0)
export const showPrintContent = ref(false)
// 参照生产订单工序派工资料情况
export const processSendDocSelected = ref<Obj[]>([])
// 参照领料申请单情况
export const materielApplyDocSelected = ref<Obj[]>([])
// 日期
export const dateSelected = ref<string[]>([])
// table实际展示的数据, 表格由前端自己维护
export const tableData = ref<Obj[]>([])
// 表格操作
export const operateData = ref<Obj>({
	index: "",
	count: ""
})
export const originData = ref<Obj>({})
export const showPopup = ref(false)

// tab切换
watch(typeSelect, () => {
	resetAll()
})

export const config = ref<Obj>({})

// 清空数据
export const resetAll = () => {
	showPrintContent.value = false
	processSendDocSelected.value = []
	materielApplyDocSelected.value = []
	tableData.value = []
	operateData.value = {}
	originData.value = {}
	showPopup.value = false
}
// 关闭打印页面
export const closePrintContent = () => {
	resetAll()
	showPrintContent.value = false
}
// 获取出库明细
const getOutSrList = async (api : PageListApi, param : Obj) => {
	try {
		const configStr = uni.getStorageSync("mOSDefaultSet")
		const config = configStr ? JSON.parse(configStr) : {}
		if (!config.stockroomSelected || !config.stockroomSelected[0]) {
			uni.showToast({
				icon: "none",
				title: "请先选择仓库"
			})
			return
		}
		const params = { ...param, warehouseCode: config.stockroomSelected[0].code }
		const res = await api(params)
		if (res) {
			console.log(tableData.value)
			tableData.value = res.data.list.map(item => {
				return {
					...item,
					count: Number(item.iquantity),
					ddate: processSendDocSelected.value[0] ? processSendDocSelected.value[0].startDate : ""
				}
			})
		}
	} catch (err) {
		console.log(err)
	}
}
// 参照生产订单工序派工资料情况
export const processSendDocSelect = (res : Obj[]) => {
	if (res.length > 0) {
		// todo请求列表
		getOutSrList(getOutSrListApiByDispatchProcessInfo, {
			type: "productOrder",
			wcCode: res[0].wcCode,
			productionOrderDetailId: res[0].productionOrderDetailId,
			moCode: res[0].moCode,
			opseq: res[0].opseq
		})
	}

}
// 参照领料申请单情况
export const materielApplyDocSelect = (res : Obj[]) => {
	if (res.length > 0) {
		// todo请求列表
		getOutSrList(getOutSrListApiByMaterialAppVouch, {
			type: "materialAppVouch",
			ccode: res[0].ccode
		})
	}

}
// 表格操作
export const open = (item : Obj, key : number) => {
	operateData.value.index = key
	operateData.value.count = item.count
	originData.value = item
	showPopup.value = true
}
// 弹窗内货位码扫描成功
export const edit = () => {
	const value = Number(operateData.value.count)
	const max = Number(originData.value.iquantity)
	const min = 0
	if (value > max) {
		uni.showToast({
			icon: "none",
			title: "出库数量不能大于应出库数量"
		})
		return
	}
	if (value <= min) {
		uni.showToast({
			icon: "none",
			title: "出库数量不能小于0"
		})
		return
	}
	originData.value.count = value
	showPopup.value = false
}
export const deleteTable = (key : number) => {
	uni.showModal({
		content: "确定要删除吗？",
		showCancel: true,
		success(res) {
			if (res.confirm) {
				tableData.value.splice(key, 1)
				uni.showToast({
					icon: "none",
					title: "删除成功"
				})
			}
		}
	})
}
// 确认出库
export const submiting = ref(false)
export const confirm = async () => {
	try {
		// 默认值检查
		if (useCheckEmptyInObj([config.value.depSelected, config.value.stockroomSelected, config.value.outStockroomTypeSelected],
			[])) {
			uni.showToast({
				title: "请填写完默认参数",
				icon: "none"
			})
			return
		}
		submiting.value = true
		uni.showLoading({
			title: "出库中",
			mask: true
		})

		const params = {
			body: tableData.value.map(item => {
				return {
					...item,
					iquantity: item.count
				}
			}),
			head: {
				cdepcode: config.value.depSelected[0].code,
				crdcode: config.value.outStockroomTypeSelected[0].code,
				cwhcode: config.value.stockroomSelected[0].code,
				ddate: dateSelected.value[0]
			}
		}
		await addRdRecord11(params)
		uni.showToast({
			icon: "none",
			title: "出库成功"
		})

		if (printTypeCheck.value === 0 && typeSelect.value === 0) {
			showPrintContent.value = true
		} else {
			resetAll()
		}

	} catch (err) { console.log(err) } finally {
		submiting.value = false
	}
}
export const confirmDisabled = computed(() => {
	return tableData.value.length <= 0 || submiting.value
})