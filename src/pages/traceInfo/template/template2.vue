<template>
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

	<up-form class="common-form" :class="{ 'common-form-next': true }" labelPosition="left">
		<up-form-item class="common-form-item" :label="`${item.codeName}:`" borderBottom labelWidth="80" style="padding: 0"
			required v-for="(item, key) in codeRules" :key="key">
			<up-input-scan :focus="item.inputFocus" v-model="item.barCode" placeholder="请输入条码" clearable class="input-item"
				@scanSuccess="(str: string) => codeRuleScanSuccess(str, item, key)"
				@blur="item.inputFocus = false"></up-input-scan>
		</up-form-item>
	</up-form>

	<!-- 按钮操作 -->
	<view class="btn-box">
		<up-button type="primary" class="btn" shape="circle" @click="submit">提 交</up-button>
		<up-button type="primary" class="btn" shape="circle" @click="reset">重 置</up-button>
	</view>

	<!-- 表格 -->
	<view class="tip">装箱提示：该箱码已装箱{{ boxInfo.totalCount }}件,还可装箱数量{{ boxInfo.leftCount }}件</view>
	<TraceTablePK2 ref="traceTableRef" :form="form" style="margin-top: 10px"> </TraceTablePK2>
</template>

<script lang="ts" setup>
	import { ref, onMounted, onBeforeUnmount, watch, nextTick, reactive } from "vue"
	// 类型
	import type { UploadMedia } from "@/type/file"
	// 组件
	import TraceTablePK2 from "../components/TraceTablePK2.vue"
	import UpInputScan from "@/components/UpInputScanNew.vue"
	import UpInputProductPicker from "@/components/UpInputProductPicker.vue"
	import { setCustomModal } from "@/store/customModal"
	// 数据
	import { globalColor } from "@/store/theme"
	// 工具
	import { useThrottle, useDebounce, useRmRepeat, useDownloadByURL } from "@ultra-man/noa"
	// 接口
	import { getLineDetail, productJobSubmit, codeCheckInfoApi, getProductSubmitDataApi, getBoxInfoApi } from "@/api/trace"
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
			await getTableList()
		}
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
			equipmentResult: "" as keyof typeof ResultMap,
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
			// 是否显示返工按钮
			reworked: 0,
			// 是否打印
			printed: 0,
			codeRules: [] as Objs,
			...obj,
			// submitType: props.submitType,
			// traceReworkId: props.traceReworkId
		}
	}

	// 数据
	const form = ref(oriForm())
	const codeRules = ref<Objs>([])
	const productSelected = ref<Objs>([])
	const traceTableRef = ref<Obj | null>(null)
	const failureModSelected = ref<Objs>([])
	const boxInfo = ref<Obj>({
		totalCount: 0,
		leftCount: 0,
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
		// 如果是第2个条码，则获取装箱信息
		if (index == 1) {
			getBoxInfo(res)
		}
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
		}
	}

	// 获取箱码信息
	const getBoxInfo = async (code : string) => {
		const res = await getBoxInfoApi({
			code,
		})
		boxInfo.value = res.data
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
		if (boxInfo.value.leftCount <= 0) {
			setCustomModal({
				visiable: true,
				content: "该箱码无可装箱数量",
			})
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
		const ree = await codeCheckInfoHandler()
		if (!ree) return
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
			// 获取提交记录
			await getTableList()

			// 获取装箱信息
			await getBoxInfo(params.barcodeList[1]?.barCode)

			// 重置数据
			await reset()
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	})
	// 重置
	const reset = useThrottle(async () => {
		// 重置参数，有些保留，有些重置
		form.value = oriForm({
			...form.value,
			result: "1",
		})
		// 触发重新选择产品
		productSelect()
		failureModSelected.value = []
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

	.tip {
		color: v-bind("globalColor.error");
	}
</style>