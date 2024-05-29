import { wxGetUser, wxSignature } from "@/api/wx"
import { initPage } from "@/util/initPage"
import { setUserInfo } from "@/store/auth"
import { routes } from "@/store/route"
// import { useGenUrlParams } from "@ultra-man/noa"
// @ts-ignore
import wx from "weixin-js-sdk"

const useGenUrlParams = (url : string) : Obj => {
	const paramsStr = url.split("?")[1];
	if (paramsStr) {
		const paramsObj : Obj = {};
		const paramsArr = paramsStr.split("&");
		for (const item of paramsArr) {
			const [key, value] = item.split("=");
			paramsObj[key] = value;
		}
		return paramsObj;
	} else {
		return {};
	}
};

// 初始化微信内嵌H5
export const initInWX = async () => {
	uni.showLoading({
		title: "微信初始化中",
		mask: true
	})

	// @ts-ignore
	window.wx = wx

	const code = useGenUrlParams(window.location.href).code;

	// 如果没有code则需要先授权
	if (!code) {
		const ree = await wxSignature({
			url: window.location.href
		})
		const rootPath = import.meta.env.VITE_BASE_PAGE_PATH_WEB ? `/${import.meta.env.VITE_BASE_PAGE_PATH_WEB}` : ""
		window.location.replace(
			`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ree.data.appID
			}&redirect_uri=${encodeURI(
				window.location.host + `${rootPath}/${routes.home.path}`
			)}&response_type=code&scope=snsapi_base&state=#wechat_redirect`
		);
		// 用户授权后会跳到redirect_uri/?code=CODE&state=STATE
	}
	// 如果有则通过code获取用户token
	else {
		const reb = await wxGetUser({
			code,
		});
		// 获取token成功
		uni.setStorageSync("token", reb.data)
		// 获取用户信息
		await setUserInfo()
		// 初始化页面
		initPage()
		uni.hideLoading()
	}
}

// 每次网址变化，微信sdk都必须重新config
export const setWxConfig = async (data : Obj) => {
	const ree = await wxSignature({
		url: data.url || window.location.href
	});
	wx.config({
		// beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
		debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		appId: ree.data.appID || "", // 必填，企业微信的corpID
		timestamp: ree.data.timeStamp || "", // 必填，生成签名的时间戳
		nonceStr: ree.data.nonceStr || "", // 必填，生成签名的随机串
		signature: ree.data.signature || "", // 必填，签名，见 附录-JS-SDK使用权限签名算法
		jsApiList: ["scanQRCode", "getLocation"] // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
	});
	return ree
}