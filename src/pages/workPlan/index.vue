<script lang='ts' setup>
	import {
		ref,
		onMounted,
		watch
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScanNew.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 工具
	import {
		useThrottle,
		useTimesClick
	} from "@ultra-man/noa"
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getWorkPlanList
	} from "@/api/workPlan"

	onMounted(() => {
		searchList();
	})

	// 表格
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage
	} = useTable(getWorkPlanList, {
		orderField: "plan_date"
	})

	const scanSuccess = useThrottle((res: string) => {
		const arr = res.split("*")
		if (!res) {
			searchParam.value.lineDetailId = ""
			return
		}
		if (arr.length === 2) {
			searchParam.value.lineDetailId = arr[0]
			searchParam.value.processName = arr[1]
		} else {
			uni.showModal({
				title: '提示',
				content: "工序二维码不正确"
			});
			searchParam.value.lineDetailId = ""
			searchParam.value.processName = ""
		}
	}, 3000)

	// 单据日期选择相关
	const dateSelected = ref([])
	const dateSelect = (dates: string[]) => {
		if (dates.length > 0) {
			searchParam.value.planDateStart = dates[0]
			searchParam.value.planDateEnd = dates[1]
		}
	}

	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	// 开工
	const goWork = (item: Obj) => {
		uni.navigateTo({
			url: `${routes.TraceInfo.path}?lineDetailId=${item.lineDetailId}&procedureName=${item.processName}&planCode=${item.planCode}`,
		})
	}

	const goWorkDouble = useTimesClick(goWork)
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.LdWorkPlan.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="计划日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择计划日期" clearable class="input-item" readonly
					v-model:selected="dateSelected" @select="dateSelect" mode="range">
				</UpInputDatePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="工序二维码:" borderBottom labelWidth="90" style="padding: 0">
				<up-input-scan v-model="searchParam.processName" placeholder="请扫工序二维码" clearable class="input-item"
					@scanSuccess="scanSuccess"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="计划单号:" borderBottom labelWidth="90" style="padding: 0">
				<up-input placeholder="请输入计划单号" clearable class="input-item" v-model="searchParam.planCode">
				</up-input>
			</up-form-item>
		</up-form>

		<up-button type="primary" text="查询" class="bottom-button" @click="searchList" shape="circle"></up-button>

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">计划编号</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">排产日期</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">报工工序</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">产线</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">产品编号</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">产品名称</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">计划数量</uni-th>
					<uni-th class="nowrap table-fixed-right" align="left" width="100rpx">操作</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in resultData?.list" :key="key" @click='goWorkDouble(item)'>
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.planCode }}</uni-td>
					<uni-td class="nowrap">{{ item.planDate }}</uni-td>
					<uni-td class="nowrap">{{ item.processName }}</uni-td>
					<uni-td class="nowrap">{{ item.lineName }}</uni-td>
					<uni-td class="nowrap">{{ item.productCode }}</uni-td>
					<uni-td class="nowrap">{{ item.productName }}</uni-td>
					<uni-td class="nowrap">{{ item.planNum }}</uni-td>
					<uni-td class="nowrap primary table-fixed-right" @click="goWork(item)">开工</uni-td>
				</uni-tr>
			</uni-table>
		</view>
		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
				:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
		</view>


	</view>
</template>

<style scoped lang='less'>
	.bottom-button {
		margin-top: 10px;
	}

	.common-table {
		margin-top: 10px;
	}
</style>