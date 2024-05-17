<script lang='ts' setup>
	import {
		ref,
		computed,
		watch,
		nextTick,
		onMounted
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import PrinterPicker from "@/components/PrinterPicker.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 工具
	import {
		useThrottle
	} from "@ultra-man/noa"
	// api
	import {
		getProductJobDetail,
		printProductJob
	} from "@/api/trace"

	const props = defineProps < {
		id: string
	} > ()

	onMounted(() => {
		const printerName = uni.getStorageSync("printer") as string
		if (printerName) {
			printerSelected.value = [printerName]
		}
		getDetail()
	})

	const getDetail = async () => {
		uni.showLoading({
			title: "报工信息获取中",
			mask: true
		})
		try {
			const res = await getProductJobDetail({
				traceId: props.id
			})
			const {
				boxNum,
				thisNum,
				printEditAble,
				productCode,
				productName,
				cusProductCode,
				planCode,
				createTime,
				lineCode,
				lineName,
			} = res.data
			productJobDetail.value.thisNum = thisNum
			productJobDetail.value.printEditAble = printEditAble
			productJobDetail.value.productCode = productCode
			productJobDetail.value.productName = productName
			productJobDetail.value.cusProductCode = cusProductCode
			productJobDetail.value.planCode = planCode
			productJobDetail.value.createTime = createTime
			productJobDetail.value.lineCode = lineCode
			productJobDetail.value.lineName = lineName
			form.value.boxNum = boxNum || thisNum
			genLabelInfoList()
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}

	// 报工详情
	const productJobDetail = ref < Obj > ({
		thisNum: null,
		boxNum: null,
		printEditAble: "1",
		productCode: "",
		productName: "",
		cusProductCode: "",
		planCode: "",
		createTime: "",
		lineCode: "",
		lineName: "",
	})

	// 需要提交的表单
	const form = ref < Obj > ({
		id: props.id,
		printerName: "",
		boxNum: null,
	})
	const boxCount = computed(() => {
		if (!form.value.boxNum) return 0
		if (productJobDetail.value.thisNum % form.value.boxNum === 0) {
			return productJobDetail.value.thisNum / form.value.boxNum
		} else {
			return Math.ceil(productJobDetail.value.thisNum / form.value.boxNum)
		}
	})

	// 组件没提供最大最小值限制
	watch(() => form.value.boxNum, (newValue) => {
		if (newValue > productJobDetail.value.thisNum) {
			nextTick(() => {
				form.value.boxNum = productJobDetail.value.thisNum
			})
			return
		}
		if (newValue < 0) {
			nextTick(() => {
				form.value.boxNum = 0
			})
			return
		}
		if (Math.floor(newValue) != newValue) {
			nextTick(() => {
				form.value.boxNum = Math.floor(newValue)
			})
			return
		}
		nextTick(() => {
			form.value.boxNum = Math.floor(newValue)
		})
	})

	// 打印机选择
	const printerSelected = ref < string[] > ([])
	const printerSelect = (arr: string[]) => {
		if (arr && arr.length > 0) {
			form.value.printerName = arr[0]
			uni.setStorageSync("printer", form.value.printerName)
		}
	}

	// 标签列表, 标箱数量改变时，重新生成标签列表
	const labelInfoList = ref < Obj[] > ([])
	const genLabelInfoList = () => {
		const list: Obj[] = []
		if (productJobDetail.value.thisNum && form.value.boxNum) {
			const count = Math.floor(productJobDetail.value.thisNum / form.value.boxNum)
			const last = productJobDetail.value.thisNum % form.value.boxNum
			for (let i = 0; i < count; i++) {
				list.push({
					boxNum: form.value.boxNum
				})
			}
			if (last !== 0) {
				list.push({
					boxNum: last
				})
			}
		}
		labelInfoList.value = list
	}

	// 打印
	const print = useThrottle(async () => {
		try {
			uni.showLoading({
				title: "打印中..."
			})
			await printProductJob(form.value)
			uni.showToast({
				icon: "none",
				title: "打印完成",
				mask: true
			})
			// 打印完成后返回前一页
			// #ifdef APP-PLUS
			uni.navigateBack()
			// #endif
			// #ifdef H5
			history.back()
			// #endif
		} catch (err) {} finally {
			uni.hideLoading()
		}
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.ProductJobPrinter.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="打印机:" borderBottom labelWidth="80" style="padding: 0">
				<PrinterPicker v-model:selected="printerSelected" @select="printerSelect"></PrinterPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="报工数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input placeholder="报工数量" clearable class="input-item" :modelValue="productJobDetail.thisNum" border="none"
					type="number" ronly>
				</up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="标箱数量:" borderBottom labelWidth="80" style="padding: 0" required>
				<view style="padding: 0; width: 100%">
					<up-input placeholder="请输入标箱数量" clearable class="input-item" v-model="form.boxNum" type="number"
						@blur="genLabelInfoList" :readonly="productJobDetail.printEditAble != '1'"
						:border="productJobDetail.printEditAble != '1' ? 'none' : 'surround'">
					</up-input>
					<view class="error" style="font-size: 12px;" v-if="productJobDetail.printEditAble != '1'">
						此报工单已存在入库信息，无法修改标箱数量
					</view>
				</view>
			</up-form-item>

			<up-form-item class="common-form-item" label="箱数:" borderBottom labelWidth="80" style="padding: 0">
				<up-input placeholder="请输入标箱数量" clearable class="input-item" :modelValue="boxCount" border="none" readonly>
				</up-input>
			</up-form-item>
		</up-form>

		<up-text text="标签预览:" class="grid-title" bold></up-text>
		<view class="common-form common-form-next" labelPosition="left" v-for="item, key in labelInfoList" :key="key">
			<view class="qrCode-box">
				<w-qrcode :options="{ code: 'This QR code content is for informational purposes only !', size: 200}"></w-qrcode>
			</view>
			<view class="content-box">
				<view>
					产品编码：{{ productJobDetail.productCode }}
				</view>
				<view>
					产品名称：{{ productJobDetail.productName }}
				</view>
				<view>
					客户件号：{{ productJobDetail.cusProductCode }}
				</view>
				<view>
					生产订单号：{{ productJobDetail.planCode }}
				</view>
				<view>
					行号：{{ "/" }}
				</view>
				<view v-if="productJobDetail.createTime">
					批次号：{{ productJobDetail.createTime.split(" ")[0] }}
				</view>
				<view>
					数量： {{ item.boxNum }}
				</view>
				<view v-if="productJobDetail.createTime">
					生产日期：{{ productJobDetail.createTime.split(" ")[0]  }}
				</view>
				<view>
					产线编码：{{ productJobDetail.lineCode }}
				</view>
				<view>
					产线名称：{{ productJobDetail.lineName }}
				</view>
			</view>
		</view>

		<up-button type="primary" text="打印" class="bottom-button" @click="print" shape="circle"></up-button>
	</view>
</template>

<style scoped lang='less'>
	.grid-title {
		padding: 20rpx 0;
	}

	.common-form-next {
		padding: 10px 10px;
		display: flex;

		.qrCode-box {}

		.content-box {
			padding: 0 0 0 10px;
			font-size: 14px;
			font-weight: 600;
		}
	}

	.bottom-button {
		margin-top: 10px;
	}
</style>