<script lang='ts' setup>
	//
	import {
		ref,
		onMounted
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		userInfo,
		setUserInfo
	} from "@/store/auth"
	import {
		globalColor
	} from "@/store/theme"
	// 接口
	import {
		getTraceLineList
	} from "@/api/trace"

	// 被 web 端「追溯管理 → 人工报工」用 iframe 内嵌时（地址带 embed=1）：不显示自带导航栏，
	// 这个返回箭头在 iframe 里没有去处，留着只是干扰
	const isEmbed = typeof location !== "undefined" &&
		new URLSearchParams(location.search).get("embed") === "1"

	onMounted(() => {
		initData()
	})

	const tableData = ref < Objs > ([])
	const initData = async () => {
		try {
			uni.showLoading({
				title: "查询中"
			})
			// 内嵌进 web 时页面可能比 App.vue 的 setUserInfo 先挂载，这里补一次，
			// 否则 personId 为空，查出来的产线清单会跟登录后不一致
			if (!userInfo.value || !userInfo.value.orgId) {
				await setUserInfo()
			}
			const res = await getTraceLineList({
				personId: userInfo.value.orgId
			});
			tableData.value = res.data
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}

	const goTraceProcess = (line: Obj) => {
		uni.navigateTo({
			url: `${routes.TraceProcess.path}?lineName=${line.lineName}&lineId=${line.lineId}`,
		})
	}
</script>

<template>
	<CustomNavBar v-if="!isEmbed" :title="routes.Trace.style.navigationBarTitleText"></CustomNavBar>

	<up-empty mode="order" icon="http://cdn.uviewui.com/uview/empty/order.png" text="暂无追溯项目"
		v-if="tableData.length === 0">
	</up-empty>

	<u-grid :border="true" class="grid-box" v-else>
		<u-grid-item @click="goTraceProcess(item)" v-for="(item,index) in tableData" :key="index" class="grid-item">
			<image src="/static/common/workLine.svg" class="grid-icon"></image>
			<view class="grid-text">{{item.lineName}}</view>
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