<script lang="ts" setup>
	import { ref, onMounted } from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import TraceLinePicker from "@/components/TraceLinePicker.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import AutoConnectBlueTooth from "@/components/AutoConnectBlueTooth.vue"
	import { printBoxBarcode } from "@/util/printUtils"
	// 数据
	import { routes } from "@/store/route"
	// 接口
	import { getProductJobHistory } from "@/api/trace"

	const relationArry = ["壳体条码", "中间条码", "临时条码", "客供条码"]

	const props = defineProps<{
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
	const detail = ref("")
	const detailDialogVisible = ref(false)
	const search = async () => {
		try {
			searching.value = true
			const res = await getProductJobHistory(form.value)
			tableData.value = res.data.list
		} catch (err) {
			console.log(err)
		} finally {
			searching.value = false
		}
	}

	const showDetail = (detailString : string) => {
		detail.value = detailString || ""
		detailDialogVisible.value = true
		console.log(detail)
	}
	const hideDetail = () => {
		detail.value = ""
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
					<uni-th class="nowrap" align="left" width="80rpx">工序编号</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">流程名称</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">数据信息</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="(item, key) in tableData" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.processCode }}</uni-td>
					<uni-td class="nowrap">{{ item.procedureName }}</uni-td>
					<uni-td class="nowrap">
						<view v-if="item.isFile == 0">
							<view style="text-align: left" class="link" @click="showDetail(item.contentList[0])"> 查看详情 </view>
						</view>
						<view v-if="item.isFile == 1 && item.ldTraceList.length > 0" style="text-align: left">
							<span>{{ relationArry[item.ldTraceList[0].relation1 - 1] }}：</span>
							<span>{{ item.ldTraceList[0].barcode1 }}</span>
							<span> ({{ item.ldTraceList[0].createTime }})</span>
							<span> - {{ item.ldTraceList[0].createName }}</span>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
		</view>

		<up-popup :show="detailDialogVisible" mode="center" @close="hideDetail" :round="10">
			<view style="padding: 10px 15px; width: 85vw; min-height: 20vh">
				<view v-for="(item, key) in detail.split(';')" :key="key">{{ item }}</view>
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