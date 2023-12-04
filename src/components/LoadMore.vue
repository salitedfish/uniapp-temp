<script lang="ts" setup>
	const props = defineProps<{
		status : "loadmore" | "loading" | "nomore"
	}>()

	const emit = defineEmits<{
		(event : "loadmore") : void
	}>()

	const loadText = {
		loadmore: '点击或上拉加载更多',
		loading: '努力加载中',
		nomore: '没有了'
	}
	const iconType = "circle"

	const loadmore = () => {
		emit("loadmore")
	}
</script>


<template>
	<u-loadmore :status="props.status" :icon-type="iconType" :load-text="loadText" @loadmore="loadmore" />
</template>

<style lang="scss" scoped>
</style>