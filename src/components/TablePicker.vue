<script lang="ts" setup>
	import { ref, onMounted, } from "vue"
	import { globalColor } from "@/store/theme"
	import { useDeepInclude } from "@ultra-man/noa"

	// 基础数据
	const props = withDefaults(defineProps<
		{
			selected : Obj[],
			selectKey : string,
			colums : { label : string, key : string }[],
			tableData ?: Obj[],
			searching ?: boolean,
			multiple ?: boolean,
			multipleSelectCondition ?: (target : Obj, list : Obj[]) => boolean,
			withIndex ?: boolean,
			// 如果有值说明每行还能展示详情
			subKey ?: string,
			subColums ?: { label : string, key : string }[],
		}>(), {
		tableData: () => []
	})
	const emit = defineEmits<{
		(event : "select", result : Obj[]) : void;
		(event : "update:selected", selected : Obj[]) : void
		(event : "searchList") : void
	}>()

	onMounted(() => {
		selectItems.value = [...props.selected]
		if (props.selected[0]) {
			singleSelectKey.value = props.selected[0][props.selectKey]
		}
	})

	// 单选的唯一值
	const singleSelectKey = ref("")
	// 多选择的列表
	const selectItems = ref<Obj[]>([])

	// 单选确认
	const singleConfirm = (item : Obj) => {
		if (!props.multiple) {
			emit("update:selected", [item])
			emit("select", [item])
		}
	}
	// 获取在选择列表中的index
	const getSelectedIndex = (item : Obj) => {
		return useDeepInclude(selectItems.value, {
			condition: i => i[props.selectKey] === item[props.selectKey]
		})
	}
	// 多选中触发
	const select = (item : Obj, status : boolean) => {
		// 查看目标对象在列表中的位置
		const index = getSelectedIndex(item)
		// 如果是选中情况
		if (status) {
			// 如果选中列表中不存在
			if (index === false) {
				// 如果有限制多选的条件，则符合条件才选中
				if (props.multipleSelectCondition) {
					if (props.multipleSelectCondition(item, selectItems.value)) {
						selectItems.value.push(item)
					}
				}
				// 如果没有限制多选的条件，则直接选中
				else {
					selectItems.value.push(item)
				}
			}
		}
		// 如果是取消选中情况
		else {
			if (index !== false) {
				selectItems.value.splice(Number(index), 1)
			}
		}
	}
	// 多选确认选择
	const multipleConfirm = () => {
		emit("update:selected", [...selectItems.value])
		emit("select", [...selectItems.value])
	}
	// 全部选中
	const allSelect = () => {
		for (const item of props.tableData) {
			select(item, true)
		}
	}
	// 清空选中
	const clearSelect = () => {
		selectItems.value = []
	}

	// 详情展示的行
	const showSubListItem = ref<Obj>({})
	// 是否显示popup
	const showPopup = ref(false)
	// 展示子列表
	const showSubList = (item : Obj) => {
		showSubListItem.value = item
		open()
	}
	// 打开弹窗
	const open = () => {
		showPopup.value = true
	}
	// 关闭弹窗
	const close = () => {
		showPopup.value = false
		showSubListItem.value = {}
	}
</script>

<template>
	<view class="content-box">
		<uni-table ref="table" border stripe emptyText="暂无更多数据" :loading="searching">
			<uni-tr>
				<uni-th class="nowrap primary" align="left" width="50rpx" v-if="props.multiple">
					<span style="margin-right: 10px" @click="allSelect">全选</span>
					<span @click="clearSelect">清空</span>
				</uni-th>
				<uni-td class="nowrap" v-if="subKey">详情</uni-td>
				<uni-th class="nowrap" align="left" width="50rpx" v-if="withIndex">序号</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-for="item, key in colums"
					:key="key">{{item.label}}</uni-th>
			</uni-tr>
			<uni-tr v-for="item,key in tableData" :key="key" @click="singleConfirm(item)"
				:class="{selected: !multiple && (singleSelectKey === item[selectKey])}">
				<uni-td class="nowrap" v-if="props.multiple" style="display: flex; justify-content: center;">
					<uni-icons custom-prefix="custom-icon" type="icon-xuanze" size="18" :color="globalColor.primary"
						@click="select(item, false)" v-if="getSelectedIndex(item) !== false"></uni-icons>
					<uni-icons custom-prefix="custom-icon" type="icon-mei-xuanze" size="18" :color="globalColor.default"
						@click="select(item, true)" v-else></uni-icons>
				</uni-td>
				<uni-td class="nowrap primary" v-if="subKey" @click.stop="showSubList(item)">展开</uni-td>
				<uni-td class="nowrap" v-if="withIndex">{{ key + 1 }}</uni-td>
				<uni-td class="nowrap" v-for="i, k in colums" :key="k">{{ item[i.key]}}</uni-td>
			</uni-tr>
		</uni-table>

		<u-popup :show="showPopup" @close="close" mode="bottom" style="">
			<view style="padding-top: 10px; padding-bottom: 10px;" class="common-table common-page-container popup-content">
				<view style="height: 50vh; overflow-y: scroll;">
					<uni-table ref="table" border stripe emptyText="暂无更多数据" :loading="searching">
						<uni-tr>
							<uni-th class="nowrap" align="left" width="50rpx" v-if="withIndex">序号</uni-th>
							<uni-th class="nowrap" align="left" width="100rpx" v-for="item, key in subColums"
								:key="key">{{item.label}}</uni-th>
						</uni-tr>
						<uni-tr v-for="item,key in showSubListItem[subKey]" :key="key" @click="singleConfirm(item)">
							<uni-td class="nowrap" v-if="withIndex">{{ key + 1 }}</uni-td>
							<uni-td class="nowrap" v-for="i, k in subColums" :key="k">{{ item[i.key]}}</uni-td>
						</uni-tr>
					</uni-table>
				</view>
			</view>
		</u-popup>
	</view>

	<slot></slot>

	<view class="btn-box">
		<up-button type="primary" text="确认选择" class="bottom-button" @click="multipleConfirm" v-if="props.multiple"
			shape="circle"></up-button>
	</view>
</template>

<style lang="scss" scoped>
	.content-box {
		flex: 1;
		overflow-y: scroll;
	}

	.selected {
		background-color: v-bind("globalColor.primary_background") !important;
	}
</style>