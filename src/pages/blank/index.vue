<script lang="ts" setup>
	import { useVersionCheck } from "@/hook/useVersionCheck"
	import { Platform } from "@/util/env"

	if (Platform.isApp()) {
		useVersionCheck({})
	}
</script>

<template>
</template>

<style>
</style>