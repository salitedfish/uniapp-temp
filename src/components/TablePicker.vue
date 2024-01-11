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
			withIndex ?: boolean,
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
		const index = getSelectedIndex(item)
		if (status) {
			if (index === false) {
				selectItems.value.push(item)
			}
		} else {
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
	// 清空选中
	const clearSelect = () => {
		selectItems.value = []
	}
</script>

<template>
	<view class="content-box">
		<uni-table ref="table" border stripe emptyText="暂无更多数据" :loading="searching">
			<uni-tr>
				<uni-th class="nowrap primary" align="left" width="50rpx" v-if="props.multiple" @click="clearSelect">清空</uni-th>
				<uni-th class="nowrap" align="left" width="50rpx" v-if="withIndex">序号</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-for="item, key in colums"
					:key="key">{{item.label}}</uni-th>
			</uni-tr>
			<uni-tr v-for="item,key in tableData" :key="key" @click="singleConfirm(item)"
				:class="{selected: !multiple && (singleSelectKey === item[selectKey])}">
				<uni-td class="nowrap" v-if="props.multiple">
					<uni-icons custom-prefix="custom-icon" type="icon-xuanze" size="18" :color="globalColor.primary"
						@click="select(item, false)" v-if="getSelectedIndex(item) !== false"></uni-icons>
					<uni-icons custom-prefix="custom-icon" type="icon-mei-xuanze" size="18" :color="globalColor.default"
						@click="select(item, true)" v-else></uni-icons>
				</uni-td>
				<uni-td class="nowrap" v-if="withIndex">{{ key + 1 }}</uni-td>
				<uni-td class="nowrap" v-for="i, k in colums" :key="k">{{ item[i.key]}}</uni-td>
			</uni-tr>
		</uni-table>
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