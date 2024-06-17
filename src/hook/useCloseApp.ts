import { Platform } from "@/util/env"
import { routes } from "@/store/route"
import { useLogout } from "@/hook/useLogout"

const { logout } = useLogout()

// 退出登陆并退出应用
export const useCloseApp = async () => {
	if (Platform.isInDD()) {
		uni.showModal({
			content: "确定要退出吗？",
			showCancel: true,
			async success(res) {
				if (res.confirm) {
					await logout()
					dingding.biz.navigation.close({})
				}
			}
		})
	} else {
		uni.showModal({
			content: "确定要退出吗？",
			showCancel: true,
			async success(res) {
				if (res.confirm) {
					await logout()
					uni.redirectTo({
						url: routes.login.path
					})
				}
			}
		})
	}
}