import { Platform } from "@/util/env"
import { routes } from "@/store/route"
import { useLogout } from "@/hook/useLogout"

const { logout } = useLogout()

// 退出登陆后的收尾: 钉钉里要把整个容器关掉, 其余端(H5 / 微信 / App)回登录页。
// 单独拆出来是因为首页右上角的抽屉里也有一处「退出登陆」, 两处收尾必须一致
export const closeAfterLogout = () => {
	if (Platform.isInDD()) {
		dingding.biz.navigation.close({})
	} else {
		uni.redirectTo({
			url: routes.login.path
		})
	}
}

// 退出登陆并退出应用(带二次确认)。
// 首页右上角 2026-09-30 改成了右侧抽屉(见 pages/home), 不再走这里;
// 仍在用的是报工页的内嵌页拿到 CLOSE_APP 指令那一处(moldLink)
export const useCloseApp = async () => {
	uni.showModal({
		content: "确定要退出吗？",
		showCancel: true,
		async success(res) {
			if (res.confirm) {
				await logout()
				closeAfterLogout()
			}
		}
	})
}