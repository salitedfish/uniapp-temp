<script lang="ts" setup>
	import { routes } from "../../store/route"
	import { logged } from "../../util/common"

	if (logged()) {
		uni.switchTab({
			url: routes.home.path
		})
	} else {
		uni.redirectTo({
			url: routes.login.path
		})
	}
</script>

<template>
</template>

<style>
</style>