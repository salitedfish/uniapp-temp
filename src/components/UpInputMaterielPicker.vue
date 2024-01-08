<script lang="ts" setup>
	import { ref, onMounted, watch } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getBusiness, listCurrentStock } from "@/api/business"
	import type { Business } from "@/type/business"
	import { PickerTypeId } from "@/type/business"
	import ScanCode from "@/components/ScanCode.vue"
	import TablePicker from "@/components/TablePicker.vue"
	import { useDebounce } from "@ultra-man/noa"

	// 基础数据
	const props = defineProps<
		{
			// 自定义查找模式
			search ?: boolean,
			// 扫码查找模式
			scan ?: boolean,
			multiple ?: boolean,
			selected ?: Business[],
			scanSearchParams ?: Obj
			// modelValue : string,
		}>()
	const emit = defineEmits<{
		(event : "select", result : Business[]) : void;
		(event : "scanSuccess", code : string) : void;
		(event : "update:selected", selected : Business[]) : void
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as Business[])
			inputText.value = props.selected.map(item => item.name).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as Business[])
			inputText.value = props.selected.map(item => item.name).join(", ")
		}
	})

	// input显示的字符串
	const inputText = ref("")

	// 是否显示popup
	const showPopup = ref(false)
	// 打开弹窗
	const open = () => {
		showPopup.value = true
	}
	// 关闭弹窗
	const close = () => {
		showPopup.value = false
	}

	// 扫码成功
	const scanSuccess = (code : string) => {
		// 根据二维码获取数据
		if (code) {
			emit("scanSuccess", code)
			autoSearch(code)
		}
	}
	// 输入框改变
	const inputConfirm = useDebounce((code : string) => {
		if (code && props.scan) {
			autoSearch(code)
		}
	})
	// 顶层输入框有可能输入物料编码，也有可能输入货位编码,自动打开弹窗并搜索，要根据searchKey来选择
	const autoSearch = (keywords : string) => {
		if (props.scanSearchParams) {
			// 先取消ts，根据实际接口情况修改
			searchParam.value = { ...searchParam.value, ...props.scanSearchParams, [props.scanSearchParams.searchKey]: keywords }
		}
		open()
		searchList()
	}
	// 弹窗内输入框，确认搜索
	const search = () => {
		reSetPage()
		searchList()
	}
	// 分页搜索
	const pageSearch = (page : { current : number }) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	// 生成分页所需的数据和方法
	// 不同查找模式对应的接口不一样，search模式用的数据字典通用接口，scan模式涉及到物料批次号库位啥的，要一个独立接口
	const requestApi = props.scan ? listCurrentStock : getBusiness
	const { searching, searchParam, resultData, searchList, reSetPage } = useTable(requestApi, {
		id: PickerTypeId.MATERIAL
	})

	const select = (selected : Business[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : Business[]) => {
		emit("update:selected", selected)
	}

	// 不同查找模式对应的colums不一样，search模式用的数据字典通用colums，scan模式涉及到物料批次号库位啥的
	const searchColums = [{ label: "物料编号", key: "code" }, { label: "物料名称", key: "name" }]
	const scanColums = [{ label: "物料编号", key: "cInvCode" }, { label: "物料名称", key: "cInvName" }, { label: "库位", key: "cposname" }, { label: "批次号", key: "cbatch" }]
	const colums = props.scan ? scanColums : searchColums
</script>

<template>
	<up-input @change="inputConfirm" v-model="inputText">
		<template #suffix>
			<ScanCode @scanSuccess="scanSuccess" v-if="props.scan"></ScanCode>
			<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary" @click="open"
				v-if="props.search"></uni-icons>
			<u-popup :show="showPopup" @close="close" mode="bottom">
				<view style="height: 80vh">
					<view class="common-table common-page-container popup-content">
						<view class="search-box" v-if="props.search">
							<u-search class="search" placeholder="输入搜索关键字" v-model="searchParam.condition" @search="search"
								@custom="search"></u-search>
						</view>
						<view class="common-section-title" v-if="props.scan">
							物料列表
						</view>


						<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="code" :searching="searching"
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
		padding-top: 10px;

		.search-box {
			padding-bottom: 10px;
		}

	}
</style>