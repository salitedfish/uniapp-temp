<script lang="ts" setup>
	import { ref, computed } from "vue"
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
	import { getTraceList, traceRework } from "@/api/trace"

	const initForm = () => {
		return {
			lineId: "",
			lineName: "",
			barcode: "",
		}
	}
	const form = ref(initForm())

	const lineSelected = ref<Objs>([])
	const detailDialogVisible = ref(false)
	const tableData = ref<Objs>([])
	const historyData = ref<Objs>([])
	const detailData = ref<Obj>({})
	const searchDisabled = computed(() => {
		return !form.value.lineId || !form.value.barcode
	})
	const searching = ref(false)

	const lineSelect = (res : Objs) => {
		if (res.length > 0) {
			form.value.lineId = res[0]?.lineId
			form.value.lineName = res[0]?.lineName
		} else {
			form.value.lineId = ""
			form.value.lineName = ""
		}
	}

	const scanSuccess = (res : string) => {
		form.value.barcode = res
	}

	const search = async () => {
		try {
			searching.value = true
			const res = await getTraceList(form.value)
			if (res.data) {
				tableData.value = res.data.map(i => {
					const equipmentContent = i.ldTraceList.length > 0 ? i.ldTraceList[i.ldTraceList.length - 1].equipmentContent : ""
					const result = i.ldTraceList.length > 0 ? i.ldTraceList[i.ldTraceList.length - 1].result : ""
					return {
						...i,
						equipmentContent,
						result
					}
				})
			} else {
				tableData.value = []
			}
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

	const printHandler = (item : Obj) => {
		console.log("打印")
		const j = item.ldTraceList && item.ldTraceList.length > 0 ? item.ldTraceList[item.ldTraceList.length - 1] : {}
		const i = {
			...item,
			...j,
			failureModeNames: j.failureModeName || ""
		}
		printBoxBarcode(i)
	}
	const reworkHandler = (item : Obj) => {
		console.log("返工")
		uni.showModal({
			content: "确定要返工吗？",
			showCancel: true,
			success(res) {
				if (res.confirm) {
					traceRework(item)
				}
			}
		})
		// uni.navigateTo({
		// 	url: `${routes.TraceInfo.path}?lineDetailId=${item.lineDetailId}&procedureName=${item.procedureName}&procedureKindCode=${item.procedureKindCode}&procedureCode=${item.procedureCode}&lineId=${item.lineId}&traceReworkId=${item.traceReworkId}&submitType=2`,
		// })
	}
	const historyHandler = (item : Obj) => {
		if (!item.ldTraceList || !item.ldTraceList[0]) {
			return
		}
		uni.navigateTo({
			url: `${routes.HistorySearch.path}?barcode=${form.value.barcode}&lineId=${form.value.lineId}&processId=${item.ldTraceList[0].processId}`,
		})
	}
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.TraceSearch.style.navigationBarTitleText"></CustomNavBar>

		<AutoConnectBlueTooth ref="autoConnectBlueTooth"> </AutoConnectBlueTooth>

		<up-form class="common-form common-form-next" labelPosition="left">
			<up-form-item class="common-form-item" label="产线名称:" borderBottom labelWidth="90" style="padding: 0" required>
				<TraceLinePicker v-model:selected="lineSelected" @select="lineSelect" border="none" placeholder="请选择产线" readonly
					clearable> </TraceLinePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="条码号:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input-scan v-model="form.barcode" @scanSuccess="scanSuccess" placeholder="请输入条码号" clearable
					class="input-item" focus></up-input-scan>
			</up-form-item>
		</up-form>

		<up-button type="primary" text="确定" class="bottom-button" @click="search" shape="circle"
			:disabled="searchDisabled"></up-button>

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">工序编号</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">流程名称</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">数据信息</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">结果</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">失效模式</uni-th>
					<!-- 					<uni-th class="nowrap" align="left" width="80rpx">时间</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">操作人</uni-th> -->
					<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
					<!-- <uni-th class="nowrap" align="left" width="80rpx">操作</uni-th> -->
					<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="(item, key) in tableData" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.processCode }}</uni-td>
					<uni-td class="nowrap">{{ item.procedureName }}</uni-td>
					<uni-td class="nowrap">
						<view style="text-align: left" class="link" @click="showDetail(item)"> 查看详情 </view>
					</uni-td>
					<uni-td class="nowrap">{{ ResultMap[item.result] }}</uni-td>
					<uni-td class="nowrap">
						{{
							item.ldTraceList && item.ldTraceList.length > 0 ? item.ldTraceList[item.ldTraceList.length - 1].failureModeName : ""
						}}
					</uni-td>
					<!-- 					<uni-td class="nowrap">{{ item.createTime }}</uni-td>
					<uni-td class="nowrap">{{ item.createName }}</uni-td> -->
					<uni-td class="nowrap link" @click="printHandler(item)">打印</uni-td>
					<!-- <uni-td class="nowrap link" @click="reworkHandler(item)">返工</uni-td> -->
					<uni-td class="nowrap link" @click="historyHandler(item)">历史记录</uni-td>
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