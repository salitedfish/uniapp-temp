<template>
	<AutoConnectBlueTooth ref="autoConnectBlueTooth" v-if="form.isPrint"> </AutoConnectBlueTooth>

	<!-- 基础数据表单 -->
	<up-form class="common-form" :class="{ 'common-form-next': true }" labelPosition="left">
		<up-form-item class="common-form-item" label="产品编码:" borderBottom labelWidth="80" style="padding: 0">
			<UpInputProductPicker v-model:selected="productSelected" @select="productSelect" readonly border="none"
				placeholder="请选择产品"> </UpInputProductPicker>
		</up-form-item>

		<up-form-item class="common-form-item" label="OK数量:" borderBottom labelWidth="80" style="padding: 0">
			<up-input v-model="form.okNum" placeholder="自动带出" class="input-item" readonly border="none"></up-input>
		</up-form-item>

		<up-form-item class="common-form-item" label="NG数量:" borderBottom labelWidth="80" style="padding: 0">
			<up-input v-model="form.ngNum" placeholder="自动带出" class="input-item" readonly border="none"></up-input>
		</up-form-item>
	</up-form>

	<up-form class="common-form" :class="{ 'common-form-next': true }" labelPosition="left"
		v-show="codeRules && codeRules.length">
		<up-form-item class="common-form-item" :label="`${item.codeName}:`" borderBottom labelWidth="80" style="padding: 0"
			required v-for="(item, key) in codeRules" :key="key">
			<up-input-scan :focus="item.inputFocus" v-model="item.barCode" placeholder="请输入条码" clearable class="input-item"
				@scanSuccess="(str: string) => codeRuleScanSuccess(str, item, key)"
				@blur="item.inputFocus = false"></up-input-scan>
		</up-form-item>
	</up-form>

	<!-- 设备选择 -->
	<up-form class="common-form common-form-next" labelPosition="left" v-if="equipments && equipments.length">
		<up-form-item class="common-form-item" label="设备编码:" borderBottom labelWidth="80" style="padding: 0">
			<up-input v-model="form.equipmentCode" placeholder="请选择设备" class="input-item" readonly border="none">
				<template #suffix>
					<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="20" :color="globalColor.primary"
						@click="openEquipmentPicker"></uni-icons>
					<up-picker :show="showEquipmentPicker" :columns="equipments" @confirm="equipmentSelect"
						@cancel="showEquipmentPicker = false" keyName="equipmentCode"></up-picker>
				</template>
			</up-input>
		</up-form-item>
		<up-form-item class="common-form-item" label="设备数据:" borderBottom labelWidth="80" style="padding: 0">
			<up-button type="primary" class="btn" @click="showEquipmentDetail">查看详情</up-button>
			<!-- <up-textarea v-model="form.equipmentContent" placeholder="自动带出" class="input-item" disabled></up-textarea> -->
		</up-form-item>
		<up-form-item class="common-form-item" label="结果:" borderBottom labelWidth="80" style="padding: 0">
			<up-input :modelValue="ResultMap[form.equipmentResult]" placeholder="自动带出" readonly class="input-item"
				border="none"></up-input>
		</up-form-item>
	</up-form>

	<!-- 检验单 -->
	<up-text text="检验单明细:" class="grid-title" bold v-if="checkRecords && checkRecords.length"></up-text>
	<CheckRecord :checkItems="checkRecords" :form="form" @setFormResult="setFormResult" @setFailureMod="setFailureMod"
		v-if="checkRecords && checkRecords.length"> </CheckRecord>

	<up-form class="common-form common-form-next" labelPosition="left">
		<up-form-item class="common-form-item" label="是否合格:" borderBottom labelWidth="80" style="padding: 0" required>
			<u-radio-group placement="row" class="radio-group" v-model="form.result"
				@change="failureModSelected = []; manSelectResult = true; failuerModSelect()">
				<u-radio :name="'1'" label="是"></u-radio>
				<u-radio :name="'0'" label="否" style="margin-left: 10px"></u-radio>
			</u-radio-group>
		</up-form-item>

		<up-form-item class="common-form-item" label="失效模式:" borderBottom labelWidth="80" style="padding: 0" required
			v-if="form.result === '0'">
			<TraceFailureModPicker v-model:selected="failureModSelected" @select="failuerModSelect"
				:processId="form.processId" :orgIds="form.orgIds" readonly border="none" placeholder="请选择失效模式" :multiple="true">
			</TraceFailureModPicker>
		</up-form-item>
	</up-form>

	<up-form class="common-form common-form-next" labelPosition="left">
		<up-form-item class="common-form-item" label="是否返工:" borderBottom labelWidth="80" style="padding: 0" required>
			<u-radio-group placement="row" class="radio-group" v-model="form.rework">
				<u-radio :name="'1'" label="是"></u-radio>
				<u-radio :name="'0'" label="否" style="margin-left: 10px"></u-radio>
			</u-radio-group>
		</up-form-item>
	</up-form>

	<!-- 是否打印 -->
	<PrintTypeCheck class="print-check-box" v-model="printTypeCheck" label="是否打印:" style="margin-top: 10px"
		v-if="form.isPrint"> </PrintTypeCheck>

	<!-- 按钮操作 -->
	<view class="btn-box">
		<up-button type="primary" class="btn" shape="circle" @click="submit">提 交</up-button>
		<up-button type="primary" class="btn" shape="circle" @click="reset">重 置</up-button>
	</view>

	<!-- 表格 -->
	<TraceTablePK1 ref="traceTableRef" :form="form" style="margin-top: 10px"> </TraceTablePK1>

	<!-- 设备数据详情 -->
	<up-popup :show="detailDialogVisible" mode="center" @close="hideDetail" :round="10">
		<view style="padding: 10px 15px; width: 90vw; min-height: 20vh; max-height: 80vh; overflow-y: scroll;">
			<tableDetail :detailData="form"></tableDetail>
		</view>
	</up-popup>
</template>

<script lang="ts" setup>
	import { ref, onMounted, onBeforeUnmount, watch, nextTick, reactive } from "vue"
	// 类型
	// 组件
	import TraceTablePK1 from "../components/TraceTablePK1.vue"
	import UpInputScan from "@/components/UpInputScanNew.vue"
	import UpInputProductPicker from "@/components/UpInputProductPicker.vue"
	import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"
	import PrintTypeCheck from "@/components/PrintTypeCheck.vue"
	import AutoConnectBlueTooth from "@/components/AutoConnectBlueTooth.vue"
	import { setCustomModal } from "@/store/customModal"
	import CheckRecord from "../components/CheckRecord.vue"
	import tableDetail from "@/pages/traceInfo/components/tableDetail.vue"
	// 数据
	import { globalColor } from "@/store/theme"
	// 工具
	import { useThrottle, useDebounce, useRmRepeat, useDownloadByURL } from "@ultra-man/noa"
	import { printBoxBarcode } from "@/util/printUtils"
	// 接口
	import { getLineDetail, getEquipmentByLineDetailId, productJobSubmit, codeCheckInfoApi, getCheckItemListApi, getEquipmentDataApi, getProductSubmitDataApi } from "@/api/trace"
	// 静态数据
	import { P, PK, BarcodeNames, ResultMap } from "../enum"

	const props = defineProps<{
		lineDetailId ?: string
		procedureName ?: string
		// submitType ?: string
		// traceReworkId ?: string
	}>()

	onMounted(async () => {
		// 获取产线详情
		if (props.lineDetailId) {
			await getProcessDetail()
			await getEquipment()
			await getTableList()
		}
		if (autoConnectBlueTooth.value) {
			autoConnectBlueTooth.value.checkBlueTooth()
		}
	})
	onBeforeUnmount(() => {
		clearInterval(getEquipmentDataTimer.value)
	})

	// 初始化函数
	const oriForm = (obj : Obj = {}) : Obj => {
		return {
			orgIds: obj.factoryId,
			lineId: "",
			lineDetailId: "",
			processId: 0,
			productCode: "",
			productName: "",
			cusProductCode: "",
			// 提交数量
			submitNum: 1,
			okNum: "",
			ngNum: "",
			// 是否需要检验单
			checked: "",
			// 首末件检查
			checkFirstFinal: 0,
			firstNum: 0,
			finalNum: 0,
			// 各条码
			barcode1: "",
			barcodeName1: BarcodeNames[obj.relation1] || "",
			barcode2: "",
			barcodeName2: BarcodeNames[obj.relation2] || "",
			// 条码关联
			relation1: "",
			relation2: "",
			unbind: 0,
			fileUrl: "",
			fileName: "",
			toolingCode: "",
			remark: "",
			// 设备
			equipmentCode: "",
			equipmentMac: "",
			equipmentName: "",
			equipmentContent: "",
			equipmentResult: "-1" as keyof typeof ResultMap,
			// 提交类型
			statistics: "",
			// 是否打印
			isPrint: "",
			// 最终结果
			result: "1" as keyof typeof ResultMap,
			// 失效模式
			failureModeIds: "",
			failureModeNames: "",
			// 模版
			procedureCode: "" as P,
			procedureKindCode: 0 as PK,
			// 是否打印
			printed: 0,
			codeRules: [] as Objs,
			...obj,
			// 是否返工
			rework: "0",
			// submitType: props.submitType,
			// traceReworkId: props.traceReworkId
		}
	}

	// 数据
	const form = ref(oriForm())
	const codeRules = ref<Objs>([])
	const productSelected = ref<Objs>([])
	const traceTableRef = ref<Obj | null>(null)
	const equipments = ref<Objs[]>([])
	const checkRecords = ref<Objs>([])
	const failureModSelected = ref<Objs>([])
	const printTypeCheck = ref(0)
	const showEquipmentPicker = ref(false)
	const autoConnectBlueTooth = ref<Obj | undefined>()
	const getEquipmentDataTimer = ref<number | undefined>()
	const detailDialogVisible = ref(false)
	const manSelectResult = ref(false)

	// 监听
	watch(() => form.value.result, () => {
		if (form.value.result == 0) {
			printTypeCheck.value = 1
		} else {
			printTypeCheck.value = 0
		}
	})

	// 获取工序详情
	const getProcessDetail = async () => {
		try {
			uni.showLoading({
				mask: true,
				title: "产线详情获取中",
			})
			const res = await getLineDetail({
				lineDetailId: props.lineDetailId,
			})
			res.data.codeRules = res.data.codeRules ? JSON.parse(res.data.codeRules) : []
			form.value = oriForm(res.data || {})
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}
	// 获取提交记录
	const getTableList = async () => {
		if (traceTableRef.value) {
			traceTableRef.value.searchList({
				lineDetailId: form.value.lineDetailId,
			})
		}
	}

	// 选择产品
	const productSelect = () => {
		if (productSelected.value.length > 0) {
			form.value.productCode = productSelected.value.map((item) => item.productCode).join(",")
			form.value.productName = productSelected.value.map((item) => item.productName).join(",")
		} else {
			form.value.productCode = ""
			form.value.productName = ""
		}
		// 无论什么模版都获取规则，没有的话就空不展示
		getCodeRules()

		// 查询产品的提交结果数据
		getProductSubmitData()
	}
	// 查询产品的提交结果数据
	const getProductSubmitData = async () => {
		if (form.value.productCode) {
			const res = await getProductSubmitDataApi({
				...form.value
			})
			form.value.okNum = res.data.okNum
			form.value.ngNum = res.data.ngNum
		} else {
			form.value.okNum = ""
			form.value.ngNum = ""
		}
	}
	// 条码自配获取条码规则
	// complete：是否完全重置,默认否
	const getCodeRules = (complete ?: boolean) => {
		console.log(`构建产品${form.value.productCode}的条码自配列表`)
		console.log(`本工序条码规则：`, form.value.codeRules)
		for (const item of form.value.codeRules) {
			// 根据产品code匹配对应的点位
			if (item.productCode === form.value.productCode) {
				const oriCodeRules = codeRules.value
				codeRules.value = item.ruleList.map((item : Obj, index : number) => {
					// 如果不是完全重置则要保留原来的批次条码
					if (!complete && item.repeat === "批次") {
						for (const i of oriCodeRules) {
							if (item.codeRuleId === i.codeRuleId) {
								item.barCode = i.barCode
								break
							}
						}
					}

					// 赋值form的数据
					form.value[`barcode${Number(index) + 1}`] = item.barCode

					// 原对象没有barCode，加一个以便展示
					return {
						...item,
						inputFocus: false,
						barCode: item.barCode || "",
					}
				})

				// 定位到第一个输入框
				nextTick(() => {
					if (codeRules.value[0]) {
						codeRules.value[0].inputFocus = true
					}
				})

				console.log(`构建完条码规则：`, codeRules.value)
				return
			}
		}
		console.log(`构建完条码规则：`, codeRules.value)
		codeRules.value = []
	}
	// 条码自配扫码成功
	const codeRuleScanSuccess = async (res : string, item : Obj, index : number) => {
		item.barCode = res
		form.value[`barcode${Number(index) + 1}`] = res
		// 扫完码之后要进行特殊处理
		// ...
		if (item.barCode) {
			// 每次输入完，光标定位到空的那格
			for (const codeRule of codeRules.value) {
				if (!codeRule.barCode) {
					nextTick(() => {
						codeRule.inputFocus = true
					})
					return
				}
			}
			// 如果都填完了，则直接提交
			// submit()
			uni.hideKeyboard()
		}
	}

	// 获取设备
	const getEquipment = async () => {
		const res = await getEquipmentByLineDetailId({
			lineDetailId: props.lineDetailId,
		})
		if (res.data && res.data.length > 0) {
			equipments.value[0] = res.data
			const equipment = JSON.parse(uni.getStorageSync(form.value.lineDetailId + "traceEquipment") || "{}")
			if (equipment && equipment.equipmentCode) {
				form.value.equipmentCode = equipment.equipmentCode
				form.value.equipmentMac = equipment.equipmentMac
				form.value.equipmentName = equipment.equipmentName
			} else if (equipments.value[0].length > 0) {
				form.value.equipmentCode = equipments.value[0][0]?.equipmentCode
				form.value.equipmentMac = equipments.value[0][0]?.equipmentMac
				form.value.equipmentName = equipments.value[0][0]?.equipmentName
			}

			// // 获取设备数据
			getEquipmentDataTimer.value = setInterval(() => {
				getEquipmentData()
			}, 2000)
		}
	}
	// 打开设备选择项
	const openEquipmentPicker = () => {
		showEquipmentPicker.value = true
	}
	// 选择设备
	const equipmentSelect = useThrottle(async (res : { value : Objs }) => {
		// 选择设备后重置设备数据和结果
		form.value.equipmentContent = ""
		form.value.equipmentResult = "-1"
		let code = res.value[0]?.equipmentCode
		// 通过设备编码来获取设备名称
		showEquipmentPicker.value = false
		for (const item of equipments.value[0] || []) {
			if (item.equipmentCode === code) {
				form.value.equipmentCode = item.equipmentCode
				form.value.equipmentMac = item.equipmentMac
				form.value.equipmentName = item.equipmentName
				uni.setStorageSync(
					form.value.lineDetailId +
					"traceEquipment",
					JSON.stringify({
						equipmentCode: form.value.equipmentCode,
						equipmentMac: form.value.equipmentMac,
						equipmentName: form.value.equipmentName,
					}),
				)
				return
			}
		}
		// 如果码不正确，则都置空
		form.value.equipmentCode = ""
		form.value.equipmentName = ""
	})
	// 获取设备数据
	const getEquipmentData = async () => {
		if (form.value.equipmentCode && form.value.barcode1) {
			const res = await getEquipmentDataApi({
				...form.value
			})
			if (res.data) {
				form.value.equipmentContent = res.data
				form.value.equipmentResult = res.data.result
				if (!manSelectResult.value) {
					form.value.result = res.data.result.toString()
				}
				console.log("设备数据：", form.value.equipmentContent)
				return
			}
		}

		form.value.equipmentContent = ""
		form.value.equipmentResult = ""
	}
	// 展示设备数据
	const showEquipmentDetail = async () => {
		detailDialogVisible.value = true
	}
	// 隐藏设备数据
	const hideDetail = () => {
		detailDialogVisible.value = false
	}

	// 检验单
	const getCheckItemList = async () => {
		const res = await getCheckItemListApi({
			lineDetailId: form.value.lineDetailId,
			productCode: form.value.productCode,
		})
		checkRecords.value = res.data.map((item : Obj) => {
			return {
				...item,
				images: [], // 上传的图片
				result: "", // 检验结果
				reason: "", // 不合格理由
				failureModSelected: [], // 失效模式选择数组
				processId: form.value.processId, // 工序id
			}
		})
	}
	// 检验单选择完条码后，要设置最终的失效模式
	const setFailureMod = () => {
		const arr = checkRecords.value
			.filter((item) => item.failureModeId)
			.map((item) => {
				return {
					id: item.failureModeId,
					failureModeName: item.failureModeName,
				}
			})
		// 去重
		failureModSelected.value = useRmRepeat(arr)({
			condition: (item) => item.id,
		})
	}
	// 检验单结果出来后，设置最终的结果
	const setFormResult = () => {
		if (checkRecords.value.length === 0 || checkRecords.value.filter((item) => !item.result).length > 0) {
			form.value.result = "1"
		} else if (checkRecords.value.filter((item) => item.result === "0").length > 0) {
			form.value.result = "0"
		} else {
			form.value.result = "1"
		}
	}
	// 失效模式
	const failuerModSelect = () => {
		if (failureModSelected.value.length > 0) {
			form.value.failureModeIds = failureModSelected.value.map((item) => item.id).join(",")
			form.value.failureModeNames = failureModSelected.value.map((item) => item.failureModeName).join(",")
		} else {
			form.value.failureModeIds = ""
			form.value.failureModeNames = ""
		}
	}

	// 提交前前端校验
	const preSubmit = (type : P) => {
		for (const item of codeRules.value) {
			if (!item.barCode) {
				setCustomModal({
					visiable: true,
					content: "请输入条码",
				})
				return false
			}
		}
		// if (!!form.value.equipmentCode && !form.value.equipmentContent) {
		// 	setCustomModal({
		// 		visiable: true,
		// 		content: "没有获取到设备数据",
		// 	})
		// 	return false
		// }
		if (form.value.result == 0 && !form.value.failureModeIds) {
			setCustomModal({
				visiable: true,
				content: "请选择失效模式",
			})
			return false
		}
		return true
	}
	// 提交前后端校验
	const codeCheckInfoHandler = async () => {
		try {
			uni.showLoading({
				mask: true,
				title: "条码校验中",
			})
			const res = await codeCheckInfoApi({
				...form.value,
			})
			if (res.data && res.data.canSave === 1) {
				return true
			} else {
				let message = ""
				// 如果有返回消息则显示消息
				if (res.data.checkCodeMsg) {
					message = res.data.checkCodeMsg
				}
				// 没有返回消息，都是上道工序检查未通过
				else if (res.data.prevCheck && !res.data.prevResult) {
					message = "上道工序检查未通过"
				}
				// 提示消息
				setCustomModal({
					visiable: true,
					content: message,
					// 有些报错提示需要解锁码解锁
					success: () => {
						return true
					},
					cancel: () => {
						return true
					},
				})
				return false
			}
		} catch (err) {
			console.log(err)
			return false
		} finally {
			uni.hideLoading()
		}
	}
	// 提交
	const submit = useThrottle(async () => {
		const ret = preSubmit(form.value.procedureCode)
		if (!ret) return
		// const ree = await codeCheckInfoHandler()
		// if (!ree) return
		try {
			uni.showLoading({
				mask: true,
				title: "提交中",
			})
			// 构造提交参数
			const params : Obj = Object.assign({}, form.value)
			params.barcodeList = codeRules.value

			// 提交
			await productJobSubmit(params)
			uni.showToast({
				icon: "none",
				title: "提交成功",
			})
			// 如果打印，则打印条码
			if (form.value.isPrint == 1 && printTypeCheck.value === 1) {
				printBoxBarcode(form.value)
			}
			// 获取提交记录
			await getTableList()

			// 重置数据
			await reset()
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	})
	// 重置(保留基础数据)
	const reset = useThrottle(async () => {
		// 重置参数，有些保留，有些重置
		form.value = oriForm({
			...form.value,
			result: "1",
		})
		// 触发重新选择产品
		productSelect()
		failureModSelected.value = []
		failuerModSelect()
		manSelectResult.value = false
	})
</script>

<style scoped lang="scss">
	.grid-title {
		padding: 20rpx 0;
	}

	.print-btn-box {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
	}

	.btn-box {
		display: flex;
		justify-content: space-between;
		margin: 10px 0;

		.btn+.btn {
			margin-left: 5px;
		}
	}

	.radio-group {
		justify-content: space-around;
	}
</style>