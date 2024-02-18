<script lang="ts" setup>
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { listMaterialAppVouch } from "@/api/business"
	import type { Business } from "@/type/business"
	import UpInputDepPicker from "@/components/UpInputDepPicker.vue"
	import UpInputOutSrTypePicker from "@/components/UpInputOutSrTypePicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import TablePicker from "@/components/TablePicker.vue"
	import { nowFormat } from "@/store/common"

	// 基础数据
	const props = defineProps<
		{
			multiple ?: boolean,
			selected ?: Obj[]
		}>()
	const emit = defineEmits<{
		(event : "select", result : Obj[]) : void;
		(event : "update:selected", result : Obj[]) : void;
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as Obj[])
			inputText.value = props.selected.map(item => item.ccode).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as Obj[])
			inputText.value = props.selected.map(item => item.ccode).join(", ")
		}
	})

	// input显示的字符串
	const inputText = ref("")

	// 是否显示popup
	const showPopup = ref(false)
	// 打开弹窗
	const open = () => {
		showPopup.value = true
		nextTick(() => {
			searchList()
		})
	}
	// 关闭弹窗
	const close = () => {
		showPopup.value = false
	}

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(listMaterialAppVouch)

	// 确认搜索
	const search = () => {
		reSetPage()
		searchList()
	}
	// 分页搜索
	const pageSearch = (page : { current : number }) => {
		searchParam.value.currentPage = page.current
		searchList()
	}
	// 重制搜索参数
	const reset = () => {
		depSelected.value = []
		outStockTypeSelected.value = []
		dateSelected.value = []
		reSetPage()
		// reSetList()
	}
	const select = (selected : Obj[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : Obj[]) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "单号", key: "ccode" }, { label: "日期", key: "ddate" }, { label: "部门", key: "deptName" }, { label: "出库类别", key: "rdName" }, { label: "制单人", key: "maker" }]

	//----------------------------下面是这个组件自身依赖的组件数据

	// 部门选择
	const depSelected = ref<Business[]>([])
	const depSelect = (res : Business[]) => {
		if (res.length > 0) {
			searchParam.value.deptCode = res[0].code
		} else {
			searchParam.value.deptCode = null
		}
	}

	// 出库类别选择相关
	const outStockTypeSelected = ref<Business[]>([])
	const outStockTypeSelect = (res : Business[]) => {
		if (res.length > 0) {
			searchParam.value.rdCode = res[0].code
		} else {
			searchParam.value.rdCode = null
		}
	}

	// 单据日期选择相关
	const dateSelected = ref([nowFormat, nowFormat])
	const dateSelect = (dates : string[]) => {
		searchParam.value.startDate = dates[0]
		searchParam.value.finishDate = dates[1]
	}
</script>

<template>
	<up-input v-model="inputText">
		<template #suffix>
			<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
				@click="open"></uni-icons>
			<u-popup :show="showPopup" @close="close" mode="bottom">
				<view style="height: 90vh" class="common-table common-page-container popup-content">
					<view class="search-box">
						<view class="common-section-title">
							选择领料申请单
						</view>
						<up-form class="common-form" labelPosition="left">

							<up-form-item class="common-form-item" label="部门:" borderBottom labelWidth="80" style="padding: 0">
								<UpInputDepPicker border="none" placeholder="选择U8部门" readonly clearable class="input-item"
									v-model:selected="depSelected" @select="depSelect">
								</UpInputDepPicker>
							</up-form-item>

							<up-form-item class="common-form-item" label="出库类别:" borderBottom labelWidth="80" style="padding: 0">
								<UpInputOutSrTypePicker border="none" placeholder="选择U8出库类别" readonly clearable class="input-item"
									v-model:selected="outStockTypeSelected" @select="outStockTypeSelect">
								</UpInputOutSrTypePicker>
							</up-form-item>

							<up-form-item class="common-form-item" label="日期:" borderBottom labelWidth="80" style="padding: 0">
								<UpInputDatePicker border="none" placeholder="选择日期" clearable class="input-item" readonly
									v-model:selected="dateSelected" mode="range" @select="dateSelect">
								</UpInputDatePicker>
							</up-form-item>
						</up-form>
						<view class="search-btn-box">
							<up-button type="primary" text="查询" class="bottom-button" @click="search" shape="circle"></up-button>
							<up-button text="重置" class="bottom-button" @click="reset" shape="circle"></up-button>
						</view>
					</view>

					<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="ccode" :searching="searching"
						:tableData="resultData?.list" @select="select" :multiple="multiple" :colums="colums" withIndex>

						<view class="page-box">
							<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount"
								:current="searchParam.currentPage" :pageSize="searchParam.pageSize"
								@change="pageSearch"></uni-pagination>
						</view>

					</TablePicker>
				</view>
			</u-popup>
		</template>
	</up-input>


</template>

<style lang="scss" scoped>
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