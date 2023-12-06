<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		reactive,
		onMounted
	} from 'vue';
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	// 工具
	// 接口
	// 数据
	import {
		routes
	} from "@/store/route"
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const rightClick = () => {
		uni.showToast({
			icon: "none",
			title: "默认参数"
		})
	}
</script>

<template>
	<CustomNavBar :title="routes.otherOutStockDoc.style.navigationBarTitleText" @rightClick="rightClick">
	</CustomNavBar>

</template>

<style scoped lang='less'>

</style>