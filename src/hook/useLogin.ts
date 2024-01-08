import { ref } from "vue"
import { login as loginApi } from "@/api/auth"
import { setUserInfo } from "@/store/auth"

// 登录
export const useLogin = () => {

	const logging = ref(false)
	const login = async (loginForm : { jobNo : string, password : string }) => {
		const res = await loginApi(loginForm)
		if (res) {
			// 登录成功
			uni.setStorageSync("token", res.data)
			await setUserInfo()
		}
	}

	return {
		logging,
		login
	}
}