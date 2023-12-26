<script lang="ts" setup>
	import { ref, onMounted, watch } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getCheckVouchList } from "@/api/checkVouch"
	import type { CheckVouch } from "@/type/business"
	import TablePicker from "@/components/TablePicker.vue"

	// 基础数据
	const props = defineProps<
		{
			multiple ?: boolean,
			selected ?: CheckVouch[]
		}>()
	const emit = defineEmits<{
		(event : "select", result : CheckVouch[]) : void;
		(event : "update:selected", selected : CheckVouch[]) : void
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as CheckVouch[])
			inputText.value = props.selected.map(item => item.cCVCode).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as CheckVouch[])
			inputText.value = props.selected.map(item => item.cCVCode).join(", ")
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

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage } = useTable(getCheckVouchList)

	const colums = [{ label: "单号", key: "cCVCode" }, { label: "盘点日期", key: "dCVDate" }, { label: "账目日期", key: "dnmaketime" }, { label: "盘点仓库", key: "cWhName" }]

	// 确认搜索
	const search = () => {
		reSetPage()
		searchList()
	}

	const select = (selected : CheckVouch[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : CheckVouch[]) => {
		console.log(11111, selected)
		emit("update:selected", selected)
	}
</script>

<template>
	<up-input v-model="inputText">
		<template #suffix>
			<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
				@click="open"></uni-icons>
			<u-popup :show="showPopup" @close="close" mode="bottom">
				<view style="height: 80vh">
					<view class="common-table common-page-container popup-content">
						<view class="search-box">
							<u-search class="search" placeholder="输入搜索关键字" v-model="searchParam.condition" @search="search"
								@custom="search"></u-search>
						</view>
						<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="cCVCode"
							:searching="searching" :tableData="resultData?.list" @select="select" :multiple="multiple"
							:colums="colums">

							<view class="page-box">
								<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount"
									:current="searchParam.currentPage" :pageSize="searchParam.pageSize"
									@change="searchList()"></uni-pagination>
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
		}
	}
</style>