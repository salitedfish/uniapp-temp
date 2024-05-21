<script lang='ts' setup>
	import {
		ref,
		computed
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import TraceLinePicker from "@/components/TraceLinePicker.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 接口
	import {
		getTraceList
	} from "@/api/trace"

	const relationArry = ['壳体条码', '中间条码', '临时条码', '客供条码']

	const initForm = () => {
		return {
			lineId: "",
			lineName: "",
			barcode: ""
		}
	}
	const form = ref(initForm())

	const lineSelected = ref < Obj[] > ([])
	const lineSelect = (res: Obj[]) => {
		if (res.length > 0) {
			form.value.lineId = res[0].lineId
			form.value.lineName = res[0].lineName
		} else {
			form.value.lineId = ""
			form.value.lineName = ""
		}
	}

	const scanSuccess = (res: string) => {
		form.value.barcode = res
	}

	const tableData = ref < Obj[] > ([])
	const searchDisabled = computed(() => {
		return !form.value.lineId || !form.value.barcode
	})
	const searching = ref(false)
	const search = async () => {
		try {
			searching.value = true
			const res = await getTraceList(form.value)
			tableData.value = res.data
		} catch (err) {
			console.log(err)
		} finally {
			searching.value = false
		}

	}
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.TraceSearch.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="产线名称:" borderBottom labelWidth="90" style="padding: 0" required>
				<TraceLinePicker v-model:selected="lineSelected" @select="lineSelect" border="none" placeholder="请选择产线" readonly
					clearable>
				</TraceLinePicker>
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
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in tableData" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.processCode }}</uni-td>
					<uni-td class="nowrap">{{ item.procedureName }}</uni-td>
					<uni-td class="nowrap">
						<view v-if="item.isFile == 0">
							<view style="text-align: left;" v-for="row, index in item.contentList" :key="index">
								{{row}}
							</view>
						</view>
						<view v-if="item.isFile == 1 && item.ldTraceList.length>0" style="text-align: left;">
							<span>{{relationArry[item.ldTraceList[0].relation1 - 1]}}：</span>
							<span>{{item.ldTraceList[0].barcode1}}</span>
							<span> ({{item.ldTraceList[0].createTime}})</span>
							<span> - {{item.ldTraceList[0].createName}}</span>
						</view>
					</uni-td>
				</uni-tr>
			</uni-table>
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