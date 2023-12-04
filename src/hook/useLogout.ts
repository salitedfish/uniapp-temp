import { ref } from "vue"
import { logout as logoutApi } from "@/api/auth"

/**
 * 登出hook
 */
export const useLogout = async () => {

	const logouting = ref(false)
	const logout = async () => {
		const res = await logoutApi()
		if (res) {
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