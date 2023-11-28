import { ref } from "vue"
import { login as loginApi, geUserInfo } from "../api/auth"

export const useLogin = () => {
	const logging = ref(false)
	const login = async (loginForm : { jobNo : string, password : string }) => {
		const res = await loginApi(loginForm)
		if (res) {
			// 登录成功
			uni.setStorageSync("token", res.data)
			const ree = await geUserInfo()
			if (ree) {
				// 获取用户信息成功
				uni.setStorageSync("userInfo", ree.data)
			}
		}
	}

	return {
		logging,
		login
	}
}