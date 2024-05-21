<script lang='ts' setup>
	import {
		ref,
		onMounted,
		onBeforeUnmount,
		watch,
	} from "vue"
	// 类型
	import type {
		UploadMedia
	} from "@/type/file"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import TraceTablePK1 from "./components/TraceTablePK1.vue"
	import TraceTablePK2 from "./components/TraceTablePK2.vue"
	import TraceTablePK3 from "./components/TraceTablePK3.vue"
	import TraceTablePK4 from "./components/TraceTablePK4.vue"
	import UpInputScan from "@/components/UpInputScanNew.vue"
	import MediaUpload from "@/components/MediaUpload.vue"
	import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"
	import CheckRecord from "./components/CheckRecord.vue"
	import PrintTypeCheck from "@/components/PrintTypeCheck.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 工具
	import {
		useThrottle,
		useRmRepeat
	} from "@ultra-man/noa"
	// 接口
	import {
		getProcessDetail,
		getLineDetail,
		getEquipmentByLineDetailId,
		getCheckItemListApi,
		productJobSubmit,
		productJobDel,
		checkHeadTail
	} from "@/api/trace"
	import {
		getWorkPlan
	} from "@/api/workPlan"
	// 静态数据
	import {
		P,
		PK,
		BarcodeNames
	} from "./enum"

	const props = defineProps < {
			lineDetailId ? : string,
			procedureName ? : string,
			planCode ? : string
		} >
		()

	onMounted(async () => {
		await getProcess()
		await getLine()
		if (props.planCode) {
			form.value.planCode = props.planCode
			// #ifdef APP-PLUS
			getPlanInfo(props.planCode)
			// #endif
		}
	})
	onBeforeUnmount(() => {
		clearInterval(airtightnessInterval)
	})

	// 表单数据
	const initForm = (): Obj => {
		return {
			lineDetailId: props.lineDetailId,

			planId: "",
			planCode: "",
			productCode: "",
			planNum: "",
			realNum: "",
			// 是否需要检验单
			checked: "",
			// 首末件
			checkFirstFinal: 0,
			firstNum: 0,
			finalNum: 0,
			// 各条码
			barcode1: "",
			barcodeName1: "",
			barcode2: "",
			barcodeName2: "",
			barcode3: "",
			barcode4: "",
			barcode5: "",
			barcode6: "",

			scanCode: 0,

			relation1: "",
			relation2: "",
			// 提交数量
			thisNum: "",

			unbind: 0,
			// 提交类型
			submitType: "1",

			statistics: "",

			result: "1",

			images: [] as UploadMedia[],
			fileUrl: "",
			fileName: "",

			toolingCode: "",

			remark: "",

			equipmentCode: "",
			equipmentMac: "",

			processId: "",
			orgIds: "",

			failureModeIds: "",
			failureModeNames: "",

			procedureCode: "",
			procedureKindCode: -1,
		}
	}
	const initFormPlan = () => {
		form.value.planCode = ""
		form.value.productCode = ""
		form.value.planNum = ""
		form.value.realNum = ""
		form.value.checked = ""
	}
	const form = ref(initForm())

	// 获取流程详情
	const getProcess = async () => {
		await getProcessDetail({
			lineDetailId: props.lineDetailId
		})
	}
	// 获取产线详情
	let airtightnessInterval = 0
	const getLine = async () => {
		const res = await getLineDetail({
			lineDetailId: props.lineDetailId
		})
		const {
			procedureCode,
			procedureKindCode,
			processId,
			factoryId,
			submitType = "1",
			statistics,
			relation1,
			relation2,
			unbind,
			scanCode,
			checked,
			checkFirstFinal,

		} = res.data
		form.value.processId = processId
		form.value.orgIds = factoryId
		form.value.procedureCode = procedureCode
		form.value.procedureKindCode = procedureKindCode
		form.value.submitType = String(submitType)
		form.value.statistics = statistics
		form.value.barcodeName1 = BarcodeNames[relation1] || ""
		form.value.barcodeName2 = BarcodeNames[relation2] || ""
		form.value.unbind = unbind
		form.value.scanCode = scanCode
		form.value.checkFirstFinal = checkFirstFinal

		// 如果是数据采集，则获取设备，和定时获取报工列表
		if (res.data.procedureKindCode == PK.数据采集) {
			getEquipment()
			airtightnessInterval = setInterval(() => {
				if (traceTableRef.value) {
					traceTableRef.value.searchList({
						barcode1: form.value.barcode1
					})
				}
			}, 10000)
		}
		form.value.checked = checked || ""

	}
	// 获取设备
	const getEquipment = async () => {
		const res = await getEquipmentByLineDetailId({
			lineDetailId: props.lineDetailId
		})
		if (res.data && res.data.length > 0) {
			form.value.equipmentCode = res.data[0].equipmentCode
			form.value.equipmentMac = res.data[0].equipmentMac
		}
	}

	// 计划扫码
	const getPlanInfo = async (resCode ? : string) => {
		if (resCode) {
			try {
				uni.showLoading({
					title: "数据获取中"
				})
				const res = await getWorkPlan({
					planCode: resCode,
					lineDetailId: form.value.lineDetailId
				})
				const {
					planId,
					productCode,
					planNum,
					realNum,
					firstNum,
					finalNum,
				} = res.data
				form.value.planId = planId;
				form.value.planCode = resCode
				form.value.productCode = productCode
				form.value.planNum = planNum
				form.value.realNum = realNum
				form.value.firstNum = firstNum
				form.value.finalNum = finalNum

				// 获取完计划，如果不是数据采集，则获取一次列表
				if (res.data.procedureKindCode !== PK.数据采集 && traceTableRef.value) {
					traceTableRef.value.searchList({
						lineDetailId: form.value.lineDetailId,
						planId: form.value.planId
					})
				}
				// 如果需要检验单的则获取检验单
				if (form.value.checked == "1") {
					getCheckItemList();
				}

			} catch (err) {
				initFormPlan()
			} finally {
				uni.hideLoading()
			}
		} else {
			initFormPlan()
		}
	}

	// barcode1扫码成功
	const barcode1ScanSuccess = (res: string) => {
		form.value.barcode1 = res
	}
	// barcode2扫码成功
	const barcode2ScanSuccess = (res: string) => {
		form.value.barcode2 = res
	}

	// 检验单
	const checkRecords = ref < Obj[] > ([])
	const getCheckItemList = async () => {
		const res = await getCheckItemListApi({
			lineDetailId: form.value.lineDetailId,
			productCode: form.value.productCode,
		})
		checkRecords.value = res.data.map((item: Obj) => {
			return {
				...item,
				images: [], // 上传的图片
				result: "", // 检验结果
				reason: "", // 不合格理由
				failureModSelected: [], // 失效模式选择数组
				processId: form.value.processId // 工序id
			}
		})
	}
	// 检验单选择完条码后，要设置最终的失效模式
	const setFailureMod = () => {
		const arr = checkRecords.value.filter(item => item.failureModeId).map(item => {
			return {
				id: item.failureModeId,
				failureModeName: item.failureModeName
			}
		})
		// 去重
		failureModSelected.value = useRmRepeat(arr)({
			deep: false,
			condition: item => item.id
		})
	}
	// 检验单结果出来后，设置最终的结果
	const setFormResult = () => {
		if (checkRecords.value.length === 0 || checkRecords.value.filter(item => !item.result).length > 0) {
			form.value.result = "";
		} else if (checkRecords.value.filter(item => item.result === "0").length > 0) {
			form.value.result = "0";
		} else {
			form.value.result = "1";
		}
	}

	// 失效模式
	const failureModSelected = ref < Obj[] > ([])
	const failuerModSelect = () => {
		if (failureModSelected.value.length > 0) {
			form.value.failureModeIds = failureModSelected.value.map(item => item.id).join(",")
			form.value.failureModeNames = failureModSelected.value.map(item => item.failureModeName).join(",")
		} else {
			form.value.failureModeIds = ""
			form.value.failureModeNames = ""
		}
	}

	// 工装模具
	const toolingScanSuccess = (res: string) => {
		form.value.toolingCode = res
	}

	// 是否打印
	const printTypeCheck = ref(uni.getStorageSync("productPrintTypeCheck") || 0)
	watch(printTypeCheck, (newV: number) => {
		uni.setStorageSync("productPrintTypeCheck", newV)
	})

	// 重置条码
	const equipmentLoading = ref(false)
	const resetBarCode1A2 = () => {
		form.value.barcode1 = ""
		form.value.barcode2 = ""
	}
	const resetBarCode1 = () => {
		form.value.barcode1 = ""
		equipmentLoading.value = false
	}

	// 提交前校验
	const preSubmit = (type ? : string) => {
		if (!form.value.planId) {
			uni.showModal({
				title: '提示',
				content: "请先填写计划id",
			});
			return false
		}
		if (type === P.定制流程3) {
			if (form.value.barcode1 != form.value.barcode2) {
				uni.showModal({
					title: '提示',
					content: "标签码不一致",
				});
				return false
			}
		}
		if (form.value.checked == "1") {
			for (const item of checkRecords.value) {
				if (item.needSurvey == '1') {
					if (item.surveyValue === "" || item.surveyValue === undefined || item.surveyValue === null) {
						uni.showModal({
							title: '提示',
							content: "请填写测量值",
						});
						return false
					}
				}
				if (item.needPicture && item.images.length <= 0) {
					uni.showModal({
						title: '提示',
						content: "请上传检验单图片",
					});
					return false
				}
				if (!item.result) {
					uni.showModal({
						title: '提示',
						content: "请选择检验单是否合格",
					});
					return false
				}
				if (item.result === '0' && item.failureModSelected.length <= 0) {
					uni.showModal({
						title: '提示',
						content: "请选择检验单失效模式",
					});
					return false
				}
				if (item.result === '0' && !item.reason) {
					uni.showModal({
						title: '提示',
						content: "请填写不合格理由",
					});
					return false
				}
				if (item.result === "0" && form.value.result === "1") {
					uni.showModal({
						title: '提示',
						content: "检测项目存在不合格，最终结果不能为合格",
					});
					return false
				}
				if (form.value.result == "0" && failureModSelected.value.length < 0) {
					uni.showModal({
						title: '提示',
						content: "请选择失效模式",
					});
					return false
				}
			}
		}
		return true
	}
	// 首末件校验
	const headTailCheck = async () => {
		// 如果开启了首末件检查
		if (form.value.checkFirstFinal) {
			// 如果没设置首末件数量，则提示
			if (!form.value.firstNum || !form.value.finalNum) {
				uni.showModal({
					title: '提示',
					content: "请先进行首末件检查设置",
				});
				return false
			}
			// 如果达到了要求，则先进行检查
			else if (form.value.realNum >= form.value.firstNum) {
				let checkTypeCode = 1
				if (form.value.realNum >= form.value.finalNum) {
					checkTypeCode = 2
				}
				await checkHeadTail({
					planCode: form.value.planCode,
					checkTypeCode
				})
				return true
			}
			// 如果未达到要求，则不校验
			else {
				return true
			}
		}
		// 如果此计划未开启首末件检查
		else {
			// 否则直接返回
			return true
		}
	}
	// 提交
	const submit = useThrottle(async (type ? : string) => {
		if (!preSubmit(type)) return
		const res = await headTailCheck()
		if (!res) return
		try {
			uni.showLoading({
				mask: true,
				title: "提交中"
			})
			// 构造提交参数
			const params = Object.assign({}, form.value)
			// 构造附件提交参数
			params.fileUrl = params.images.map((item: Obj) => item.url).join(",")
			params.fileName = params.images.map((item: Obj) => item.name).join(",")
			// 构造检验单提交参数
			if (form.value.checked == "1") {
				params.checkList = checkRecords.value.map((item) => {
					return {
						...item,
						imagesUrl: item.images.map((i: Obj) => i.url).join(",")
					}
				})
			}
			// 提交
			const res = await productJobSubmit(params)
			uni.showToast({
				icon: "none",
				title: "提交成功"
			})
			// 提交完重新获取计划
			await getPlanInfo(form.value.planCode)
			// 重置数据
			form.value.thisNum = "1"
			form.value.remark = ""
			form.value.toolingCode = ""
			form.value.images = []
			failureModSelected.value = []
			// 如果是气密
			if (form.value.procedureKindCode == PK.数据采集) {
				equipmentLoading.value = true;
			}
			// 如果不是气密
			else {
				form.value.barcode1 = "";
				if (form.value.procedureCode != P.条码关联返工) {
					form.value.barcode2 = "";
				}
				form.value.barcode3 = "";
				form.value.barcode4 = "";
				form.value.barcode5 = "";
				form.value.barcode6 = "";
				// 如果选择了确认打印，则跳到打印界面
				if (printTypeCheck.value === 0) {
					uni.navigateTo({
						url: `${routes.ProductJobPrinter.path}?id=${res.data}`,
					})
				}
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	})
	// 条码解绑
	const submitDel = async () => {
		try {
			uni.showLoading({
				title: "解绑中"
			})
			await productJobDel(form.value)
			uni.showToast({
				icon: "none",
				title: "解绑成功"
			})
			// 提交完重新获取计划
			await getPlanInfo(form.value.planCode)
			// 重置数据
			form.value.thisNum = "1"
			form.value.remark = ""
			form.value.toolingCode = ""
			failureModSelected.value = []
			form.value.barcode1 = ""
			form.value.barcode2 = ""
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}

	// 表格ref
	const traceTableRef = ref < Obj | null > (null)
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="procedureName"></CustomNavBar>

		<!-- 基础数据表单 -->
		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="计划单号:" borderBottom labelWidth="80" style="padding: 0" required>
				<up-input-scan v-model="form.planCode" placeholder="请输入计划单号" clearable class="input-item" focus
					@scanSuccess="getPlanInfo"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="产品编码:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.productCode" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="计划数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.planNum" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="实际数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.realNum" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<!-- 根据不同模版显示不同选项 -->
			<template v-if="form.procedureKindCode == PK.定制流程">
				<up-form-item class="common-form-item" label="检具编码:" borderBottom labelWidth="80" style="padding: 0" required
					v-if="form.procedureCode == P.定制流程1">
					<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
						@scanSuccess="barcode2ScanSuccess"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="包装码:" borderBottom labelWidth="80" style="padding: 0" required
					v-if="form.procedureCode == P.定制流程2">
					<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
						@scanSuccess="barcode2ScanSuccess"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="标签码:" borderBottom labelWidth="80" style="padding: 0" required
					v-if="form.procedureCode == P.定制流程3">
					<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
						@scanSuccess="barcode2ScanSuccess"></up-input-scan>
				</up-form-item>
			</template>

			<up-form-item class="common-form-item" :label="`${form.barcodeName1}:`" borderBottom labelWidth="80"
				style="padding: 0" :required="form.scanCode !== 1">
				<!-- 后端配了必须扫码才必须要扫码 -->
				<up-input-scan v-model="form.barcode1" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode1ScanSuccess"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" :label="`${form.barcodeName2}:`" borderBottom labelWidth="80"
				style="padding: 0" required v-if="form.procedureKindCode == PK.条码关联">
				<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode2ScanSuccess"></up-input-scan>
			</up-form-item>

			<template v-if="form.procedureCode == P.多原料绑定">
				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode3" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode4" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode5" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode6" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>
			</template>

			<up-form-item class="common-form-item" label="客供条码:" borderBottom labelWidth="80" style="padding: 0"
				v-if="form.procedureCode == P.条码关联返工">
				<up-input v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.thisNum" placeholder="请输入数量" clearable class="input-item" type="number"></up-input>
			</up-form-item>
		</up-form>

		<!-- 检验单 -->
		<up-text text="检验单明细:" class="grid-title" bold v-if="checkRecords && checkRecords.length"></up-text>
		<CheckRecord :checkItems="checkRecords" :form="form" @setFormResult="setFormResult" @setFailureMod="setFailureMod"
			v-if="checkRecords && checkRecords.length">
		</CheckRecord>

		<!-- 参数表单 -->
		<up-form class="common-form common-form-next" labelPosition="left">
			<up-form-item class="common-form-item" label="是否返工:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.扫码登记返工, P.条码关联返工].includes(form.procedureCode) && form.submitType">
				<u-radio-group placement="row" class="radio-group" v-model="form.submitType">
					<u-radio :name="'2'" label="是"></u-radio>
					<u-radio :name="'1'" label="否" style="margin-left: 10px;"></u-radio>
				</u-radio-group>
			</up-form-item>

			<up-form-item class="common-form-item" label="是否合格:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.statistics == 1">
				<u-radio-group placement="row" class="radio-group" v-model="form.result">
					<u-radio :name="'1'" label="是"></u-radio>
					<u-radio :name="'0'" label="否" style="margin-left: 10px;"></u-radio>
				</u-radio-group>
			</up-form-item>

			<up-form-item class="common-form-item" label="失效模式:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.result === '0'">
				<TraceFailureModPicker v-model:selected="failureModSelected" @select="failuerModSelect"
					:processId="form.processId" :orgIds="form.orgIds" readonly border="none" placeholder="请选择失效模式"
					:multiple="true">
				</TraceFailureModPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="附件:" borderBottom labelWidth="80" style="padding: 0"
				v-if="form.procedureKindCode == PK.扫码登记 || (form.procedureKindCode == PK.定制流程 && [P.多原料绑定, P.条码关联返工, P.扫码登记返工].includes(form.procedureCode))">
				<media-upload v-model="form.images" accept="image"></media-upload>
			</up-form-item>
			<!-- end -->

			<up-form-item class="common-form-item" label="设备编号:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.equipmentCode" placeholder="自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="工装/模具:" borderBottom labelWidth="80" style="padding: 0">
				<up-input-scan v-model="form.toolingCode" @scanSuccess="toolingScanSuccess" placeholder="请输入工装/模具" clearable
					class="input-item"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.remark" placeholder="请输入备注" clearable class="input-item"></up-input>
			</up-form-item>
		</up-form>

		<!-- 是否打印 -->
		<PrintTypeCheck class="print-check-box" v-model="printTypeCheck" label="是否打印:" style="margin-top: 10px;">
		</PrintTypeCheck>

		<!-- 按钮操作 -->
		<view class="btn-box" v-if="form.procedureKindCode === PK.条码关联">
			<up-button type="primary" class="btn" shape="circle" @click="submit">绑 定</up-button>
			<up-button type="error" class="btn" shape="circle" v-if="form.unbind == 1" @click="submitDel">解 绑</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1A2">重 置</up-button>
		</view>

		<view v-if="form.procedureKindCode === PK.数据采集 && equipmentLoading" style="text-align: center; margin-top: 5px;"
			class="success">设备数据采集中...</view>
		<view class="btn-box" v-if="form.procedureKindCode === PK.数据采集">
			<up-button type="primary" class="btn" shape="circle" @click="submit">确 认</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1">更 换</up-button>
		</view>

		<view class="btn-box" v-if="form.procedureKindCode === PK.扫码登记">
			<up-button type="primary" class="btn" shape="circle" @click="submit">确 认</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1">重 置</up-button>
		</view>

		<view class="btn-box" v-if="form.procedureKindCode === PK.定制流程">
			<up-button type="primary" class="btn" shape="circle" v-if="form.procedureCode === P.定制流程1"
				@click="submit">检具检测</up-button>
			<up-button type="primary" class="btn" shape="circle" v-else-if="form.procedureCode === P.定制流程2"
				@click="submit">包装检测</up-button>
			<up-button type="primary" class="btn" shape="circle" v-else-if="form.procedureCode === P.定制流程3"
				@click="submit(P.定制流程3)">标签码检测</up-button>
			<up-button type="primary" class="btn" shape="circle" v-else @click="submit">确 认</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1A2">重 置</up-button>
		</view>

		<!-- 表格 -->
		<TraceTablePK1 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.条码关联">
		</TraceTablePK1>
		<TraceTablePK2 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.数据采集">
		</TraceTablePK2>
		<TraceTablePK3 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.扫码登记">
		</TraceTablePK3>
		<TraceTablePK4 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.定制流程">
		</TraceTablePK4>
	</view>
</template>

<style scoped lang='scss'>
	.grid-title {
		padding: 20rpx 0;
	}

	.btn-box {
		display: flex;
		justify-content: space-between;
		margin: 10px 0;

		.btn+.btn {
			margin-left: 5px;
		}
	}
</style>