<script lang="ts" setup>
	import { ref } from "vue"
	import { useThrottle } from "@ultra-man/noa"
	import { globalColor } from "@/store/theme"
	import { routes } from "@/store/route"
	import { useLogin } from "@/hook/useLogin"

	const { logging, login } = useLogin()

	// 登录表单
	const loginForm = ref({
		jobNo: "",
		password: "",
	})

	// 校验登录
	const initLogin = useThrottle(() => {

		if (!loginForm.value.jobNo) {
			uni.showToast({
				icon: "none",
				title: "请填写账号"
			})
		} else if (!loginForm.value.password) {
			uni.showToast({
				icon: "none",
				title: "请填写密码"
			})
		} else {
			startLogin()
		}
	})
	// 开始登录
	const startLogin = async () => {
		try {
			logging.value = true
			uni.showLoading({
				mask: true,
				title: "登录中...",
			})
			await login(loginForm.value)
			uni.showToast({
				icon: "none",
				title: "登录成功",
			})
			uni.switchTab({
				url: routes.home.path
			})

		} catch (err) {
			// 失败请求接口统一处理
		} finally {
			uni.hideLoading()
			logging.value = false
		}
	}
</script>

<template>
	<u-navbar :fixed="true" placeholder :title="routes.login.style.navigationBarTitleText">
		<template #left>
			<view></view>
		</template>
		<template #right>
		</template>
	</u-navbar>

	<view class="login-container">
		<view class="logo_container">
			<image src="../../static/yinlun_logo.jpg" class="login_logo"></image>
		</view>
		<up-text text="南昌银轮仓储管理系统(WMS)" class="grid-title" bold align="center" size="24"
			style="text-align: center;"></up-text>

		<up-form labelPosition="left">
			<up-form-item class="form-item" label="账号:" borderBottom labelWidth="50">
				<up-input v-model="loginForm.jobNo" border="surround" placeholder="请输入账号" clearable
					class="input-item"></up-input>
			</up-form-item>

			<up-form-item class="form-item" label="密码:" borderBottom labelWidth="50">
				<up-input v-model="loginForm.password" border="surround" placeholder="请输入密码" clearable
					class="input-item"></up-input>
			</up-form-item>
		</up-form>
		<up-button class="btn-item" @click="initLogin" type="primary" text="登录" :loading="logging"
			loadingMode="circle"></up-button>
		<!-- <up-button class="btn-item" @click="initLogin" type="primary" text="系统配置"></up-button> -->
	</view>
</template>

<style scoped lang="scss">
	.login-container {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 40rpx 80rpx;
		border: 2rpx solid v-bind("globalColor.default_background");
		background-color: v-bind("globalColor.default_background");
		border-radius: 10rpx;
		width: 80%;
		max-width: 600px;

		.logo_container {
			width: 50%;
			height: 0px;
			padding-bottom: 50%;
			position: relative;
			margin: 0 auto;
		}

		.login_logo {
			width: 100%;
			height: 100%;
			position: absolute;
			top: 0;
			left: 0;
			border-radius: 50%;
		}

		.form-item {

			.input-item {
				background-color: #fff;
			}
		}



		.btn-item {
			margin-top: 15rpx
		}
	}
</style>