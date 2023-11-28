<script lang="ts" setup>
	import { routes } from "../../store/route"
	import { RouteType } from "../../type/route"

	interface FunItem {
		name ?: string,
		title ?: string,
		icon ?: string,
		path ?: string,
		type ?: RouteType
	}

	const baseList : FunItem[] = [
		{
			name: 'photo',
			title: '采购到货',
			icon: "/static/home/arrival.svg",
			path: routes.login.path,
			type: routes.login.type
		},
		{
			name: 'lock',
			title: '采购入库',
			icon: "/static/home/storage.svg",
			path: routes.login.path,
			type: routes.login.type
		},
		{
			name: 'star',
			title: '材料出库',
			icon: "/static/home/out_storage.svg",
			path: routes.login.path,
			type: routes.login.type
		}
	]
	const othersList : FunItem[] = [
		{
			name: 'photo',
			title: '成品入库',
			icon: "/static/home/good_storage.svg",
			path: "",
			type: RouteType.NAV
		},
		{
			name: 'lock',
			title: '货位调整',
			icon: "/static/home/change_storage.svg",
			path: "",
			type: RouteType.NAV
		},
		{
			name: 'star',
			title: '调拨入库',
			icon: "/static/home/stowage_adjustment.svg",
			path: "",
			type: RouteType.NAV
		},
		{
			name: 'star',
			title: '条码盘点',
			icon: "/static/home/code_inventory.svg",
			path: "",
			type: RouteType.NAV
		},
		{
			name: 'star',
			title: '其他入库单',
			icon: "/static/home/storage_order.svg",
			path: "",
			type: RouteType.NAV
		},
		{
			name: 'star',
			title: '其他出库单',
			icon: "/static/home/outbound_order.svg",
			path: "",
			type: RouteType.NAV
		},
		{
			name: 'star',
			title: '退货单',
			icon: "/static/home/returned_order.svg",
			path: "",
			type: RouteType.NAV
		},
		{
		},
		{
		},
	]

	// 点击跳转，不同类型路由跳转方式不一样
	const itemClick = (item : FunItem) => {
		if (item.path) {
			if (item.type === RouteType.NAV) {
				uni.navigateTo({
					url: item.path + "?a=123"
				})
			}
			if (item.type === RouteType.TAB) {
				uni.switchTab({
					url: item.path
				})
			}
		}

	}
</script>

<template>
	<up-text text="原材料管理" class="grid-title" bold></up-text>
	<u-grid :border="true" class="grid-box">
		<u-grid-item @click="itemClick(item)" v-for="(item,index) in baseList" :key="index" class="grid-item">
			<image :src="item.icon" class="grid-icon"></image>
			<text class="grid-text">{{item.title}}</text>
		</u-grid-item>
	</u-grid>

	<up-text text="其他" class="grid-title" bold></up-text>
	<u-grid :border="true" class="grid-box">
		<u-grid-item @click="itemClick(item)" v-for="(item,index) in othersList" :key="index" class="grid-item">
			<image :src="item.icon" class="grid-icon"></image>
			<text class="grid-text">{{item.title}}</text>
		</u-grid-item>
	</u-grid>

</template>

<style lang="scss" scoped>
	.grid-title {
		padding: 20rpx 20rpx;

	}

	.grid-box {
		border-top: 1px solid $u-border-color;
		border-bottom: 1px solid $u-border-color;

		.grid-item {
			padding: 35rpx 0;

			.grid-icon {
				width: 120rpx;
				height: 120rpx;
				margin-bottom: 15rpx;
			}

			.grid-text {
				color: $u-info
			}
		}
	}
</style>