<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		nextTick
	} from 'vue';
	// 组件
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import UpInputCustomerPicker from "@/components/UpInputCustomerPicker.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import DeliveryMaterialCard from "./components/DeliveryMaterialCard.vue"
	import EmptyContent from "@/components/EmptyContent.vue"
	// 工具
	import {
		useTable
	} from "@/hook/usePageTable"
	import {
		useThrottle
	} from "@ultra-man/noa"
	import {
		splitCodes
	} from "@/util/common"
	// 接口
	import {
		getBusiness
	} from "@/api/business"
	import {
		getDeliveryMaterialList
	} from "@/api/deliveryMaterial"
	// 数据
	import {
		states
	} from "./store"
	import {
		PickerTypeId
	} from "@/type/business"
	// 类型
	import type {
		Business
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	// 生成分页所需的数据和方法
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage,
		reSetList
	} = useTable(getDeliveryMaterialList, {
		state: ""
	})

	// 单据日期选择相关
	const dateSelected = ref([])

	// 客户选择
	const customerSelected = ref < Business[] > ([])

	// 物料编码扫码成功
	const scanSuccess = useThrottle(async (code: string) => {
		if (code) {
			try {
				const codeInfo = splitCodes(code)
				nextTick(() => {
					searchParam.value.cInvCode = codeInfo.code
				})
				const res = await getBusiness({
					id: PickerTypeId.MATERIAL,
					code: codeInfo.code
				})
				if (!res || res.data.list.length <= 0) {
					// uni.showToast({
					// 	title: "未查询到物料",
					// 	icon: "none"
					// })
					uni.showModal({
						title: '提示',
						content: "未查询到物料"
					});
					searchParam.value.cInvCode = ""
				}
			} catch (err) {
				console.log(err)
			}
		}
	}, 2000)

	// 发货状态
	const types = ref(states)

	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	// 分页重置并搜索
	const search = () => {
		if (customerSelected.value.length > 0) {
			searchParam.value.customerCode = customerSelected.value[0].code
		}
		if (dateSelected.value.length > 0) {
			searchParam.value.planDateStart = dateSelected.value[0] || ""
			searchParam.value.planDateEnd = dateSelected.value[1] || ""
		}
		reSetPage()
		searchList()
	}

	// 一切重置并搜索
	const reset = () => {
		customerSelected.value = []
		dateSelected.value = []
		reSetList()
	}
</script>

<template>
	<view class="common-page-container ">
		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="计划发货日期:" borderBottom labelWidth="100" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择计划发货日期" clearable class="input-item" readonly
					v-model:selected="dateSelected" mode="range">
				</UpInputDatePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="客户:" borderBottom labelWidth="100" style="padding: 0">
				<UpInputCustomerPicker border="none" placeholder="选择U8客户" readonly clearable class="input-item"
					v-model:selected="customerSelected">
				</UpInputCustomerPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="100" style="padding: 0">
				<up-input-scan v-model="searchParam.cInvCode" placeholder="扫码/手输物料编码" clearable class="input-item"
					@scanSuccess="scanSuccess"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="发货状态:" borderBottom labelWidth="100" style="padding: 0">
				<view class="type-check-box">
					<u-radio-group placement="row" class="radio-group" v-model="searchParam.state">
						<u-radio v-for="item, key in types" :key="key" :name="item.value" :label="item.name"></u-radio>
					</u-radio-group>
				</view>
			</up-form-item>
		</up-form>

		<view class="search-btn-box">
			<up-button type="primary" text="查询" class="bottom-button" @click="search" shape="circle"></up-button>
			<up-button text="重置" class="bottom-button" @click="reset" shape="circle"></up-button>
		</view>

		<view class="common-section-title">
			列表
		</view>

		<u-loading-icon v-show="searching" mode="circle" text="加载中..." :vertical="true"></u-loading-icon>
		<EmptyContent v-show="!searching && resultData?.list.length === 0" type="circle"></EmptyContent>
		<view class="card-list" v-show="!searching">
			<DeliveryMaterialCard class="card" v-for="item, key in resultData?.list" :key="key" :deliveryMaterial="item">
			</DeliveryMaterialCard>
		</view>

		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
				:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
		</view>
	</view>
</template>

<style scoped lang='scss'>
	.common-page-container {
		padding-bottom: 50px;
	}

	.type-check-box {
		width: 100%;
	}

	.radio-group {
		flex: 0;
		justify-content: space-between;
	}

	.search-btn-box {
		margin-top: 10px;
		display: flex;

		.bottom-button+.bottom-button {
			margin-left: 12rpx
		}
	}

	.card-list {
		.card+.card {
			margin-top: 10px;
		}
	}

	.page-box {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding-bottom: 10px;
		background-color: #fff;
	}
</style>