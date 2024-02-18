<script lang="ts" setup>
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getProductionOrderDispatchProcessInfos } from "@/api/business"
	import type { Business } from "@/type/business"
	import UpInputProcessPicker from "@/components/UpInputProcessPicker.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import TablePicker from "@/components/TablePicker.vue"
	import { nextDayFormat } from "@/store/common"

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
			inputText.value = props.selected.map(item => item.moCode).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as Obj[])
			inputText.value = props.selected.map(item => item.moCode).join(", ")
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
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(getProductionOrderDispatchProcessInfos)

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
		processSelected.value = []
		materialSelected.value = []
		dateSelected.value = []
		reSetPage()
		// reSetList()
	}
	const select = () => {
		close()
	}
	const updateSelected = (selected : Obj[]) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "工序", key: "opseqName" }, { label: "生产订单", key: "moCode" }, { label: "生产物料", key: "invName" }, { label: "生产数量", key: "quantity" }, { label: "开工日期", key: "startDate" }, { label: "完工日期", key: "finishDate" }]

	//----------------------------下面是这个组件自身依赖的组件数据

	// 工序
	const processSelected = ref<Obj[]>([])
	const processSelect = (res : Obj[]) => {
		if (res.length > 0) {
			searchParam.value.wcId = res[0].id
		} else {
			searchParam.value.wcId = null
		}
	}

	// 物料选择相关
	const materialSelected = ref<Business[]>([])
	const materialSelect = (res : Business[]) => {
		if (res.length > 0) {
			searchParam.value.invCode = res[0].code
		} else {
			searchParam.value.invCode = null
		}
	}

	// 单据日期选择相关
	const dateSelected = ref([nextDayFormat, nextDayFormat])
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
							选择生产订单工序派工资料
						</view>
						<up-form class="common-form" labelPosition="left">

							<up-form-item class="common-form-item" label="工作中心:" borderBottom labelWidth="80" style="padding: 0">
								<UpInputProcessPicker border="none" placeholder="选择U8工作中心" readonly clearable class="input-item"
									v-model:selected="processSelected" @select="processSelect">
								</UpInputProcessPicker>
							</up-form-item>

							<up-form-item class="common-form-item" label="物料:" borderBottom labelWidth="80" style="padding: 0">
								<UpInputMaterielPicker border="none" placeholder="选择U8存货档案" readonly clearable class="input-item"
									v-model:selected="materialSelected" search @select="materialSelect">
								</UpInputMaterielPicker>
							</up-form-item>

							<up-form-item class="common-form-item" label="开工日期:" borderBottom labelWidth="80" style="padding: 0">
								<UpInputDatePicker border="none" placeholder="选择开工日期" clearable class="input-item" readonly
									v-model:selected="dateSelected" mode="range" @select="dateSelect">
								</UpInputDatePicker>
							</up-form-item>

						</up-form>

						<view class="search-btn-box">
							<up-button type="primary" text="查询" class="bottom-button" @click="search" shape="circle"
								:disabled="searching">
							</up-button>
							<up-button text="重置" class="bottom-button" @click="reset" shape="circle" :disabled="searching">
							</up-button>
						</view>

					</view>

					<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="rowNo" :searching="searching"
						:tableData="resultData?.list.map(item => {return {...item, quantity: Number(item.quantity)}})"
						@select="select" :multiple="multiple" :colums="colums" withIndex>

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