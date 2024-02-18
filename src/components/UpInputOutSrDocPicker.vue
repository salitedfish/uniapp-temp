<script lang="ts" setup>
	import { ref, onMounted, watch, nextTick } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { getDepartment } from "@/api/business"
	import type { OutSrDoc, Business } from "@/type/business"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import TablePicker from "@/components/TablePicker.vue"
	import UpInputCustomerPicker from "@/components/UpInputCustomerPicker.vue"

	// 基础数据
	const props = defineProps<
		{
			multiple ?: boolean,
			selected ?: OutSrDoc[]
		}>()
	const emit = defineEmits<{
		(event : "select", result : OutSrDoc[]) : void;
		(event : "update:selected", result : OutSrDoc[]) : void;
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as OutSrDoc[])
			inputText.value = props.selected.map(item => item.name).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as OutSrDoc[])
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
		nextTick(() => {
			searchList()
		})
	}
	// 关闭弹窗
	const close = () => {
		showPopup.value = false
	}

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable(getDepartment)


	// 确认搜索
	const search = async () => {
		reSetPage()
		await searchList()
	}
	// 重制搜索参数
	const reset = () => {
		customerSelected.value = []
		materialSelected.value = []
		reSetPage()
	}

	const select = (selected : OutSrDoc[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : OutSrDoc[]) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "单号", key: "code" }, { label: "出库日期", key: "name" }, { label: "物料编码", key: "name" }, { label: "物料名称", key: "name" }, { label: "出库数量", key: "name" }]

	//----------------------------下面是这个组件自身依赖的组件数据


	// 物料选择相关
	const materialSelected = ref<Business[]>([])

	// 客户选择
	const customerSelected = ref<Business[]>([])
</script>

<template>
	<up-input v-model="inputText">
		<template #suffix>
			<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
				@click="open"></uni-icons>
			<u-popup :show="showPopup" @close="showPopup = false" mode="bottom">
				<view style="height: 80vh">
					<view class="common-table common-page-container popup-content">
						<view class="search-box">
							<view class="common-section-title">
								选择出库单
							</view>
							<up-form class="common-form" labelPosition="left">

								<up-form-item class="common-form-item" label="物料:" borderBottom labelWidth="60" style="padding: 0">
									<UpInputMaterielPicker border="none" placeholder="选择U8存货档案" readonly clearable class="input-item"
										v-model:selected="materialSelected" search>
									</UpInputMaterielPicker>
								</up-form-item>

								<up-form-item class="common-form-item" label="客户:" borderBottom labelWidth="60" style="padding: 0">
									<UpInputCustomerPicker border="none" placeholder="选择U8客户" readonly clearable class="input-item"
										v-model:selected="customerSelected" search>
									</UpInputCustomerPicker>
								</up-form-item>

							</up-form>
							<view class="search-btn-box">
								<up-button type="primary" text="查询" class="bottom-button" @click="search" shape="circle"></up-button>
								<up-button text="重置" class="bottom-button" @click="reset" shape="circle"></up-button>
							</view>
						</view>

						<TablePicker :selected="selected" @update:selected="updateSelected" selectKey="code" :searching="searching"
							:tableData="resultData?.data" @select="select" :multiple="multiple" :colums="colums">

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