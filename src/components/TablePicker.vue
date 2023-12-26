<script lang="ts" setup>
	import { ref, onMounted, } from "vue"
	import { globalColor } from "@/store/theme"
	import { useDeepInclude } from "@ultra-man/noa"

	// 基础数据
	const props = defineProps<
		{
			searching ?: boolean,
			multiple ?: boolean,
			selected ?: any[],
			tableData ?: any[],
			selectKey : string,
			colums ?: { label : string, key : string }[],
			withIndex ?: boolean,
		}>()
	const emit = defineEmits<{
		(event : "select", result : any[]) : void;
		(event : "update:selected", selected : any[]) : void
		(event : "searchList") : void
	}>()

	onMounted(() => {
		if (props.selected) {
			selectItems.value = props.selected
		}
	})

	// 选择的列表
	const selectItems = ref<any[]>([])

	// 单选确认
	const singleConfirm = (item : any) => {
		if (props.multiple) return
		emit("update:selected", [item])
		emit("select", [item])
	}
	// 获取在选择列表中的index
	const getSelectedIndex = (item : any) => {
		return useDeepInclude(selectItems.value, {
			condition: i => i[props.selectKey] === item[props.selectKey]
		})
	}
	// 多选择触发
	const select = (item : any, status : boolean) => {
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
		if (selectItems.value.length > 0) {
			emit("update:selected", [...selectItems.value])
			emit("select", [...selectItems.value])
		}
	}
</script>

<template>
	<view class="content-box">
		<uni-table ref="table" border stripe emptyText="暂无更多数据" :loading="searching">
			<uni-tr>
				<uni-th align="left" width="50rpx" v-if="withIndex">序号</uni-th>
				<uni-th align="left" width="50rpx" v-if="props.multiple">选择</uni-th>
				<uni-th align="left" width="100rpx" v-for="item, key in colums" :key="key">{{item.label}}</uni-th>
			</uni-tr>
			<uni-tr v-for="item,key in tableData" :key="key" @click="singleConfirm(item)">
				<uni-td v-if="withIndex">{{ key + 1 }}</uni-td>
				<uni-td v-if="props.multiple">
					<uni-icons custom-prefix="custom-icon" type="icon-xuanze" size="18" :color="globalColor.primary"
						@click="select(item, false)" v-if="getSelectedIndex(item) !== false"></uni-icons>
					<uni-icons custom-prefix="custom-icon" type="icon-mei-xuanze" size="18" :color="globalColor.default"
						@click="select(item, true)" v-else></uni-icons>
				</uni-td>
				<uni-td v-for="i, k in colums" :key="k">{{ item[i.key]}}</uni-td>
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
</style>