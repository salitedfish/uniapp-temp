<script lang='ts' setup>
	import {
		ref,
		computed
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScanNew.vue"
	import TraceEquipmentSchemePicker from "@/components/TraceEquipmentSchemePicker.vue"
	import CheckoutItems from "./components/CheckoutItems.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		userInfo
	} from "@/store/auth"
	import {
		nowFormat
	} from "@/store/common"
	// 工具
	import {
		useThrottle
	} from "@ultra-man/noa"
	// api
	import {
		getTmlmByCode,
		getEquipmentSchemeChildList,
		submitEquipentSchemeCheckout
	} from "@/api/trace"

	const initForm = () => {
		return {
			employeName: userInfo.value.jobName,
			employeId: userInfo.value.orgId,
			date: nowFormat,
			cardCode: "",
			cardName: "",
			remark: "",
			barcodeId: "",
			schemeId: "",
			schemeName: "",
			instructionVideo: "",
			result: "",
		}
	}
	const form = ref(initForm())

	// 卡片扫码
	const cardInfo = ref < Obj > ({})
	const scanSuccess = useThrottle(async (res: string) => {
		if (res) {
			try {
				form.value.cardCode = res
				const tmlm = await getTmlmByCode({
					cardCode: res
				})
				cardInfo.value = tmlm.data
				form.value.cardName = tmlm.data.cardName
				form.value.barcodeId = tmlm.data.id
			} catch (err) {
				form.value.cardCode = ""
				form.value.cardName = ""
			}
		} else {
			form.value.cardName = ""
		}
	}, 3000)

	// 保养方案
	const equipmentSchemeSelected = ref < Obj[] > ([])
	const equipmentSchemeSelect = (res: Obj[]) => {
		if (res && res.length > 0) {
			form.value.instructionVideo = res[0].instructionVideo
			form.value.schemeId = res[0].id
			form.value.schemeName = res[0].name
			getSchemeChildList()
		} else {
			form.value.instructionVideo = ""
			form.value.schemeId = ""
			form.value.schemeName = ""
		}
	}

	// 点检项目
	const tableData = ref < Obj[] > ([])
	const searching = ref(false)
	const getSchemeChildList = async () => {
		searching.value = true
		tableData.value = []
		try {
			const res = await getEquipmentSchemeChildList({
				schemeId: form.value.schemeId
			});
			if (res.data) {
				tableData.value = res.data.map(item => {
					return {
						...item,
						measure: "", // 测量值
						reason: "", // 不合格理由
						result: "", // 默认合格
						images: [], //要上传的图片数组
					}
				})
			}
		} catch (err) {
			console.log(err)
		} finally {
			searching.value = false
		}
	}

	const test = () => {
		console.log(tableData)
	}
	// 最终结果
	const setFormResult = () => {
		console.log(tableData.value)
		if (tableData.value.length === 0 || tableData.value.filter(item => !item.result).length > 0) {
			form.value.result = "";
		} else if (tableData.value.filter(item => item.result === "不合格").length > 0) {
			form.value.result = "不合格";
		} else {
			console.log(333)
			form.value.result = "合格";
		}
	}
	const resultDisabled = computed(() => {
		if (tableData.value && tableData.value.length > 0) {
			return tableData.value.filter(item => !item.result).length > 0;
		} else {
			return true;
		}
	})

	// 提交
	const preSubmit = () => {
		if (!form.value.cardCode) {
			uni.showModal({
				title: '提示',
				content: "请先输入卡片编号",
			});
			return false
		}
		if (!form.value.schemeId) {
			uni.showModal({
				title: '提示',
				content: "请先选择保养方案",
			});
			return false
		}
		for (const item of tableData.value) {
			if (!item.result) {
				uni.showModal({
					title: '提示',
					content: "请先选择完点检项目是否合格",
				});
				return false
			}
			if (item.result === "不合格" && form.value.result === "合格") {
				uni.showModal({
					title: '提示',
					content: "点检项目存在不合格，最终结果不能为合格",
				});
				return false
			}
		}
		if (!form.value.result) {
			uni.showModal({
				title: '提示',
				content: "请先选择最终是否合格",
			});
			return false
		}
		return true
	}
	const submit = useThrottle(async () => {
		if (preSubmit()) {
			uni.showLoading({
				title: "提交中",
				icon: "none",
				mask: true,
			})
			try {
				const params = Object.assign({}, form.value, {
					// 格式化点检项目
					sublists: JSON.stringify(
						tableData.value.map(({
							id,
							result,
							images,
							image,
							measure = "",
							reason = ""
						}) => {
							return {
								spotcheckId: id,
								result,
								images: images.map(((item: Obj) => item.url)).join(","),
								image,
								measure,
								reason
							};
						})
					),
				});
				await submitEquipentSchemeCheckout(params)
				uni.showToast({
					title: "点检提交成功",
					icon: "none"
				})
				form.value = initForm()
				cardInfo.value = {}
				tableData.value = []
				equipmentSchemeSelected.value = []
			} catch (err) {
				console.log(err)
			} finally {
				uni.hideLoading()
			}
		}
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.EquipmentCheck.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="点检人:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input border="none" placeholder="自动带出" clearable class="input-item" v-model="form.employeName" readonly>
				</up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="点检日期:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input border="none" placeholder="自动带出" clearable class="input-item" v-model="form.date" readonly>
				</up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="卡片编号:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input-scan v-model="form.cardCode" placeholder="请输入卡片编号" clearable class="input-item"
					@scanSuccess="scanSuccess" focus></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="卡片名称:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input v-model="form.cardName" placeholder="输入卡片编号,自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="90" style="padding: 0">
				<up-input v-model="form.remark" placeholder="请输入备注" clearable class="input-item"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="保养方案:" borderBottom labelWidth="90" style="padding: 0">
				<TraceEquipmentSchemePicker v-model:selected="equipmentSchemeSelected" @select="equipmentSchemeSelect"
					border="none" placeholder="请选择保养方案" readonly clearable :cardId="cardInfo.id">
				</TraceEquipmentSchemePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="保养指导视频:" borderBottom labelWidth="90" style="padding: 0"
				v-if="form.instructionVideo">
				<video style="width: 100%; height: 40vw" :src="form.instructionVideo">
					您的浏览器不支持播放
				</video>
			</up-form-item>
		</up-form>

		<up-text text="点检项目" class="grid-title" bold></up-text>

		<CheckoutItems :items="tableData" @setFormResult="setFormResult"></CheckoutItems>

		<up-form class="common-form common-form-next" labelPosition="left">
			<up-form-item class="common-form-item" label="点检结果:" borderBottom labelWidth="90" style="padding: 0" required>
				<u-radio-group placement="row" class="radio-group" v-model="form.result" :disabled="resultDisabled">
					<u-radio name="合格" label="合格"></u-radio>
					<u-radio name="不合格" label="不合格" style="margin-left: 10px;"></u-radio>
				</u-radio-group>
			</up-form-item>
		</up-form>

		<view class="btn-box">
			<up-button type="primary" class="btn" shape="circle" disabled>审核并报修</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="submit">审核</up-button>
		</view>
	</view>
</template>

<style scoped lang='less'>
	.grid-title {
		padding: 20rpx 0rpx;
	}

	.btn-box {
		display: flex;
		justify-content: space-between;
		margin: 10px 0;
		padding-bottom: 100px;

		.btn {
			width: 48%;
			margin: 0;
		}
	}
</style>