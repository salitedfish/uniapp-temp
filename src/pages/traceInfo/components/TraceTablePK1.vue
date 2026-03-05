<script lang="ts" setup>
	import { ref, computed } from "vue"
	// hook
	import { useTable } from "@/hook/usePageTable"
	// 接口
	import { getTracePageList } from "@/api/trace"
	import { ResultMap } from "@/pages/traceInfo/enum"
	import tableDetail from "@/pages/traceInfo/components/tableDetail.vue"

	const props = defineProps<{
		form : Obj
	}>()

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(getTracePageList, {
		lineDetailId: props.form.lineDetailId,
	})

	// 分页搜索
	const pageSearch = (page : { current : number }) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	const detailData = ref<Obj>({})
	const detailDialogVisible = ref(false)
	const showDetail = (data : Obj) => {
		if (data.equipmentContent && typeof data.equipmentContent == "string") {
			data.equipmentContent = JSON.parse(data.equipmentContent)
		}
		detailData.value = data
		detailDialogVisible.value = true
	}
	const hideDetail = () => {
		detailData.value = {}
		detailDialogVisible.value = false
	}

	defineExpose({
		searchList,
		reSetPage,
		reSetList,
	})
</script>

<template>
	<view class="common-table">
		<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
			<!-- 表头行 -->
			<uni-tr>
				<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">二维码</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">设备编码</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">数据信息</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">结果</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">时间</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">操作人</uni-th>
			</uni-tr>
			<!-- 表格数据行 -->
			<uni-tr v-for="(item, key) in resultData?.list" :key="key">
				<uni-td class="nowrap">{{ key + 1 }}</uni-td>
				<uni-td class="nowrap">{{ item.barcode1 }}</uni-td>
				<uni-td class="nowrap">{{ item.equipmentCode }}</uni-td>
				<uni-td class="nowrap">
					<view style="text-align: left" class="link" @click="showDetail(item)"> 查看详情 </view>
				</uni-td>
				<uni-td class="nowrap">{{ ResultMap[item.result] }}</uni-td>
				<uni-td class="nowrap">{{ item.createTime }}</uni-td>
				<uni-td class="nowrap">{{ item.createName }}</uni-td>
			</uni-tr>
		</uni-table>

		<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
			:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>

		<up-popup :show="detailDialogVisible" mode="center" @close="hideDetail" :round="10">
			<view style="padding: 10px 15px; width: 90vw; min-height: 20vh; max-height: 80vh; overflow-y: scroll;">
				<tableDetail :detailData="detailData"></tableDetail>
			</view>
		</up-popup>
	</view>
</template>

<style scoped lang="less"></style>