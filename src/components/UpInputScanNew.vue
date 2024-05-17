<script lang="ts" setup>
	import ScanCode from "@/components/ScanCode.vue"
	import { useDebounce } from "@ultra-man/noa"

	const props = defineProps<{
		manInput ?: boolean,
	}>()

	const emit = defineEmits<{
		(event : "scanSuccess", result : string) : void;
	}>()

	// 摄像头扫码
	const scanSuccess = (res : string) => {
		emit("scanSuccess", res)

	}

	// 扫码枪输入
	const changeSuccess = useDebounce((res : string) => {
		// 如果配置了手动输入，则不处理
		if (props.manInput) return
		emit("scanSuccess", res)

	})
	// 如果是手动输入
	const blurSuccess = useDebounce((res : string) => {
		// 如果配置了不是手动输入，则不处理
		if (!props.manInput) return
		emit("scanSuccess", res)
	})
</script>

<template>
	<up-input @change="changeSuccess" @blur="blurSuccess">
		<template #suffix>
			<ScanCode @scanSuccess="scanSuccess"></ScanCode>
		</template>
	</up-input>
</template>

<style lang="scss" scoped>
</style>