<script lang="ts" setup>
	import { computed, onActivated } from "vue"
	import { ScanCode } from "@/fun/scanCode"
	import { AudioService } from "@/fun/audioService"
	import { VoiceRecord } from "@/fun/voiceRecord"
	import { token } from "@/store/auth"
	import { Platform } from "@/util/env"
	import { routes } from "@/store/route"
	import { IframeAction, IframeActionResult } from "@/type/iframe"
	import { useCloseApp } from "@/hook/useCloseApp"
	import { useGenParamsUrl } from "@ultra-man/noa"

	// #ifdef H5
	const linkOrigin = import.meta.env.VITE_MOLD_LINK_ORIGIN

	const initScan = async () => {
		const res = await ScanCode.run() as string
		// 向子页面传递数据
		moldLinkWindow.window.postMessage(res, linkOrigin);
	}

	const audioDownload = async (mediaId : string) => {
		try {
			const ree = await AudioService.download({ mediaId })
			moldLinkWindow.window.postMessage(ree, linkOrigin);
		} catch (errs) {
			moldLinkWindow.window.postMessage("", linkOrigin);
		}
	}

	const audioPlay = async (localAudioId : string) => {
		try {
			await AudioService.play({ localAudioId })
			moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_PLAY_SUCCESS, linkOrigin);
			// 成功播放则开始监听播放结束事件
			try {
				await AudioService.playEnd()
			} catch {
			} finally {
				moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_PLAY_END, linkOrigin);
			}
		}
		// 播放失败
		catch (err) {
			moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_PLAY_FAIL, linkOrigin);
		}
	}

	const audioStop = async (localAudioId : string) => {
		try {
			await AudioService.stop({ localAudioId })
			moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_STOP_SUCCESS, linkOrigin);
		} catch (err) {
			moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_STOP_FAIL, linkOrigin);
		}
	}

	const voiceRecordStart = async () => {
		try {
			await VoiceRecord.start()
			moldLinkWindow.window.postMessage(IframeActionResult.VIDEO_RECORD_START_SUCCESS, linkOrigin);
		} catch (err) {
			moldLinkWindow.window.postMessage(IframeActionResult.VIDEO_RECORD_START_FAIL, linkOrigin);
		}
	}

	const voiceRecordStop = async () => {
		try {
			const res = await VoiceRecord.stop()
			moldLinkWindow.window.postMessage(JSON.stringify(res), linkOrigin);
		} catch (err) {
			moldLinkWindow.window.postMessage(IframeActionResult.VIDEO_RECORD_STOP_FAIL, linkOrigin);
		}
	}

	// 父页面监听子页面的消息
	const trackMessage = () => {
		window.onmessage = async (e : { origin : string, data : string }) => {
			// 无论那个子页面派发message都会触发这个函数，所有需要通过子页面地址过滤出对应的页面操作
			console.log("收到：" + e.origin + "的message")
			if (e.origin === linkOrigin) {
				const res = JSON.parse(e.data)
				// 扫码操作
				if (res.action === IframeAction.SCAN_CODE) {
					initScan()
				}
				// 关闭应用操作
				if (res.action === IframeAction.CLOSE_APP) {
					useCloseApp()
				}
				// 下载音频操作
				if (res.action === IframeAction.AUDIO_DOWNLOAD) {
					audioDownload(res.mediaId)
				}
				// 播放音频操作
				if (res.action === IframeAction.AUDIO_PLAY) {
					audioPlay(res.localAudioId)
				}
				// 停止音频操作
				if (res.action === IframeAction.AUDIO_STOP) {
					audioStop(res.localAudioId)
				}
				// 开始录音
				if (res.action === IframeAction.VOICE_RECORD_START) {
					voiceRecordStart()
				}
				// 结束录音
				if (res.action === IframeAction.VOICE_RECORD_STOP) {
					voiceRecordStop()
				}
				// 跳转登陆页
				if (res.action === IframeAction.LOGIN_PAGE) {
					uni.redirectTo({
						url: routes.login.path
					})
					uni.removeStorageSync("token")
					uni.removeStorageSync("userInfo")
				}
				// 目标地址的其他操作
				// ...
			}
		}
	}
	trackMessage()
	console.log("展示工模页面")
	onActivated(() => {
		console.log("展示工模页面")
		trackMessage()
	})
	// #endif

	// 外链全路径包括传参
	const url = computed(() => {
		return useGenParamsUrl(import.meta.env.VITE_MOLD_LINK_URL as string)({
			inIframe: "true",
			token: token.value
		})
	})

	// 内嵌网页加载完毕触发，可以向内嵌网页发送消息
	const iframeOnload = () => {
		// moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_STOP_SUCCESS, linkOrigin);
	}
</script>

<template>
	<!-- 目前只能内嵌网页主动操作框架 -->
	<iframe v-if="token" name="moldLinkWindow" :src="url" :onload="iframeOnload" class="iframe-box" :class="{
			'ios-dd-iframe-box': Platform.isIosWeb() && Platform.isInDD(), 
			'ad-app-iframe-box': Platform.isApp()
			}"></iframe>
</template>

<style scoped>
	.iframe-box {
		width: 100vw;
		height: calc(100vh - 60px);
		border: none;
	}

	/* 当外层框架打包成安卓app的时候 */
	.ad-app-iframe-box {
		padding-top: 40px;
		height: calc(100vh)
	}

	/* 当在ios钉钉端运行 */
	.ios-dd-iframe-box {
		padding-top: 40px;
	}
</style>