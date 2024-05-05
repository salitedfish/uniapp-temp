<script lang='ts' setup>
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.traceSearch.style.navigationBarTitleText"></CustomNavBar>
	</view>
</template>

<style scoped lang='less'>

</style>