<script lang="ts" setup>
	import { ref, computed, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getFailureModList, getFailureModTypeList } from "@/api/trace"
	import TablePicker from "@/components/TablePicker.vue"
import TraceFailureModeTypePicker from "@/components/TraceFailureModeTypePicker.vue"

	// 基础数据
	const props = withDefaults(defineProps<
		{
			multiple ?: boolean,
			selected : Objs,
			processId ?: number,
			orgIds ?: string
		}>(), {
		multiple: false,
	})

	const emit = defineEmits<{
		(event : "select", result : Objs) : void;
		(event : "update:selected", result : Objs) : void;
	}>()

	onMounted(() => {
		loadTypeList()
		if (props.selected) {
			emit("select", props.selected as Objs)
			inputText.value = props.selected.map(item => item.failureModeName).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as Objs)
			inputText.value = props.selected.map(item => item.failureModeName).join(", ")
		}
	})

	// input显示的字符串
	const inputText = ref("")

	// 失效模式类型(多选筛选)
	const typeList = ref<Objs>([])
	const selectedTypeIds = ref<string[]>([])
	const loadTypeList = async () => {
		try {
			const r = await getFailureModTypeList()
			typeList.value = r.data || []
		} catch (e) {
			console.error(e)
		}
	}
	// 类型筛选：交给 TraceFailureModeTypePicker，选中后按 typeIds 重查
	const selectedTypeList = ref<Objs>([])
	const onTypeSelected = () => {
		// 选中结果由 v-model 回填到 selectedTypeList, 这里只负责转成 typeIds 并重查
		selectedTypeIds.value = (selectedTypeList.value || []).map((item : Obj) => String(item.id))
		reSetPage()
		openSearch()
	}
	const openSearch = () => {
		searchList({
			processId: props.processId,
			orgIds: props.orgIds,
			typeIds: selectedTypeIds.value.join(",")
		})
	}

	// 是否显示popup
	const showPopup = ref(false)
	// 打开弹窗
	const open = () => {
		showPopup.value = true
		nextTick(() => {
			openSearch()
		})
	}
	// 关闭弹窗
	const close = () => {
		showPopup.value = false
	}

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(getFailureModList)

	// 分页搜索
	const pageSearch = (page : { current : number }) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	const select = (selected : Objs) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : Objs) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "失效模式名称", key: "failureModeName" }, { label: "失效模式类型", key: "failureModeTypeName" }]
</script>

<template>
	<view class="tfmp">
		<up-input v-model="inputText">
			<template #suffix>
				<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
					@click="open"></uni-icons>
			</template>
		</up-input>

		<!-- 失效模式列表（popup 挂在根节点下：塞在 up-input 的 #suffix 插槽里不会渲染） -->
		<u-popup :show="showPopup" @close="showPopup = false" mode="bottom">
			<view style="height: 80vh">
				<view class="common-table common-page-container popup-content">
					<view class="popup-head">
						<text class="popup-head__title">失效模式</text>
					</view>
					<!-- 类型筛选：与「失效模式」同款的选择组件（输入框 + 放大镜 + 底部弹窗多选） -->
					<view class="type-field">
						<up-form-item label="失效模式类型" labelWidth="110" borderBottom style="padding: 0">
							<TraceFailureModeTypePicker v-model:selected="selectedTypeList" :multiple="true"
								@select="onTypeSelected"></TraceFailureModeTypePicker>
						</up-form-item>
					</view>
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
	.tfmp {
		width: 100%;
	}
	.popup-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 10px;
	}
	.popup-head__title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}
	.type-field {
		padding: 6px 10px 8px;
	}
	.popup-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-top: 10px;
	}
	.type-popup {
		display: flex;
		flex-direction: column;
		height: 60vh;
		padding: 12px 12px 10px;
	}
	.type-popup__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.type-popup__title {
		font-size: 16px;
		font-weight: 600;
		color: #303133;
	}
	.type-popup__reset {
		font-size: 13px;
		color: #909399;
	}
	.type-popup__search {
		margin: 8px 0;
	}
	.type-popup__list {
		flex: 1;
		overflow: hidden;
	}
	.type-table {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.type-table__head {
		display: flex;
		padding: 6px 4px;
		border-bottom: 1px solid #ebeef5;
	}
	.type-table__head .type-table__cell {
		font-size: 13px;
		color: #909399;
	}
	.type-table__row {
		display: flex;
		align-items: center;
		padding: 10px 4px;
		border-bottom: 1px solid #f5f7fa;
	}
	.type-table__row.is-picked {
		background: rgba(64, 158, 255, 0.06);
	}
	.type-table__cell {
		flex: 1;
		font-size: 14px;
		color: #303133;
	}
	.type-table__cell--idx {
		flex: 0 0 48px;
	}
	.type-popup__empty {
		padding: 24px 0;
		text-align: center;
		font-size: 13px;
		color: #909399;
	}
	.type-popup__foot {
		padding-top: 8px;
	}
</style>
