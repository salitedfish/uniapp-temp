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
		// app 页面权限只认「移动页面权限」(web 角色管理 → 编辑权限 → 移动页面权限, 存 sys_role.menus_dingding_role)。
		// 接口还会返回 PC 菜单权限 menusRoles, 但那是 web 路由名, 与 app 页面名(LdOnDuty/LdAndon 等)重名,
		// 合并进来会让没勾移动权限的角色在 app 首页多出入口, 故只取 menusDingdingRole。
		authList.value = userInfo.value.menusDingdingRole ? userInfo.value.menusDingdingRole.split(",") : []
		uni.setStorageSync("userAuth", authList.value)
	}
}