import { logout } from "../api/auth"

/**
 * 登出hook
 */
export const useLogout = async () => {
	const res = await logout()
	if (res) {
		uni.removeStorageSync("token")
		uni.removeStorageSync("userInfo")
		uni.showToast({
			icon: "none",
			title: "退出成功"
		})
	}
}