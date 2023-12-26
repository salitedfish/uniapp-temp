<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		onMounted
	} from 'vue';
	// 组件
	// 工具
	// 接口
	// 数据
	import {
		routes
	} from "@/store/route"
	// 类型
	import type {
		Business
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	import UpInputDepPicker from "@/components/UpInputDepPicker.vue"
	import UpInputStockroomPicker from "@/components/UpInputStockroomPicker.vue"
	import CommonNavBar from "@/components/CommonNavBar.vue"
	import UpInputOutSrTypePicker from "@/components/UpInputOutSrTypePicker.vue"
	import UpInputSrSaveTypePicker from "@/components/UpInputSrSaveTypePicker.vue"

	const form = ref < Obj < Business[] >> ({
		outStockroomSelected: [],
		inStockroomSelected: [],
		outDepSelected: [],
		inDepSelected: [],
		outStTypeSelected: [],
		inStTypeSelected: []
	})

	// 初始化默认值
	onMounted(() => {
		const configStr = uni.getStorageSync("srCDefaultSet")
		if (configStr) {
			const config = JSON.parse(configStr)
			form.value = config
		}
	})

	// 保存
	const save = () => {
		uni.setStorageSync("srCDefaultSet", JSON.stringify(form.value))
		uni.showToast({
			icon: "none",
			title: "保存成功"
		})
	}
</script>

<template>
	<view class="common-page common-page-container">
		<CommonNavBar :title="routes.srCDefaultSetPage.style.navigationBarTitleText"></CommonNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<view class="common-content">
			<up-form class="common-form" labelPosition="left">

				<up-form-item class="common-form-item" label="转出仓库:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputStockroomPicker border="none" placeholder="选择仓库" clearable class="input-item" readonly
						v-model:selected="form.outStockroomSelected">
					</UpInputStockroomPicker>
				</up-form-item>
				<up-form-item class="common-form-item" label="转入仓库:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputStockroomPicker border="none" placeholder="选择仓库" clearable class="input-item" readonly
						v-model:selected="form.inStockroomSelected">
					</UpInputStockroomPicker>
				</up-form-item>

				<up-form-item class="common-form-item" label="转出部门:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDepPicker border="none" placeholder="选择部门" clearable class="input-item" readonly
						v-model:selected="form.outDepSelected">
					</UpInputDepPicker>
				</up-form-item>
				<up-form-item class="common-form-item" label="转入部门:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDepPicker border="none" placeholder="选择部门" clearable class="input-item" readonly
						v-model:selected="form.inDepSelected">
					</UpInputDepPicker>
				</up-form-item>

				<up-form-item class="common-form-item" label="出库类别:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputOutSrTypePicker border="none" placeholder="选择出库类别" clearable class="input-item" readonly
						v-model:selected="form.outStTypeSelected">
					</UpInputOutSrTypePicker>
				</up-form-item>
				<up-form-item class="common-form-item" label="入库类别:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputSrSaveTypePicker border="none" placeholder="选择入库类别" clearable class="input-item" readonly
						v-model:selected="form.inStTypeSelected">
					</UpInputSrSaveTypePicker>
				</up-form-item>
			</up-form>
		</view>

		<view class="btn-box">
			<up-button type="primary" text="保存设置" class="bottom-button" @click="save" shape="circle"></up-button>
		</view>

	</view>
</template>

<style scoped lang='scss'>
	.common-content {
		flex: 1;
		overflow-y: scroll;
	}
</style>