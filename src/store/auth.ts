import { ref } from "vue"
import { geUserInfo } from "@/api/auth"

// 用户信息
export const userInfo = ref<Obj>(uni.getStorageSync("userInfo") || {})
// 权限列表
export const authList = ref<string[]>(uni.getStorageSync("userAuth") || [])
// token
export const token = ref<string>(uni.getStorageSync("token"))

// 设置token
export const setToken = async (_token : string) => {
	token.value = _token
	uni.setStorageSync("token", _token)
}
// 设置用户信息
export const setUserInfo = async () => {
	const res = await geUserInfo()
	if (res) {
		// 获取用户信息成功
		userInfo.value = res.data
		uni.setStorageSync("userInfo", res.data)
		// 接口返回的权限列表有menusDingdingRole和menusRole，根据menusDingdingRole
		authList.value = userInfo.value.menusDingdingRole ? userInfo.value.menusDingdingRole.split(",") : []
		if (userInfo.value.menusRoles) {
			authList.value.push(...userInfo.value.menusRoles.split(","))
		}
		uni.setStorageSync("userAuth", authList.value)
	}
}