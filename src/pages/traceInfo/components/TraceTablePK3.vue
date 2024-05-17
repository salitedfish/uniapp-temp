<script lang='ts' setup>
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getTracePageList
	} from "@/api/trace"

	const props = defineProps < {
		form: Obj
	} > ()

	// 生成分页所需的数据和方法
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage,
		reSetList
	} = useTable(getTracePageList, {
		lineDetailId: props.form.lineDetailId,
		planId: props.form.planId
	})

	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	defineExpose({
		searchList,
		reSetPage,
		reSetList
	})
</script>

<template>
	<view class="common-table">
		<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
			<!-- 表头行 -->
			<uni-tr>
				<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">{{ form.barcodeName1 }}</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">文档</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">时间</uni-th>
			</uni-tr>
			<!-- 表格数据行 -->
			<uni-tr v-for="item,key in resultData?.list" :key="key">
				<uni-td class="nowrap">{{ key + 1 }}</uni-td>
				<uni-td class="nowrap">{{ item.barcode1 }}</uni-td>
				<uni-td class="nowrap">{{ item.fileName }}</uni-td>
				<uni-td class="nowrap">{{ item.createTime }}</uni-td>
			</uni-tr>
		</uni-table>

		<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
			:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
	</view>
</template>

<style scoped lang='less'>

</style>