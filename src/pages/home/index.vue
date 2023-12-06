<script lang="ts" setup>
	import { routes } from "@/store/route"
	import { globalColor } from "@/store/theme"
	import { RouteType, type Route } from "@/type/route"

	interface FunItem {
		name ?: string,
		title ?: string,
		icon ?: string,
		route ?: Route
	}

	const baseList : FunItem[] = [
		{
			name: routes.purchaseArrival.name,
			title: routes.purchaseArrival.style.navigationBarTitleText,
			icon: "/static/home/arrival.svg",
			route: routes.purchaseArrival
		},
		{
			name: routes.purchaseStockroom.name,
			title: routes.purchaseStockroom.style.navigationBarTitleText,
			icon: "/static/home/storage.svg",
			route: routes.purchaseStockroom,
		},
		{
			name: routes.materialOutStockroom.name,
			title: routes.materialOutStockroom.style.navigationBarTitleText,
			icon: "/static/home/out_storage.svg",
			route: routes.materialOutStockroom,
		}
	]
	const othersList : FunItem[] = [
		{
			name: routes.productionStockroom.name,
			title: routes.productionStockroom.style.navigationBarTitleText,
			icon: "/static/home/good_storage.svg",
			route: routes.productionStockroom,
		},
		{
			name: routes.deliveryMaterial.name,
			title: routes.deliveryMaterial.style.navigationBarTitleText,
			icon: "/static/home/shipped.svg",
			route: routes.deliveryMaterial,
		},
		{
			name: routes.shelfChange.name,
			title: routes.shelfChange.style.navigationBarTitleText,
			icon: "/static/home/change_storage.svg",
			route: routes.shelfChange,
		},
		{
			name: routes.stockroomChange.name,
			title: routes.stockroomChange.style.navigationBarTitleText,
			icon: "/static/home/stowage_adjustment.svg",
			route: routes.stockroomChange,
		},
		{
			name: routes.codeCheck.name,
			title: routes.codeCheck.style.navigationBarTitleText,
			icon: "/static/home/code_inventory.svg",
			route: routes.codeCheck,
		},
		{
			name: routes.otherStockDoc.name,
			title: routes.otherStockDoc.style.navigationBarTitleText,
			icon: "/static/home/storage_order.svg",
			route: routes.otherStockDoc,
		},
		{
			name: routes.otherOutStockDoc.name,
			title: routes.otherOutStockDoc.style.navigationBarTitleText,
			icon: "/static/home/outbound_order.svg",
			route: routes.otherOutStockDoc,
		},
		{
			name: routes.refundDoc.name,
			title: routes.refundDoc.style.navigationBarTitleText,
			icon: "/static/home/returned_order.svg",
			route: routes.refundDoc,
		},
		{
		},
	]

	// 点击跳转，不同类型路由跳转方式不一样
	const itemClick = (item : FunItem) => {
		if (item.route) {
			if (item.route.type === RouteType.NAV) {
				uni.navigateTo({
					url: item.route.path + "?a=123"
				})
			}
			if (item.route.type === RouteType.TAB) {
				uni.switchTab({
					url: item.route.path
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
				color: $u-info
			}
		}
	}
</style>