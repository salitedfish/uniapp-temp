<script lang="ts" setup>
	import { ref, onMounted, watch } from "vue"
	import { globalColor } from "@/store/theme"
	import { useTable } from "@/hook/usePageTable"
	import { } from "@/api/business"
	import type { Process, Business, ProcessSendDoc } from "@/type/business"
	import UpInputProcessPicker from "@/components/UpInputProcessPicker.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import TablePicker from "@/components/TablePicker.vue"

	// 基础数据
	const props = defineProps<
		{
			multiple ?: boolean,
			selected ?: ProcessSendDoc[]
		}>()
	const emit = defineEmits<{
		(event : "select", result : ProcessSendDoc[]) : void;
		(event : "update:selected", result : ProcessSendDoc[]) : void;
	}>()

	onMounted(() => {
		if (props.selected) {
			emit("select", props.selected as ProcessSendDoc[])
			inputText.value = props.selected.map(item => item.name).join(", ")
		}
	})

	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected as ProcessSendDoc[])
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

	// 生成分页所需的数据和方法
	const { searching, searchParam, resultData, searchList, reSetPage, reSetList } = useTable()

	// 确认搜索
	const search = () => {
		reSetPage()
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
	const select = (selected : ProcessSendDoc[]) => {
		// emit("select", selected)
		close()
	}
	const updateSelected = (selected : ProcessSendDoc[]) => {
		emit("update:selected", selected)
	}

	const colums = [{ label: "单号", key: "code" }, { label: "工序", key: "name" }, { label: "生产订单", key: "name" }, { label: "生产物料", key: "name" }, { label: "生产数量", key: "name" }, { label: "开工日期", key: "name" }, { label: "完工日期", key: "name" }]

	//----------------------------下面是这个组件自身依赖的组件数据

	// 供应商选择
	const processSelected = ref<Process[]>([])

	// 物料选择相关
	const materialSelected = ref<Business[]>([])

	// 单据日期选择相关
	const dateSelected = ref([])
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
							<view class="common-section-title">
								选择生产订单工序派工资料
							</view>
							<up-form class="common-form" labelPosition="left">
								<up-form-item class="common-form-item" label="工序:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputProcessPicker border="none" placeholder="选择U8标准工序" readonly clearable class="input-item"
										v-model:selected="processSelected">
									</UpInputProcessPicker>
								</up-form-item>

								<up-form-item class="common-form-item" label="物料:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputMaterielPicker border="none" placeholder="选择U8存货档案" readonly clearable class="input-item"
										v-model:selected="materialSelected" search>
									</UpInputMaterielPicker>
								</up-form-item>

								<up-form-item class="common-form-item" label="开工日期:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputDatePicker border="none" placeholder="选择开工日期" clearable class="input-item" readonly
										v-model:selected="dateSelected" mode="range">
									</UpInputDatePicker>
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
								<uni-pagination title="分页" show-icon="true" :total="resultData?.totalSize" :current="searchParam.page"
									:pageSize="searchParam.size" @change="searchList()"></uni-pagination>
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