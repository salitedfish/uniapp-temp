<script lang="ts" setup>
	import ScanCode from "@/components/ScanCode.vue"
	import { useDebounce } from "@ultra-man/noa"

	const emit = defineEmits<{
		(event : "scanSuccess", result : string) : void;
	}>()

	// 摄像头扫码
	const scanSuccess = (res : string) => {
		emit("scanSuccess", res)
	}

	// 扫码枪或者手动输入
	const changeSuccess = useDebounce((res : string) => {
		emit("scanSuccess", res)
	})
</script>

<template>
	<up-input @change="changeSuccess">
		<template #suffix>
			<ScanCode @scanSuccess="scanSuccess"></ScanCode>
		</template>
	</up-input>
</template>

<style lang="scss" scoped>
</style>