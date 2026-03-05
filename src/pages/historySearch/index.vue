<script lang="ts" setup>
	import { ref, onMounted } from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import TraceLinePicker from "@/components/TraceLinePicker.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import AutoConnectBlueTooth from "@/components/AutoConnectBlueTooth.vue"
	import { printBoxBarcode } from "@/util/printUtils"
	import tableDetail from "@/pages/traceInfo/components/tableDetail.vue"
	// 数据
	import { routes } from "@/store/route"
	import { ResultMap } from "@/pages/traceInfo/enum"
	// 接口
	import { getProductJobHistory } from "@/api/trace"

	const relationArry = ["壳体条码", "中间条码", "临时条码", "客供条码"]

	const props = defineProps<{
		barcode : string,
		lineId : string,
		processId : string
	}>()

	onMounted(() => {
		search()
	})

	const initForm = () => {
		return {
			...props
		}
	}
	const form = ref(initForm())

	const tableData = ref<Objs>([])
	const searching = ref(false)
	const detailData = ref<Obj>({})
	const detailDialogVisible = ref(false)
	const search = async () => {
		try {
			searching.value = true
			const res = await getProductJobHistory(form.value)
			tableData.value = res.data
		} catch (err) {
			console.log(err)
		} finally {
			searching.value = false
		}
	}

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
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.HistorySearch.style.navigationBarTitleText"></CustomNavBar>

		<!-- <AutoConnectBlueTooth ref="autoConnectBlueTooth"> </AutoConnectBlueTooth> -->

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">二维码</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">工序名称</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">设备编码</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">数据信息</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">结果</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">失效模式</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">时间</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">操作人</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="(item, key) in tableData" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.barcode1 }}</uni-td>
					<uni-td class="nowrap">{{ item.procedureName }}</uni-td>
					<uni-td class="nowrap">{{ item.equipmentCode }}</uni-td>
					<uni-td class="nowrap">
						<view style="text-align: left" class="link" @click="showDetail(item)"> 查看详情 </view>
					</uni-td>
					<uni-td class="nowrap">{{ ResultMap[item.result] }}</uni-td>
					<uni-td class="nowrap">{{ item.failureModeName }}</uni-td>
					<uni-td class="nowrap">{{ item.createTime }}</uni-td>
					<uni-td class="nowrap">{{ item.createName }}</uni-td>
				</uni-tr>
			</uni-table>
		</view>

		<up-popup :show="detailDialogVisible" mode="center" @close="hideDetail" :round="10">
			<view style="padding: 10px 15px; width: 90vw; min-height: 20vh; max-height: 80vh; overflow-y: scroll;">
				<tableDetail :detailData="detailData"></tableDetail>
			</view>
		</up-popup>
	</view>
</template>

<style scoped lang="less">
	.bottom-button {
		margin-top: 10px;
	}

	.common-table {
		margin-top: 10px;
	}
</style>