<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		reactive
	} from 'vue';
	// 组件
	// 工具
	// 接口
	// 数据
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	import {
		onLoad,
		onShow,
		onUnload,
		onHide
	} from "@dcloudio/uni-app"

	onLoad((options) => {
		console.log("demoInside 页面 onLoad", options)

	})
	onShow((options) => {
		console.log("demoInside 页面 onShow", options)
	})
	onUnload(() => {
		console.log("demoInside 页面 onUnload")
	})
	onHide(() => {
		console.log("demoInside 页面 onHide")
	})
</script>

<template>
	<view></view>
</template>

<style scoped lang='less'>

</style>