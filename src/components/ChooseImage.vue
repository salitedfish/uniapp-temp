<script lang="ts" setup>
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
		<image class="icon" src="../assets/takePhoto.svg" alt="" />
	</view>
</template>

<style lang="scss" scoped>
	.btn {
		display: flex;
		align-items: center;
		color: $u-primary;

		.label {
			margin-right: 3px;
		}

		.icon {
			width: 20px;
			height: 20px;
		}
	}
</style>