import { initPage } from "@/util/initPage"
import { setUserInfo, setToken } from "@/store/auth"
import { ddQuery, ddSignature, ddGetUser, ddGetUserByPhone } from "@/api/dd"
import { getInfo } from "@/api/yinlun"
import { Platform } from "./env"
// @ts-ignore
import * as dd from "dingtalk-jsapi";

// 初始化钉钉微应用
export const initInDD = async () => {
	uni.showLoading({
		title: "初始化中",
		mask: true
	})

	// 隐藏dd自带的navbar
	dd.biz.navigation.hideBar({
		hidden: true,
	});

	// @ts-ignore
	window.dd = dd
	// 获取corpId
	const res = await ddQuery();
	if (!res.data.corpId) {
		uni.showToast({
			title: "请在PC端配置corpId"
		})
		uni.hideLoading()
		return
	}

	dd.ready(async () => {
		// dd请求数据
		dd.runtime.permission.requestAuthCode({
			corpId: res.data.corpId,
			// @ts-ignore
			onSuccess: async (ret : Obj) => {
				const code = ret.code
				if (code) {
					try {
						// 如果是内部公司
						if (Platform.isInterCompany()) {
							const reb = await ddGetUser({
								code
							})
							// 获取token成功
							setToken(reb.data as unknown as string)
						}
						// 如果是外部公司
						else {
							// jsonp获取用户手机号
							const params = { authCode: code };
							const res = await getInfo(params);
							// 再获取用户信息
							if (res.errcode === "0") {
								const { mobile: phone } = res;
								const ret = await ddGetUserByPhone({
									phone,
								});
								// 获取token成功
								setToken(ret.data as unknown as string)
							} else {
								uni.showModal({
									title: '提示',
									content: res.message,
								});
							}
						}
					} catch (err) {
						uni.showModal({
							content: JSON.stringify(err)
						})
					} finally {
						// 初始化页面
						initPage()
						uni.hideLoading()
					}
				}
			},
			onFail: (err : Obj) => {
				uni.showToast({
					title: JSON.stringify(err)
				})
				uni.hideLoading()
			}
		})


		// dd权限配置
		const ree = await ddSignature({
			url: window.location.href
		})
		dd.config({
			// 微应用ID
			agentId: ree.data.agentId,
			// agentId: 3125119952,
			// 企业ID
			corpId: ree.data.corpId,
			// corpId: ree.data.corpId,
			// 生成签名的时间戳
			timeStamp: ree.data.timeStamp,
			// 生成签名的随机串
			nonceStr: ree.data.nonceStr,
			// 签名
			signature: ree.data.signature,
			// 需要使用的jsapi列表，注意：不要带dd。
			jsApiList: [
				"device.geolocation.get",
				"device.audio.startRecord",
				"device.audio.stopRecord",
				"device.audio.play",
				"device.audio.stop",
				"device.audio.onPlayEnd",
				"device.audio.download"
			]
		});
	});

	dd.error(() => {
		uni.hideLoading()
		uni.showToast({
			title: "初始化失败",
			icon: "none"
		})
	})
}