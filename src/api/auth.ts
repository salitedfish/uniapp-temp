import { genHeader } from "./init"

/**
 * 登录接口
 * @param data
 */
export const login = async (data: {}) => {
  await uni.request({
    url: "login",
    header: genHeader(),
    data,
  })
}
