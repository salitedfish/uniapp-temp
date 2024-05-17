<script lang='ts' setup>
	import {
		ref,
		onMounted
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	// 数据
	import {
		userInfo
	} from "@/store/auth"
	import {
		routes
	} from "@/store/route"
	import {
		globalColor
	} from "@/store/theme"
	// 接口
	import {
		getTraceLineDetail
	} from "@/api/trace"

	const props = defineProps < {
			lineId: string,
			lineName: string
		} >
		()

	onMounted(() => {
		initData()
	})

	const tableData = ref < Obj[] > ([])
	const initData = async () => {
		try {
			uni.showLoading({
				title: "查询中"
			})
			const res = await getTraceLineDetail({
				personId: userInfo.value.orgId,
				lineId: props.lineId
			})
			tableData.value = res.data.list
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}

	const goTraceProcessInfo = (process: Obj) => {
		uni.navigateTo({
			url: `${routes.TraceInfo.path}?lineDetailId=${process.lineDetailId}&procedureName=${process.procedureName}`,
		})
	}
</script>

<template>
	<CustomNavBar :title="lineName"></CustomNavBar>

	<up-empty mode="order" icon="http://cdn.uviewui.com/uview/empty/order.png" text="暂无追溯流程"
		v-if="tableData.length === 0">
	</up-empty>

	<u-grid :border="true" class="grid-box" v-else>
		<u-grid-item @click="goTraceProcessInfo(item)" v-for="(item,index) in tableData" :key="index" class="grid-item">
			<image src="/static/common/process.svg" class="grid-icon"></image>
			<view class="grid-text">{{item.procedureName}}</view>
		</u-grid-item>
	</u-grid>
</template>

<style scoped lang='scss'>
	.grid-box {
		border-top: 1px solid v-bind("globalColor.border");
		border-bottom: 1px solid v-bind("globalColor.border");

		.grid-item {
			padding: 35rpx 0;

			.grid-icon {
				width: 120rpx;
				height: 120rpx;
				margin-bottom: 15rpx;
			}

			.grid-text {
				width: 100%;
				padding: 0 10rpx;
				color: $u-info;
				font-size: 24rpx;
				word-wrap: break-word;
				text-align: center;
			}
		}
	}
</style>