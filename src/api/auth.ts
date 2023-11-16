/**
 * 登录接口
 * @param data
 */
export const login = async (data: {}) => {
  await uni.request({
    url: "login",
    data,
  })
}
