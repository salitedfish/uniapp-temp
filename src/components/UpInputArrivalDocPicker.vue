<script lang="ts" setup>
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getArrivalDocList } from "@/api/business"
	import type { Business } from "@/type/business"
	import UpInputSupplierPicker from "@/components/UpInputSupplierPicker.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
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
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(getArrivalDocList)


	// 确认搜索
	const search = async () => {
		reSetPage()
		await searchList()
	}
	// 分页搜索
	const pageSearch = (page : { current : number }) => {
		searchParam.value.currentPage = page.current
		searchList()
	}
	// 重制搜索参数
	const reset = () => {
		supplierSelected.value = []
		materialSelected.value = []
		dateSelected.value = []
		reSetPage()
	}

	const select = (selected : Obj[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : Obj[]) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "单号", key: "ccode" }, { label: "单据日期", key: "ddate" }, { label: "供应商", key: "supplierName" }, { label: "部门", key: "deptName" }, { label: "制单人", key: "maker" }]

	//----------------------------下面是这个组件自身依赖的组件数据

	// 供应商选择
	const supplierSelected = ref<Business[]>([])
	const supplierSelect = (res : Business[]) => {
		if (res.length > 0) {
			searchParam.value.supplierCode = res[0].code
		} else {
			searchParam.value.supplierCode = null
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
			<u-popup :show="showPopup" @close="showPopup = false" mode="bottom">
				<view style="height: 90vh">
					<view class="common-table common-page-container popup-content">
						<view class="search-box">
							<view class="common-section-title">
								选择到货单
							</view>
							<up-form class="common-form" labelPosition="left">
								<up-form-item class="common-form-item" label="供应商:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputSupplierPicker border="none" placeholder="选择U8供应商" readonly clearable class="input-item"
										@select="supplierSelect" v-model:selected="supplierSelected">
									</UpInputSupplierPicker>
								</up-form-item>

								<up-form-item class="common-form-item" label="物料:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputMaterielPicker border="none" placeholder="选择U8存货档案" readonly clearable class="input-item"
										@select="materialSelect" search v-model:selected="materialSelected">
									</UpInputMaterielPicker>
								</up-form-item>

								<up-form-item class="common-form-item" label="单据日期:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputDatePicker border="none" placeholder="选择单据日期" clearable class="input-item" readonly
										v-model:selected="dateSelected" @select="dateSelect" mode="range">
									</UpInputDatePicker>
								</up-form-item>
							</up-form>
							<view class="search-btn-box">
								<up-button type="primary" text="查询" class="bottom-button" @click="search" shape="circle"
									:disabled="searching"></up-button>
								<up-button text="重置" class="bottom-button" @click="reset" shape="circle"
									:disabled="searching"></up-button>
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