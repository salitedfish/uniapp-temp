<script lang="ts" setup>
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getFailureModList } from "@/api/trace"
	import TablePicker from "@/components/TablePicker.vue"

	// 基础数据
	const props = withDefaults(
		defineProps<{
			multiple ?: boolean
			selected : Objs
			processId ?: number
			orgIds ?: string
		}>(),
		{
			multiple: false,
		},
	)

	const emit = defineEmits<{
		(event : "select", result : Objs) : void
		(event : "update:selected", result : Objs) : void
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as Objs)
			inputText.value = props.selected.map((item) => item.failureModeName).join(", ")
		}
	})

	watch(
		() => props.selected,
		() => {
			if (props.selected) {
				emit("select", props.selected as Objs)
				inputText.value = props.selected.map((item) => item.failureModeName).join(", ")
			}
		},
	)

	// input显示的字符串
	const inputText = ref("")

	// 是否显示popup
	const showPopup = ref(false)
	// 打开弹窗
	const open = () => {
		showPopup.value = true
		nextTick(() => {
			searchList({
				processId: props.processId,
				orgIds: props.orgIds,
			})
		})
	}
	// 关闭弹窗
	const close = () => {
		showPopup.value = false
	}

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(getFailureModList)

	const select = (selected : Objs) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : Objs) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "失效模式名称", key: "failureModeName" }]
</script>

<template>
	<up-input v-model="inputText">
		<template #suffix>
			<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="20" :color="globalColor.primary"
				@click="open"></uni-icons>
			<u-popup :show="showPopup" @close="showPopup = false" mode="bottom">
				<view style="height: 80vh">
					<view class="common-table common-page-container popup-content">
						<view class="common-section-title"> 失效模式 </view>
						<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="id" :searching="searching"
							:tableData="resultData?.list" @select="select" :multiple="multiple" :colums="colums">
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

		padding-top: 10px;
	}
</style>