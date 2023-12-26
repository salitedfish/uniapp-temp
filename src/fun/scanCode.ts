import { Platform } from "@/util/env"
import { Html5Qrcode } from "html5-qrcode"

interface FunConfig { container : string }

// 扫码，根据当前环境自动选择调用的方法
export class ScanCode {
	// 这个是专门给h5用的
	private static html5Qrcode : Html5Qrcode
	// 运行入口
	static async run(runConfig : FunConfig) {
		if (Platform.isApp()) {
			return await ScanCode.appRun(runConfig)
		} else if (Platform.isWeb()) {
			return await ScanCode.webRun(runConfig)
		} else {
			uni.showToast({
				icon: "none",
				title: "当前环境不支持"
			})
			return ""
		}
	}
	// app端
	private static async appRun(runConfig : FunConfig) {
		return new Promise((resolve, reject) => {
			uni.scanCode({
				autoDecodeCharset: true,
				success(res) {
					resolve(res.result)
				},
				fail(err) {
					reject(err)
				}
			})
		})
	}
	// web端
	private static async webRun(runConfig : FunConfig) {
		return new Promise((resolve, reject) => {
			// 先查看摄像头权限
			Html5Qrcode.getCameras().then(() => {
				// 有则开启摄像头
				if (!ScanCode.html5Qrcode) {
					ScanCode.html5Qrcode = new Html5Qrcode(runConfig.container);
				}
				const config = {
					fps: 5,
					qrbox: { width: 250, height: 250 },
					aspectRatio: window.innerHeight / window.innerWidth,
				};
				// 成功回调
				const qrCodeSuccessCallback = (decodedText : string, decodedResult : unknown) => {
					ScanCode.html5Qrcode.stop()
					resolve(decodedText)
				};
				// 失败回调
				const qrCodeFailCallback = (err : unknown) => {
					ScanCode.html5Qrcode.stop()
					reject(err)
				}
				ScanCode.html5Qrcode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined).catch(qrCodeFailCallback)

			}).catch(() => {
				uni.showToast({
					icon: "none",
					title: "无摄像头权限"
				})
				reject()
			})
		})
	}
	// 停止
	public static async stop() {
		if (ScanCode.html5Qrcode) {
			ScanCode.html5Qrcode.stop()
		}
	}
}