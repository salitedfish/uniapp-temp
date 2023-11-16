// 生成请求头
export const genHeader = () => {
  return {
    token: uni.getStorageSync("token"),
  }
}
