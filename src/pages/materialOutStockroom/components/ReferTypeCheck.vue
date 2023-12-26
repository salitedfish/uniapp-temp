<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
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
	const types = ref([{
		name: "参照生产订单工序派工资料",
		value: 0
	}, {
		name: "参照领料申请单",
		value: 1
	}])
</script>

<template>
	<u-radio-group placement="row" class="radio-group">
		<u-radio v-for="item, key in types" :key="key" :name="item.value" :label="item.name"></u-radio>
	</u-radio-group>
</template>

<style scoped lang="scss">
	.radio-group {
		flex: 0;
		justify-content: space-between;
	}
</style>