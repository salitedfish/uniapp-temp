
// 生成请求头
export const genHeader = () => {
	return {
		token: uni.getStorageSync("token"),
		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
	}
}

// 封装请求
export class URequest {

	// 基础配置
	constructor(private baseConfig : { baseUrl : string }) { }

	public async get<T>(config : UniApp.RequestOptions) {
		config.method = 'GET'
		return await this.request<T>(config)
	}

	public async post<T>(config : UniApp.RequestOptions) {
		config.method = 'POST'
		return await this.request<T>(config)
	}

	public async put<T>(config : UniApp.RequestOptions) {
		config.method = 'PUT'
		return await this.request<T>(config)
	}

	public async delete<T>(config : UniApp.RequestOptions) {
		config.method = 'DELETE'
		return await this.request<T>(config)
	}

	private async request<T>(config : UniApp.RequestOptions) {
		// 请求拦截
		if (!config.header) {
			config.header = genHeader()
		}
		// config.withCredentials = true          
		config.url = this.baseConfig.baseUrl + config.url

		return new Promise<T>((resolve, reject) => {
			// 响应拦截器
			config.success = (res) => {
				console.log("请求返回res：", res)
				if (res.statusCode === 200) {
					// 请求成功
					if ((res.data as any).status === 200) {
						// 请求成功，数据也正常
						resolve(res.data as unknown as T)
					} else {
						// 请求成功，数据不正常
						uni.showToast({
							icon: "none",
							title: (res.data as any).msg,
						})
						reject()
					}
				} else {
					// 请求失败
					uni.showToast({
						icon: "none",
						title: (res as any).errMsg,
					})
					reject()
				}
			}
			config.fail = (err) => {
				console.log("请求返回err：", err)
				uni.showToast({
					icon: "none",
					title: err.errMsg
				})
				reject()
			}
			console.log("请求配置：", config)
			uni.request(config)
		})
	}
}