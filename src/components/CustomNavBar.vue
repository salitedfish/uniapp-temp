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
		if (props.leftClick) {
			props.leftClick()
		} else {
			// #ifdef APP-PLUS
			uni.navigateBack()
			// #endif
			// #ifdef H5
			history.back()
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
		<template #right>
			<view class="link">
				{{rightText}}
			</view>
		</template>
	</u-navbar>
</template>

<style scoped lang='less'>

</style>