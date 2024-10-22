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
		// 如果不是手动输入
		if (!props.manInput) {
			emit("scanSuccess", res)
		}
	})
	// 如果是手动输入
	const blurSuccess = useDebounce((res : string) => {
		// 如果是手动输入
		if (props.manInput) {
			emit("scanSuccess", res)
		}
	})
</script>

<template>
	<up-input @change="changeSuccess" @blur="blurSuccess">
		<!-- 有些手机输入完加回车才会触发change，有些不用加回车就能触发change，看情况而定 -->
		<template #suffix>
			<ScanCode @scanSuccess="scanSuccess"></ScanCode>
		</template>
	</up-input>
</template>

<style lang="scss" scoped>
</style>