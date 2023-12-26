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
	defineProps < {
		modelValue: number
	} > ()
	const emit = defineEmits < {
		(event: "update:modelValue", value: number): void
	} > ()

	const types = ref([{
		name: "打印",
		value: 0
	}, {
		name: "不打印",
		value: 1
	}])

	const updateModelValue = (value: number) => {
		emit("update:modelValue", value)
	}
</script>

<template>
	<up-form class="common-form" labelPosition="left">
		<up-form-item class="common-form-item" label="打印出库明细:" borderBottom labelWidth="120" style="padding: 0">
			<view class="type-check-box">
				<u-radio-group placement="row" class="radio-group" :modelValue="modelValue"
					@update:modelValue="updateModelValue">
					<u-radio v-for="item, key in types" :key="key" :name="item.value" :label="item.name"></u-radio>
				</u-radio-group>
			</view>
		</up-form-item>
	</up-form>
</template>

<style scoped lang="scss">
	.type-check-box {
		width: 100%;
	}

	.radio-group {
		// width: 100%;
		// display: flex;
		// flex: 0;
		justify-content: space-around;
	}
</style>