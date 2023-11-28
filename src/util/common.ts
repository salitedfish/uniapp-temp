/**
 * 判断登录信息是否齐全
 */
export const logged = () => {
	const token = uni.getStorageSync("token")
	const userInfo = uni.getStorageSync("userInfo")
	if (token === '' || token === null || token === undefined || userInfo === '' || userInfo === null || userInfo === undefined) {
		return false
	} else {
		return true
	}
}