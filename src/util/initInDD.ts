import { initPage } from "@/util/initPage"
import { setUserInfo } from "@/store/auth"
import { ddQuery, ddSignature, ddGetUser } from "@/api/dd"
import * as dd from "dingtalk-jsapi";

// 初始化钉钉微应用
export const initInDD = () => {
	uni.showLoading({
		title: "钉钉初始化中",
		mask: true
	})

	// @ts-ignore
	window.dd = dd

	dd.ready(async () => {
		// 获取corpId
		const res = await ddQuery();
		if (!res.data.corpId) {
			uni.showToast({
				title: "请在PC端配置corpId"
			})
			return
		}

		// dd权限配置
		const ree = await ddSignature({
			url: window.location.href
		})
		dd.config({
			// 微应用ID
			agentId: ree.data.agentId,
			// 企业ID
			corpId: ree.data.corpId,
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

		// dd请求数据
		dd.runtime.permission.requestAuthCode({
			corpId: res.data.corpId,
			// @ts-ignore
			onSuccess: async (ret : Obj) => {
				if (ret.code) {
					const reb = await ddGetUser({
						loginSource: "DD",
						code: ret.code
					})
					// 获取token成功
					uni.setStorageSync("token", reb.data)
					// 获取用户信息
					await setUserInfo()
					// 初始化页面
					initPage()
					uni.hideLoading()
				}
			},
			// @ts-ignore
			onFail: (err : Obj) => {
				uni.showToast({
					title: JSON.stringify(err.errorMessage)
				})
				uni.hideLoading()
			}
		})

	});
	dd.error(() => {
		uni.hideLoading()
		uni.showToast({
			title: "钉钉初始化异常",
			icon: "none"
		})
	})
}