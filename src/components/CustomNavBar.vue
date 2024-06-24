<script lang='ts'>
	// 框架
	import {
		defineComponent,
		useAttrs
	} from 'vue';
	// 组件
	// 工具
	import {
		Platform
	} from "@/util/env"
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
		if (props.leftClick) {
			props.leftClick()
		} else {
			// h5端如果使用navigateBack无法携带原页面本来的参数
			// 所以用浏览器自带的方法代替
			// #ifdef H5
			history.back()
			// #endif
			// app端没这个问题
			// #ifdef APP-PLUS
			uni.navigateBack()
			// #endif
		}
	}
	const props = withDefaults(defineProps < {
		rightText ? : string
		leftClick ? : () => void
	} > (), {
		rightText: ""
	})
</script>

<template>
	<u-navbar :fixed="true" placeholder @leftClick="leftClick" v-bind="attrs">
		<!-- 		<template #left v-if="Platform.isInDD()">
			<view></view>
		</template> -->
		<template #right>
			<view class="link">
				{{rightText}}
			</view>
		</template>
	</u-navbar>
</template>

<style scoped lang='less'>

</style>