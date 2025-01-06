<script lang="ts" setup>
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getTraceProcessList } from "@/api/trace"
	import TablePicker from "@/components/TablePicker.vue"

	// 基础数据
	const props = defineProps<
		{
			multiple ?: boolean,
			selected ?: Obj[]
		}>()
	const emit = defineEmits<{
		(event : "select", result : Obj[]) : void;
		(event : "update:selected", selected : Obj[]) : void
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as Obj[])
			inputText.value = props.selected.map(item => item.processCode).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as Obj[])
			inputText.value = props.selected.map(item => item.processCode).join(", ")
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
	const { searching, searchParam, resultData, searchList, reSetPage } = useTable(getTraceProcessList, {
		queryType: 0
	})

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

	const select = (selected : Obj[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : Obj[]) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "工序编号", key: "processCode" }, { label: "工序名称", key: "processName" }, { label: "产线名称", key: "lineName" }]
</script>

<template>
	<view @click="open" style="width: 100%;">
		<up-input v-model="inputText" border="none" placeholder="选择工序" readonly clearable class="input-item"
			style="pointer-events: none">
			<template #suffix>
				<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"></uni-icons>
			</template>
		</up-input>
	</view>

	<u-popup :show="showPopup" @close="close" mode="bottom">
		<view style="height: 80vh">
			<view class="common-table common-page-container popup-content">
				<view class="search-box">
					<u-search class="search" placeholder="输入搜索关键字" v-model="searchParam.condition" @search="search"
						@custom="search"></u-search>
				</view>

				<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="processCode"
					:searching="searching" :tableData="resultData?.list" @select="select" :multiple="multiple" :colums="colums"
					withIndex>
					<view class="page-box">
						<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount"
							:current="searchParam.currentPage" :pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
					</view>
				</TablePicker>
			</view>
		</view>
	</u-popup>
</template>

<style lang="scss" scoped>
	.popup-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.search-box {
			padding: 10px 0;
		}
	}
</style>