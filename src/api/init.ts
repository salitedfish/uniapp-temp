
import { routes } from "@/store/route"
import { useGenParamsUrl } from "@ultra-man/noa"

// 生成请求头
export const genHeader = () => {
	return {
		token: uni.getStorageSync("token"),
		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
	}
}

type RequestOptions = UniApp.RequestOptions & { params ?: Obj }

// 封装请求
export class URequest {

	// 基础配置
	constructor(private baseConfig : { baseUrl : string }) { }

	public async get<T>(config : RequestOptions) {
		config.method = 'GET'
		return await this.request<T>(config)
	}

	public async post<T>(config : RequestOptions) {
		config.method = 'POST'
		return await this.request<T>(config)
	}

	public async put<T>(config : RequestOptions) {
		config.method = 'PUT'
		return await this.request<T>(config)
	}

	public async delete<T>(config : RequestOptions) {
		config.method = 'DELETE'
		return await this.request<T>(config)
	}

	private async request<T>(config : RequestOptions) {
		// 请求拦截
		if (!config.header) {
			config.header = genHeader()
		} else {
			config.header = { ...genHeader(), ...config.header }
		}
		// config.withCredentials = true          
		config.url = this.baseConfig.baseUrl + config.url

		if (config.params) {
			config.url = useGenParamsUrl(config.url, config.params)
		}

		return new Promise<T>((resolve, reject) => {
			// 响应拦截器
			config.success = (res) => {
				console.log("请求返回res：", res)
				if (res.statusCode === 200) {
					// 请求成功
					if ((res.data as any).status === 200) {
						if ((res.data as any).data && (res.data as any).data.errMsg) {
							// uni.showToast({
							// 	icon: "none",
							// 	title: (res.data as any).data.errMsg,
							// 	duration: 3000,
							// })
							uni.showModal({
								title: '异常',
								content: (res.data as any).data.errMsg,
								success: function (res) {
								}
							});
						}
						// 请求成功，数据也正常
						resolve(res.data as unknown as T)
					} else {
						// 如果1000则跳转登录页面
						if ((res.data as any).status === 1000) {
							uni.redirectTo({
								url: routes.login.path
							})
							uni.removeStorageSync("token")
							uni.removeStorageSync("userInfo")
						}
						// 请求成功，数据不正常
						// uni.showToast({
						// 	icon: "none",
						// 	title: (res.data as any).msg,
						// 	duration: 3000,
						// })
						uni.showModal({
							title: '异常',
							content: (res.data as any).msg,
							success: function (res) {
							}
						});
						reject(res)
					}
				} else {
					// 请求失败
					// uni.showToast({
					// 	icon: "none",
					// 	title: res.data ? (res.data as any).msg : (res as any).errMsg,
					// 	duration: 3000,
					// })
					uni.showModal({
						title: '异常',
						content: res.data ? (res.data as any).msg : (res as any).errMsg,
						success: function (res) {
						}
					});
					reject(res)
				}
			}
			config.fail = (err) => {
				console.log("请求返回err：", err)
				// uni.showToast({
				// 	icon: "none",
				// 	title: err.errMsg,
				// 	duration: 3000,
				// })
				uni.showModal({
					title: '异常',
					content: err.errMsg,
					success: function (res) {
					}
				});
				reject(err)
			}
			console.log("请求配置：", config)
			uni.request(config)
		})
	}
}