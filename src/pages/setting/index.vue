<script lang="ts" setup>
	import { route } from "../../store/route"

	const goLogin = () => {
		uni.navigateTo({
			url: route.login
		})
	}
</script>

<template>
	<view class="uni-common-mt">
		<up-button @click="goLogin" type="primary">登录</up-button>
	</view>
</template>

<style lang="scss">
	.uni-common-mt {
		padding: 0 24rpx 0;

		.uni-form-item {
			margin-top: 24rpx;

			.title {
				margin-bottom: 16rpx;
			}
		}
	}
</style>