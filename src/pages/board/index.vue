<script lang='ts' setup>
	import {
		reactive
	} from "vue"
	import {
		getBoardsByTvUUID
	} from "@/api/board"

	const props = defineProps < {
		deviceId: string
	} > ()

	// 设备id
	const data = reactive({
		deviceId: "",
		boardAddress: "",
		boards: [] as Obj[],
	})

	// 获取看板
	const getBoards = async () => {
		try {
			uni.showLoading({
				mask: true,
				title: "看板加载中",
			})
			const res = await getBoardsByTvUUID({
				tvCode: data.deviceId
			})
			if (res.data) {
				data.boards = res.data
				// 如果看板数量大于0个说明之前设置过了，知道设备id
				if (data.boards.length > 0) {
					boardIframeHandler(0)
					return
				}
			}

			// 如果没看板说明没设置过，提示设备id
			uni.showModal({
				title: '提示',
				content: `此设备未配置看板
设备id: ${data.deviceId}`,
			})
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}

	// 操作看板循环显示
	const boardIframeHandler = (index: number) => {
		data.boardAddress = data.boards[index].boardAddress
		// 如果看板数量大于1一个，则要循环展示
		if (data.boards.length > 1) {
			setTimeout(() => {
				// 如果是最后一个了，则展示第一个
				if (index + 1 >= data.boards.length) {
					boardIframeHandler(0)
				}
				// 展示下一个
				else {
					boardIframeHandler(index + 1)
				}
			}, data.boards[index].boardTime * 1000)
		}
	}

	// 如果有设备id则开始获取看板
	if (props.deviceId) {
		data.deviceId = props.deviceId
		if (data.deviceId) {
			getBoards()
		} else {
			uni.showModal({
				title: '提示',
				content: `未获取到设备id`,
			})
		}
	}
</script>

<template>
	<!-- 目前只能内嵌网页主动操作框架 -->
	<iframe name="moldLinkWindow" :src="data.boardAddress" class="iframe-box"></iframe>
</template>

<style scoped>
	.iframe-box {
		width: 100vw;
		height: 100vh;
		border: none;
	}
</style>