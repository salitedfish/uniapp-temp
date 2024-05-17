<script lang='ts' setup>
	import {
		ref,
		onMounted
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 工具
	import {
		useTimesClick
	} from "@ultra-man/noa"
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getProductJobHistory
	} from "@/api/trace"
	// 
	import {
		nowFormat,
		preMonthFormat
	} from "@/store/common"

	onMounted(() => {
		searchList({
			createTimeStart: preMonthFormat,
			createTimeEnd: nowFormat
		})
	})

	// 时间
	const dateSelected = ref([preMonthFormat, nowFormat])
	const dateSelect = (dates: string[]) => {
		if (dates.length > 0) {
			searchParam.value.createTimeStart = dates[0]
			searchParam.value.createTimeEnd = dates[1]
		}
	}

	// 表格
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage
	} = useTable(getProductJobHistory, {
		// orderField: "plan_date"
	})
	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}


	const goPrinter = (obj: Obj) => {
		console.log("跳重打印的信息", obj)
		uni.navigateTo({
			url: `${routes.ProductJobPrinter.path}?id=${obj.traceId}`,
		})
	}
	const goWorkDouble = useTimesClick(goPrinter)
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.ProductJobList.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="报工日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="请选择报工日期" clearable class="input-item" readonly
					v-model:selected="dateSelected" @select="dateSelect" :maxDate="Date.now()" mode="range">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>

		<up-button type="primary" text="查询" class="bottom-button" @click="searchList" shape="circle"></up-button>

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">工序</uni-th>
					<!-- 					<uni-th class="nowrap" align="left" width="100rpx">产品编码</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">计划单号</uni-th> -->
					<uni-th class="nowrap" align="left" width="100rpx">报工人员</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">报工时间</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">操作</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in resultData?.list" :key="key" @click='goWorkDouble(item)'>
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.processName }}</uni-td>
					<!-- 					<uni-td class="nowrap">{{ item.productCode }}</uni-td>
					<uni-td class="nowrap">{{ item.planCode }}</uni-td> -->
					<uni-td class="nowrap">{{ item.createName }}</uni-td>
					<uni-td class="nowrap">{{ item.createTime }}</uni-td>
					<uni-td class="nowrap primary" @click="goPrinter(item)">重打印</uni-td>
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