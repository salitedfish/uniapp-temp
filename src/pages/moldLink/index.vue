<script lang="ts" setup>
	import { computed } from "vue"
	import { ScanCode } from "@/fun/scanCode"
	import { AudioService } from "@/fun/audioService"
	import { VoiceRecord } from "@/fun/voiceRecord"
	import { token } from "@/store/auth"
	import { Platform } from "@/util/env"
	import { routes } from "@/store/route"
	import { IframeAction, IframeActionResult } from "@/type/iframe"
	import { useCloseApp } from "@/hook/useCloseApp"
	import { useGenParamsUrl } from "@ultra-man/noa"

	const linkOrigin = routes.moldLink.linkOrigin

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
			const res = await AudioService.play({ localAudioId })
			moldLinkWindow.window.postMessage(res, linkOrigin);
			// 成功播放则开始监听播放结束事件
			try {
				await AudioService.playEnd()
			} catch {
			} finally {
				moldLinkWindow.window.postMessage(IframeActionResult.AUDIO_PLAY_END, linkOrigin);
			}
		} catch (err) {
			moldLinkWindow.window.postMessage("", linkOrigin);
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
	window.addEventListener("message", async (e : { origin : string, data : string }) => {
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
			// 目标地址的其他操作
			// ...
		}
	})

	// 外链全路径包括传参
	const url = computed(() => {
		return useGenParamsUrl(routes.moldLink.linkUrl as string)({
			inIframe: "true",
			token: token.value
		})
	})
</script>

<template>
	<iframe v-if="token" name="moldLinkWindow" :src="url" class="iframe-box"
		:class="{'ios-dd-iframe-box': Platform.isIosWeb() && Platform.isInDD()}"></iframe>
</template>

<style scoped>
	.iframe-box {
		width: 100vw;
		height: calc(100vh - 60px);
		border: none;
	}

	.ios-dd-iframe-box {
		padding-top: 40px;
	}
</style>