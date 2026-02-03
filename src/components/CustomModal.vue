<template>
	<view v-show="customModalStore.visiable">
		<view class="global-modal-mask"></view>
		<view class="global-modal">
			<view class="title">{{ customModalStore.title }}</view>
			<view class="content">
				{{ customModalStore.content }}
			</view>
			<div v-show="customModalStore.showSlot">
				<slot>

				</slot>
			</div>
			<view class="btn-box">
				<view class="btn" @click="cancel">取消</view>
				<view class="btn" @click="confirm">确认</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { onBeforeUnmount, onMounted } from "vue"
	import { customModalStore } from "@/store/customModal"
	import { globalColor } from "@/store/theme"

	const confirm = async () => {
		let next = true
		if (customModalStore.success) {
			next = await customModalStore.success()
		}
		if (next) {
			customModalStore.visiable = false
		}
	}

	const cancel = async () => {
		let next = true
		if (customModalStore.cancel) {
			next = await customModalStore.cancel()
		}
		if (next) {
			customModalStore.visiable = false
		}
	}

	// 用于判断页面中是否存在自定义modal，如果不存在则使用uni.modal
	onMounted(() => {
		customModalStore.exist = true
	})
	onBeforeUnmount(() => {
		customModalStore.exist = false
	})
</script>

<style lang="scss" scoped>
	.global-modal-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 99999;
		background-color: v-bind("globalColor.error");
		opacity: 0.5
	}

	.global-modal {
		position: fixed;
		left: 50%;
		top: 50%;
		background-color: v-bind("globalColor.error");
		width: 80vw;
		min-height: 320rpx;
		transform: translate(-50%, -60%);
		z-index: 99999;
		border-radius: 10px;
		color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.title {
			text-align: center;
			padding: 14rpx 30rpx;
			font-size: 40rpx;
			border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		}

		.content {
			flex: 1;
			padding: 10rpx 30rpx;
			font-size: 32rpx;
		}

		.btn-box {
			display: flex;
			justify-content: space-between;
			font-size: 32rpx;
			border-top: 1px solid rgba(255, 255, 255, 0.2);

			.btn {
				height: 80rpx;
				line-height: 80rpx;
				flex: 1;
				text-align: center;
			}

			.btn+.btn {
				border-left: 1px solid rgba(255, 255, 255, 0.2);
			}
		}
	}
</style>