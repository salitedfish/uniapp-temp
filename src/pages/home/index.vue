<script lang="ts" setup>
	import { computed, ref } from "vue"
	import { routes } from "@/store/route"
	import { globalColor } from "@/store/theme"
	import { RouteType, type Route } from "@/type/route"
	import { logged } from "@/util/common"
	import { userInfo, authList } from "@/store/auth"
	import { updateAllDate } from "@/store/common"
	import manifestJson from "@/manifest.json"
	import { Env } from "@/type/env"
	import { Platform } from "@/util/env"
	import { versionCheck } from "@/util/app"
	import { useLogout } from "@/hook/useLogout"
	import { closeAfterLogout } from "@/hook/useCloseApp"

	updateAllDate()

	interface FunItem {
		name ?: string,
		title ?: string,
		icon ?: string,
		route ?: Route,
		auth ?: boolean
	}

	// 追溯系统页面
	const traceManagerList = computed<FunItem[]>(() => {
		return [
			{
				name: routes.LdOnDuty.name,
				title: routes.LdOnDuty.style.navigationBarTitleText,
				icon: "/static/home/clockIn.svg",
				route: routes.LdOnDuty,
				auth: authList.value.includes(routes.LdOnDuty.name)
			},
			{
				name: routes.LdWorkPlan.name,
				title: routes.LdWorkPlan.style.navigationBarTitleText,
				icon: "/static/home/workPlan.svg",
				route: routes.LdWorkPlan,
				auth: authList.value.includes(routes.LdWorkPlan.name)
			},
			{
				name: routes.LdAndon.name,
				title: routes.LdAndon.style.navigationBarTitleText,
				icon: "/static/home/anDon.svg",
				route: routes.LdAndon,
				auth: authList.value.includes(routes.LdAndon.name)
			},
			{
				name: routes.Trace.name,
				title: routes.Trace.style.navigationBarTitleText,
				icon: "/static/home/traceManager.svg",
				route: routes.Trace,
				auth: authList.value.includes(routes.Trace.name)
			},
			{
				name: routes.TraceSearch.name,
				title: routes.TraceSearch.style.navigationBarTitleText,
				icon: "/static/home/traceSearch.svg",
				route: routes.TraceSearch,
				auth: authList.value.includes(routes.TraceSearch.name)
			},
			{
				name: routes.ProductJobList.name,
				title: routes.ProductJobList.style.navigationBarTitleText,
				icon: "/static/home/productJobList.svg",
				route: routes.ProductJobList,
				auth: authList.value.includes(routes.ProductJobList.name)
			},
		]
	})

	// 独立的页面，开发时展示，打包时会隐藏入口
	const devList = computed<FunItem[]>(() => {
		return process.env.NODE_ENV === Env.DEV ? [
			{
				name: routes.board.name,
				title: routes.board.style.navigationBarTitleText,
				icon: "/static/home/out_sr_doc_upload.svg",
				route: routes.board,
			},
		] : []
	})

	// 右上角抽屉: 原来点一下直接弹「确定要退出吗？」, 现在先出这个抽屉,
	// 「检查更新」和「退出登陆」都收在里面
	const menuVisible = ref(false)

	// 抽屉宽度: 手机占约七成, 宽屏封顶 320px(两条菜单用不着更宽)
	const menuStyle = (() => {
		const w = uni.getSystemInfoSync().windowWidth || 375
		return {
			width: Math.min(320, Math.round(w * 0.72)) + "px",
			height: "100%"
		}
	})()

	// 检查更新: 原来在启动页(pages/blank)静默跑, 2026-09-30 搬到这个按钮手动触发, 启动不再检查。
	// 只在 App 端出现 —— 更新要走 plus.downloader 下载安装包再 plus.runtime.install,
	// H5 / 钉钉 / 微信都是网页, 没有可安装的包, 放出来只会点了报错
	const checking = ref(false)
	const checkUpdate = async () => {
		if (checking.value) return
		try {
			checking.value = true
			await versionCheck({})
		} catch (err) {
			console.log(err)
			uni.showToast({
				icon: "none",
				title: "检查更新失败"
			})
		} finally {
			checking.value = false
			menuVisible.value = false
		}
	}

	// 退出登陆: 与原来「确定要退出吗？」确认后走的是同一套(useLogout + 收尾跳转),
	// 抽屉本身就是那一步确认, 所以不再叠一层弹窗
	const { logouting, logout } = useLogout()
	const doLogout = async () => {
		if (logouting.value) return
		try {
			logouting.value = true
			await logout()
			closeAfterLogout()
		} catch (err) {
			console.log(err)
		} finally {
			logouting.value = false
		}
	}

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
				{{routes.home.style.navigationBarTitleText + " v" + manifestJson.versionName}}
			</view>
		</template>
		<template #right>
			<view v-if="logged" class="nav-right">
				<view class="tip" v-if="userInfo.jobName">
					{{`Hi, ${userInfo.jobName}`}}
				</view>
				<uni-icons custom-prefix="custom-icon" type="icon-guanji" class="link" :color=" globalColor.primary"
					@click="menuVisible = true" size="20"></uni-icons>
			</view>
		</template>
	</u-navbar>

	<up-text text="追溯管理" class="grid-title" bold v-if="traceManagerList.filter(item => !!item.auth).length"></up-text>
	<u-grid :border="true" class="grid-box">
		<u-grid-item @click="itemClick(item)" v-for="(item,index) in traceManagerList.filter(item => !!item.auth)"
			:key="index" class="grid-item">
			<image :src="item.icon" class="grid-icon"></image>
			<text class="grid-text">{{item.title}}</text>
		</u-grid-item>
	</u-grid>

	<up-text text="其他" class="grid-title" bold v-if="devList.length"></up-text>
	<u-grid :border="false" class="grid-box">
		<u-grid-item @click="itemClick(item)" v-for="(item,index) in devList" :key="index" class="grid-item"
			:name="item.title">
			<image :src="item.icon" class="grid-icon"></image>
			<text class="grid-text">{{item.title}}</text>
		</u-grid-item>
	</u-grid>

	<!-- 右上角抽屉: 检查更新(App 端才有) + 退出登陆 -->
	<up-popup :show="menuVisible" mode="right" :customStyle="menuStyle" @close="menuVisible = false">
		<view class="home-menu">
			<view class="home-menu__head">
				<view class="home-menu__bar">
					<view class="home-menu__bar-text">
						<text class="home-menu__title">更多</text>
						<text class="home-menu__sub">当前版本 v{{ manifestJson.versionName }}</text>
					</view>
					<view class="home-menu__close" @click="menuVisible = false">
						<uni-icons type="closeempty" color="#ffffff" size="18"></uni-icons>
					</view>
				</view>
			</view>
			<view class="home-menu__body">
				<view v-if="Platform.isApp()" class="home-menu__item" @click="checkUpdate">
					<uni-icons type="refresh" :color="globalColor.primary" size="20"></uni-icons>
					<view class="home-menu__item-main">
						<text class="home-menu__item-text">检查更新</text>
						<text class="home-menu__item-desc">{{ checking ? "正在检查..." : "看看有没有新版本" }}</text>
					</view>
				</view>
				<view class="home-menu__item" @click="doLogout">
					<uni-icons custom-prefix="custom-icon" type="icon-guanji" :color="globalColor.primary" size="20">
					</uni-icons>
					<view class="home-menu__item-main">
						<text class="home-menu__item-text">退出登陆</text>
						<text class="home-menu__item-desc">{{ logouting ? "正在退出..." : "退出当前账号" }}</text>
					</view>
				</view>
			</view>
		</view>
	</up-popup>

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

	// 抽屉的头部(主色底 + 标题 + 关闭)与报工页的「检验单」「文档」两个右侧栏同一套观感
	.home-menu {
		display: flex;
		flex-direction: column;
		height: 100%;

		&__head {
			padding: 14px 15px 12px;
			background-color: v-bind("globalColor.primary");
		}

		&__bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		&__bar-text {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}

		&__title {
			font-size: 16px;
			font-weight: bold;
			color: #ffffff;
		}

		&__sub {
			margin-top: 4px;
			font-size: 12px;
			color: rgba(255, 255, 255, 0.85);
		}

		&__close {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.22);
		}

		&__body {
			flex: 1;
			min-height: 0;
			padding: 10px;
			background-color: #f5f6f8;
		}

		&__item {
			display: flex;
			align-items: center;
			padding: 14px 12px;
			margin-bottom: 10px;
			border-radius: 6px;
			background-color: #ffffff;
		}

		&__item-main {
			display: flex;
			flex-direction: column;
			min-width: 0;
			margin-left: 10px;
		}

		&__item-text {
			font-size: 15px;
			color: #303133;
		}

		&__item-desc {
			margin-top: 4px;
			font-size: 12px;
			color: #909399;
		}
	}
</style>