<script lang="ts" setup>
import { ref } from "vue"
import * as auth from "../../api/auth"

const loginForm = ref({
  name: "",
  password: "",
})

const initLogin = async () => {
  try {
	uni.setStorageSync("token", "123456")
    const res = await auth.login({})
    uni.setStorageSync("userInfo", {})
  } catch (err) {
    uni.showToast({
      icon: "none",
      title: "登录失败",
    })
  }
}
</script>

<template>
  <view class="login-container">
    <up-form labelPosition="left">
      <up-form-item
        label="用户名"
        prop="userInfo.name"
        borderBottom
        labelWidth="72"
      >
        <up-input
          v-model="loginForm.name"
          border="surround"
          placeholder="输入用户名"
          clearable
          class="input-item"
        ></up-input>
      </up-form-item>

      <up-form-item
        label="密码"
        prop="userInfo.name"
        borderBottom
        labelWidth="72"
      >
        <up-input
          v-model="loginForm.password"
          border="surround"
          placeholder="输入密码"
          clearable
          class="input-item"
        ></up-input>
      </up-form-item>
    </up-form>
    <up-button
      class="btn-item"
      @click="initLogin"
      type="primary"
      text="登录"
    ></up-button>
  </view>
</template>

<style scoped lang="scss">
.login-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 40rpx 80rpx;
  border: 2rpx solid #cbced4;
  border-radius: 10rpx;
  .input-item {
    width: 300rpx;
  }
}
</style>
