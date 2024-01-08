<script lang="ts" setup>
	import ScanCode from "@/components/ScanCode.vue"

	const emit = defineEmits<{
		(event : "scanSuccess", result : string) : void;
	}>()


	const scanSuccess = (res : string) => {
		emit("scanSuccess", res)
	}

	const changeSuccess = (res : string) => {
		emit("scanSuccess", res)
	}
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