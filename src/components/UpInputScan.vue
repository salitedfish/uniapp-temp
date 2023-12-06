<script lang="ts" setup>
	import ScanCode from "@/components/ScanCode.vue"

	const props = defineProps<{
		modelValue : string
	}>()

	const emit = defineEmits<{
		(event : "update:modelValue", result : string) : void;
		(event : "scanSuccess", result : string) : void;
	}>()

	const valueChange = (res : string) => {
		emit("update:modelValue", res)
	}
	const scanSuccess = (res : string) => {
		emit("scanSuccess", res)
	}
</script>

<template>
	<up-input :modelValue="props.modelValue" @update:modelValue="valueChange">
		<template #suffix>
			<ScanCode @scanSuccess="scanSuccess"></ScanCode>
		</template>
	</up-input>
</template>

<style lang="scss" scoped>
</style>