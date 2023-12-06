import { ref } from "vue"
import { logout as logoutApi } from "@/api/auth"

// 退出
export const useLogout = () => {

	const logouting = ref(false)
	const logout = async () => {
		const res = await logoutApi()
		if (res) {
			// 清空登录信息
			uni.removeStorageSync("token")
			uni.removeStorageSync("userInfo")
			uni.showToast({
				icon: "none",
				title: "退出成功"
			})
		}
	}

	return {
		logouting,
		logout
	}
}