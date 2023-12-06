<script lang="ts" setup>
	import { globalColor } from "@/store/theme"
	const props = defineProps<{
		label ?: string
	}>()
	const emit = defineEmits<{
		(event : "success", tempFiles : UniApp.ChooseImageSuccessCallbackResult["tempFiles"]) : void
		(event : "fail") : void
	}>()

	// 选取图片
	const chooseImage = () => {
		uni.chooseImage({
			success(tempFilePaths) {
				emit("success", tempFilePaths.tempFiles)
			},
			fail() {
				emit("fail")
			}
		})
	}
</script>

<template>
	<view @click="chooseImage" class="btn">
		<view class="label" v-if="props.label">{{ props.label }}</view>
		<uni-icons custom-prefix="custom-icon" type="icon-camera" size="18" :color="globalColor.primary"></uni-icons>
	</view>
</template>

<style lang="scss" scoped>
	.btn {
		display: flex;
		align-items: center;
		color: v-bind("globalColor.primary");

		.label {
			margin-right: 3px;
		}

		.icon {
			width: 20px;
			height: 20px;
		}
	}
</style>