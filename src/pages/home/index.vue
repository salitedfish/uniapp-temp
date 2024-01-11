<script lang="ts" setup>
	import { computed } from "vue"
	import { routes } from "@/store/route"
	import { globalColor } from "@/store/theme"
	import { RouteType, type Route } from "@/type/route"
	import { useLogout } from "@/hook/useLogout"
	import { logged } from "@/util/common"
	import { userInfo, authList } from "@/store/auth"

	interface FunItem {
		name ?: string,
		title ?: string,
		icon ?: string,
		route ?: Route,
		auth ?: boolean
	}

	const { logout } = useLogout()

	// 退出
	const logoutHandler = async () => {
		uni.showModal({
			content: "确定要退出吗？",
			showCancel: true,
			async success(res) {
				if (res.confirm) {
					await logout()
					uni.redirectTo({
						url: routes.login.path
					})
				}
			}
		})
	}

	const baseList = computed<FunItem[]>(() => {
		return [
			{
				name: routes.purchaseArrival.name,
				title: routes.purchaseArrival.style.navigationBarTitleText,
				icon: "/static/home/arrival.svg",
				route: routes.purchaseArrival,
				auth: authList.value.includes(routes.purchaseArrival.name)
			},
			{
				name: routes.purchaseStockroom.name,
				title: routes.purchaseStockroom.style.navigationBarTitleText,
				icon: "/static/home/storage.svg",
				route: routes.purchaseStockroom,
				auth: authList.value.includes(routes.purchaseStockroom.name)
			},
			{
				name: routes.materialOutStockroom.name,
				title: routes.materialOutStockroom.style.navigationBarTitleText,
				icon: "/static/home/out_storage.svg",
				route: routes.materialOutStockroom,
				auth: authList.value.includes(routes.materialOutStockroom.name)
			}
		]
	})
	const othersList = computed<FunItem[]>(() => {
		return [
			{
				name: routes.productionStockroom.name,
				title: routes.productionStockroom.style.navigationBarTitleText,
				icon: "/static/home/good_storage.svg",
				route: routes.productionStockroom,
				auth: authList.value.includes(routes.productionStockroom.name)
			},
			{
				name: routes.deliveryMaterial.name,
				title: routes.deliveryMaterial.style.navigationBarTitleText,
				icon: "/static/home/shipped.svg",
				route: routes.deliveryMaterial,
				auth: authList.value.includes(routes.deliveryMaterial.name)
			},
			{
				name: routes.shelfChange.name,
				title: routes.shelfChange.style.navigationBarTitleText,
				icon: "/static/home/change_storage.svg",
				route: routes.shelfChange,
				auth: authList.value.includes(routes.shelfChange.name)
			},
			{
				name: routes.stockroomChange.name,
				title: routes.stockroomChange.style.navigationBarTitleText,
				icon: "/static/home/stowage_adjustment.svg",
				route: routes.stockroomChange,
				auth: authList.value.includes(routes.stockroomChange.name)
			},
			{
				name: routes.codeCheck.name,
				title: routes.codeCheck.style.navigationBarTitleText,
				icon: "/static/home/code_inventory.svg",
				route: routes.codeCheck,
				auth: authList.value.includes(routes.codeCheck.name)
			},
			{
				name: routes.otherStockDoc.name,
				title: routes.otherStockDoc.style.navigationBarTitleText,
				icon: "/static/home/storage_order.svg",
				route: routes.otherStockDoc,
				auth: authList.value.includes(routes.otherStockDoc.name)
			},
			{
				name: routes.otherOutStockDoc.name,
				title: routes.otherOutStockDoc.style.navigationBarTitleText,
				icon: "/static/home/outbound_order.svg",
				route: routes.otherOutStockDoc,
				auth: authList.value.includes(routes.otherOutStockDoc.name)
			},
			{
				name: routes.refundDoc.name,
				title: routes.refundDoc.style.navigationBarTitleText,
				icon: "/static/home/returned_order.svg",
				route: routes.refundDoc,
				auth: authList.value.includes(routes.refundDoc.name)
			},
			{
				// name: routes.outSrDocFlieUpload.name,
				// title: routes.outSrDocFlieUpload.style.navigationBarTitleText,
				// icon: "/static/home/out_sr_doc_upload.svg",
				// route: routes.outSrDocFlieUpload,
			},
		]
	})

	// 点击跳转，不同类型路由跳转方式不一样
	const itemClick = (item : FunItem) => {
		if (item.route) {
			if (item.route.type === RouteType.NAV) {
				uni.navigateTo({
					url: item.route.path
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
	<u-navbar :fixed="true" placeholder title="">
		<template #left>
			<view>
				{{routes.home.style.navigationBarTitleText}}
			</view>
		</template>
		<template #right>
			<view v-if="logged" class="nav-right">
				<view class="tip" v-if="userInfo.jobName">
					{{`Hi, ${userInfo.jobName}`}}
				</view>
				<uni-icons custom-prefix="custom-icon" type="icon-guanji" class="link" :color=" globalColor.primary"
					@click="logoutHandler" size="20"></uni-icons>
			</view>
		</template>
	</u-navbar>

	<up-text text="原材料管理" class="grid-title" bold></up-text>
	<u-grid :border="true" class="grid-box">
		<u-grid-item @click="itemClick(item)" v-for="(item,index) in baseList.filter(item => item.auth)" :key="index"
			class="grid-item">
			<image :src="item.icon" class="grid-icon"></image>
			<text class="grid-text">{{item.title}}</text>
		</u-grid-item>
	</u-grid>

	<up-text text="其他" class="grid-title" bold></up-text>
	<u-grid :border="true" class="grid-box">
		<u-grid-item @click="itemClick(item)" v-for="(item,index) in othersList.filter(item => item.auth)" :key="index"
			class="grid-item" :name="item.title">
			<image :src="item.icon" class="grid-icon"></image>
			<text class="grid-text">{{item.title}}</text>
		</u-grid-item>
	</u-grid>

</template>

<style lang="scss" scoped>
	.nav-right {
		display: flex;
		align-items: center;

		.link {
			margin-left: 5px;
		}
	}

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