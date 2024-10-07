<template>
	<view class="box">
		<up-button type="primary" class="btn" shape="circle" @click="printHandle">重打印</up-button>

		<up-popup :show="data.visible" mode="bottom" @close="hide" :round="10">
			<view style="height: 80vh">
				<view class="common-table common-page-container popup-content">
					<view class="search-box">
						<u-search class="search" placeholder="输入搜索条码" v-model="searchParam.barcode" @search="search"
							@custom="search"></u-search>
					</view>
					<TablePicker v-model:selected="data.selected" selectKey="barcode" :searching="searching"
						:tableData="resultData?.list" @select="select" :multiple="data.multiple" :colums="colums" withIndex>

						<view class="page-box">
							<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount"
								:current="searchParam.currentPage" :pageSize="searchParam.pageSize"
								@change="pageSearch"></uni-pagination>
						</view>

					</TablePicker>
				</view>
			</view>
		</up-popup>
	</view>

</template>

<script lang='ts' setup>
	import {
		reactive
	} from "vue"
	import {
		getBarcodeList
	} from "@/api/codeRule"
	import {
		useTable
	} from "@/hook/usePageTable"
	import TablePicker from "@/components/TablePicker.vue"
	import {
		printBoxBarcode
	} from "../util"

	// 数据
	const data = reactive({
		printList: [] as Obj[],
		selected: [] as Obj[],
		visible: false,
		multiple: false
	})
	const colums = [{
		label: "条码名称",
		key: "codeName"
	}, {
		label: "条码",
		key: "barcode"
	}, {
		label: "创建人",
		key: "createName"
	}, {
		label: "创建时间",
		key: "createTime"
	}]

	// 生成分页所需的数据和方法
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage
	} = useTable(getBarcodeList, {
		queryType: "1",
		codeName: "包装码",
	})

	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	// 确认搜索
	const search = () => {
		reSetPage()
		searchList()
	}

	// 显示历史条码弹窗
	const printHandle = () => {
		data.visible = true
		searchList()
	}

	// 隐藏历史条码弹窗
	const hide = () => {
		data.visible = false
	}

	// 点击选择历史条码
	const select = (selected: Obj[]) => {
		if (selected && selected.length > 0) {
			printBoxBarcode({
				barcode: selected[0].barcode,
				codeName: selected[0].codeName,
				productCode: selected[0].barcode.split(",")[0],
				cusProductCode: selected[0].cusProductCode,
				maxNum: selected[0].maxNum,
			})
		}
	}
</script>

<style scoped lang='less'>
	.box {
		flex: 1
	}

	.popup-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.search-box {
			padding: 10px 0;

			.search-btn-box {
				margin-top: 10px;
				display: flex;

				.bottom-button+.bottom-button {
					margin-left: 12rpx
				}
			}
		}
	}
</style>