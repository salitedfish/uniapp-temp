import { versionCheck as versionCheckApi } from "@/api/app"
import { getBaseUrl } from "@/util/common"

// app版本检查并提示
export const useVersionCheck = (p : { title ?: string, content ?: string, canceltext ?: string, oktext ?: string }) => {
	const param = Object.assign({
		title: "检测到有新版本！",
		content: "请升级app到最新版本！",
		canceltext: "暂不升级",
		oktext: "立即升级"
	}, p)

	plus.runtime.getProperty(plus.runtime.appid as string, async (widgetInfo) => {
		// 先请求版本看是否需要更新
		const res = await versionCheckApi()
		if (res.data) {
			// 如果一样就不需要更新
			if (widgetInfo.versionCode === res.data.versionCode) {
				return;
			}
			// 否则就提示是否更新
			if (res.status == 200) {
				// android进行如下操作
				uni.showModal({
					title: param.title,
					content: param.content,
					showCancel: true,
					confirmText: param.oktext,
					cancelText: param.canceltext,
					success: result => {
						// 如果点了确认就开始更新
						if (result.confirm) {
							startUpdate(res.data.versionUrl)
							// plus.runtime.quit();
						}
					}
				})
			}
		}
	});

	const startUpdate = (versionUrl : string) => {
		const downloadUrl = getBaseUrl() + versionUrl
		const downloadOptions = {
			filename: "_downloads/"
		}
		// 创建下载任务
		var dtask = plus.downloader.createDownload(downloadUrl, downloadOptions,
			(downloadRes, status) => {
				// 下载完成
				if (status == 200) {
					// 开始安装
					plus.runtime.install(downloadRes.filename as string, { force: true },
						() => {
							// 进行重新启动;
							plus.runtime.restart();
						},
						(e) => {
							uni.showToast({
								title: '安装升级包失败:' + JSON.stringify(e),
								icon: 'none'
							})
						})
				} else {
					uni.showToast({
						title: "下载升级包失败: " + status,
						icon: 'none'
					})
				}
			});

		if (plus.nativeObj.View && plus.screen.resolutionWidth) {
			const view = new plus.nativeObj.View("maskView", {
				backgroundColor: "rgba(0,0,0,.6)",
				left: ((plus.screen.resolutionWidth / 2) - 45) + "px",
				bottom: "80px",
				width: "90px",
				height: "30px"
			})
			view.drawText('开始下载', {}, {
				size: '12px',
				color: '#FFFFFF'
			});
			view.show()

			dtask.addEventListener("statechanged", (e) => {
				if (e && e.downloadedSize && e.totalSize) {
					if (e.downloadedSize > 0) {
						const jindu = ((e.downloadedSize / e.totalSize) * 100).toFixed(2)
						view.reset();
						view.drawText('进度:' + jindu + '%', {}, {
							size: '12px',
							color: '#FFFFFF'
						});
					}
				}
			}, false);

			// 开始下载
			dtask.start();
		}
	}
}
// let platform = plus.os.name.toLocaleLowerCase()

// if (platform == 'ios') {
// 	// 如果是ios,则跳转到appstore
// 	plus.runtime.openURL(result.data.data.url)
// 	return;
// }