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
	import {
		routes
	} from "@/store/route"
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const attrs = useAttrs()
	const leftClick = () => {
		uni.switchTab({
			url: routes.home.path
		})
	}
</script>

<template>
	<u-navbar :fixed="true" placeholder @leftClick="leftClick" v-bind="attrs">
		<template #right>
			<view class="link">
				默认参数
			</view>
		</template>
	</u-navbar>
</template>

<style scoped lang='less'>

</style>