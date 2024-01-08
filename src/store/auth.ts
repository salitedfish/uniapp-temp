import { ref } from "vue"
import { geUserInfo } from "@/api/auth"

// 用户信息
export const userInfo = ref<Obj>({})
// 权限列表
export const authList = ref<string[]>([])

// 设置用户信息
export const setUserInfo = async () => {
	const res = await geUserInfo()
	if (res) {
		// 获取用户信息成功
		uni.setStorageSync("userInfo", res.data)
		userInfo.value = res.data
		authList.value = userInfo.value.menusDingdingRole ? userInfo.value.menusDingdingRole.split(",") : []
	}
}