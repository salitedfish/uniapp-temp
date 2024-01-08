import { wechatSignature } from "@/api/weChat"

// 
export const setWxConfig = async (config : { url : string }) => {
	// 每次网址变化，微信sdk都必须重新config
	const wxRes = await wechatSignature({
		isShowLoading: true,
		url: window.location.origin + "/#" + config.url
	});
	jWeixin.config({
		beta: true, // 必须这么写，否则wx.invoke调用形式的jsapi会有问题
		debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		appId: wxRes.data.appID || "", // 必填，企业微信的corpID
		timestamp: wxRes.data.timeStamp || "", // 必填，生成签名的时间戳
		nonceStr: wxRes.data.nonceStr || "", // 必填，生成签名的随机串
		signature: wxRes.data.signature || "", // 必填，签名，见 附录-JS-SDK使用权限签名算法
		jsApiList: ["scanCode"] // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
	});
}