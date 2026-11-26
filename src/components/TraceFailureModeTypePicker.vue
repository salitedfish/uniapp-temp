<script lang="ts" setup>
	// 失效模式类型选择器：结构照抄 TraceFailureModePicker（输入框 + 放大镜 + 底部弹窗表格 + 分页 + 多选）
	// 用途：失效模式选择弹窗里按类型筛选
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getFailureModTypePageList } from "@/api/trace"
	import TablePicker from "@/components/TablePicker.vue"

	const props = withDefaults(defineProps<
		{
			multiple ?: boolean,
			selected ?: Objs,
		}>(), {
		multiple: false,
	})

	const emit = defineEmits<{
		(event : "select", result : Objs) : void;
		(event : "update:selected", result : Objs) : void;
	}>()

	const inputText = ref("")
	const showPopup = ref(false)

	const syncInput = () => {
		inputText.value = (props.selected || []).map((item : Obj) => item.typeName).join(", ")
	}

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as Objs)
			syncInput()
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			syncInput()
		}
	}, { deep: true })

	const { searching, searchParam, resultData, searchList, reSetPage } = useTable(getFailureModTypePageList)

	const open = () => {
		showPopup.value = true
		nextTick(() => {
			searchList()
		})
	}
	const close = () => {
		showPopup.value = false
	}
	const pageSearch = (page : { current : number }) => {
		searchParam.value.currentPage = page.current
		searchList()
	}
	const select = () => {
		close()
	}
	const updateSelected = (selected : Objs) => {
		emit("update:selected", selected)
	}

	const colums = [
		{ label: "类型编码", key: "typeCode" },
		{ label: "类型名称", key: "typeName" }
	]
</script>

<template>
	<view class="tfmtp">
		<up-input v-model="inputText" readonly placeholder="请选择失效模式类型">
			<template #suffix>
				<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
					@click="open"></uni-icons>
			</template>
		</up-input>

		<u-popup :show="showPopup" @close="showPopup = false" mode="bottom">
			<view style="height: 80vh">
				<view class="common-table common-page-container popup-content">
					<view class="common-section-title">失效模式类型</view>
					<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="id" :searching="searching"
						:tableData="resultData?.list" @select="select" :multiple="multiple" :colums="colums">
						<view class="page-box">
							<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount"
								:current="searchParam.currentPage" :pageSize="searchParam.pageSize"
								@change="pageSearch"></uni-pagination>
						</view>
					</TablePicker>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<style lang="scss" scoped>
	.tfmtp {
		width: 100%;
	}
	.popup-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-top: 10px;
	}
</style>
