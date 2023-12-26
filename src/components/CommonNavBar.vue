<script lang='ts'>
	// 框架
	import {
		defineComponent,
		useAttrs
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
	const attrs = useAttrs()
	const leftClick = () => {
		uni.navigateBack()
	}
</script>

<template>
	<u-navbar v-bind="attrs" :fixed="true" placeholder @leftClick="leftClick">
	</u-navbar>
</template>

<style scoped lang='less'>

</style>