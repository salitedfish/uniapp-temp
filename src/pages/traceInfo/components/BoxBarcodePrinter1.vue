<template>
	<view class="box">
		<up-button type="primary" class="btn" shape="circle" @click="prePrintHandle">生成二维码</up-button>

		<up-popup :show="dialog" mode="center" @close="hideDialog" :round="10">
			<view style="padding: 10px 15px; width: 85vw; min-height: 10vh;">
				<up-text text="确认生成二维码并打印？" class="grid-title" style="margin-bottom: 10px" bold></up-text>
				<!-- <up-form class="common-form">
					<up-form-item class="common-form-item" label="每箱数量:" borderBottom labelWidth="80" style="padding: 0">
						<up-input v-model="maxNum" placeholder="请输入每箱数量" clearable class="input-item"></up-input>
					</up-form-item>
				</up-form> -->
				<view class="btn-box">
					<up-button type="primary" class="small-btn" shape="circle" @click="hideDialog" size="small">取消</up-button>
					<up-button type="primary" class="small-btn" shape="circle" @click="printHandle" size="small">确认</up-button>
				</view>
			</view>
		</up-popup>
	</view>

</template>

<script lang='ts' setup>
	import {
		ref
	} from "vue"
	import {
		getBoxBarcode,
	} from "@/api/codeRule"
	import {
		printBoxBarcode1
	} from "../util"
	import {
		batchFormat
	} from "@/store/common"
	import {
		Platform
	} from "@/util/env"

	const props = defineProps < {
		productCode: string,
		cusProductCode: string,
		codeRule: Obj
	} > ()

	const emit = defineEmits < {
		(event: "startHideKeyboard"): void,
		(event: "stopHideKeyboard"): void,
		(event: "genSuccess", barcode: string): void,
	} > ()

	const maxNum = ref(Number(uni.getStorageSync("printMaxNum") || 27))
	const dialog = ref(false)

	// 取消打印
	const hideDialog = () => {
		dialog.value = false
		// uni.setStorageSync("printMaxNum", maxNum.value)
	}
	// 打印前操作
	const prePrintHandle = () => {
		dialog.value = true
	}
	// 打印操作
	const printHandle = async () => {
		let res: Obj = {}
		try {
			uni.showLoading({
				mask: true,
				title: "条码生成中"
			})
			res = await getBoxBarcode({
				codeRuleId: props.codeRule.codeRuleId,
				cusProductCode: props.cusProductCode,
				prefix: `TC${batchFormat}`,
				dig:5,
				maxNum: 1
			});
			console.log("条码生成结果", res)
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}

		if (res.data && res.data.length > 0) {
			hideDialog()
			printBoxBarcode1({
				barcode: res.data[0].barcode,
				// codeName: res.data[0].codeName,
				// productCode: props.productCode,
				// cusProductCode: props.cusProductCode,
				// maxNum: maxNum.value
			})
			// 改动：不直接打印码，生成码自动填到对应的位置
			emit("genSuccess", res.data[0].barcode)

		}
	}
</script>

<style scoped lang='less'>
	.box {
		flex: 1
	}

	.btn-box {
		margin-top: 10px;
		display: flex;

		.small-btn+.small-btn {
			margin-left: 5px;
		}
	}
</style>