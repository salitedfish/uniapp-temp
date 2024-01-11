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

	const form = ref < Obj < Business[] >> ({
		stockroomSelected: [],
		depSelected: [],
	})

	// 初始化默认值
	onMounted(() => {
		const configStr = uni.getStorageSync("sfCDefaultSet")
		if (configStr) {
			const config = JSON.parse(configStr)
			form.value = config
		}
	})

	// 保存
	const save = () => {
		uni.setStorageSync("sfCDefaultSet", JSON.stringify(form.value))
		uni.showToast({
			icon: "none",
			title: "保存成功"
		})
	}

	// 重置
	const reset = () => {
		form.value = {
			stockroomSelected: [],
			depSelected: [],
		}
		uni.removeStorageSync("sfCDefaultSet")
	}
</script>

<template>
	<view class="common-page common-page-container">
		<CommonNavBar :title="routes.sCDefaultSetPage.style.navigationBarTitleText"></CommonNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<view class="common-content">
			<up-form class="common-form" labelPosition="left">

				<up-form-item class="common-form-item" label="仓库名称:" borderBottom labelWidth="80" style="padding: 0" required>
					<UpInputStockroomPicker border="none" placeholder="选择仓库" clearable class="input-item" readonly
						v-model:selected="form.stockroomSelected">
					</UpInputStockroomPicker>
				</up-form-item>

				<up-form-item class="common-form-item" label="部门名称:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDepPicker border="none" placeholder="选择部门" clearable class="input-item" readonly
						v-model:selected="form.depSelected">
					</UpInputDepPicker>
				</up-form-item>

			</up-form>
		</view>

		<view class="btn-box">
			<up-button type="primary" text="保存设置" class="bottom-button" @click="save" shape="circle"></up-button>
			<up-button text="重置" class="bottom-button" @click="reset" shape="circle"></up-button>
		</view>

	</view>
</template>

<style scoped lang='scss'>
	.common-content {
		flex: 1;
		overflow-y: scroll;
	}

	.btn-box {
		display: flex;

		.bottom-button+.bottom-button {
			margin-left: 5px;
		}
	}
</style>