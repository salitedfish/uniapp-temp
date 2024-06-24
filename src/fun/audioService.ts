import { Platform } from "@/util/env"

// 音频服务
export class AudioService {

	public static download(params : { mediaId : string }) {
		return new Promise((resolve, reject) => {
			// dingding
			if (Platform.isInDD()) {
				dingding.device.audio.download({
					mediaId: params.mediaId,
					onSuccess: function (res : { localAudioId : string }) {
						res.localAudioId;
						resolve(res.localAudioId)
					},
					onFail: function (err : any) {
						reject(err)
					}
				});
			}
			// 其他
			else {
				reject()
			}
		})
	}

	public static play(params : { localAudioId : string }) {
		return new Promise((resolve, reject) => {
			// dingding
			if (Platform.isInDD()) {
				dingding.device.audio.play({
					localAudioId: params.localAudioId,
					onSuccess: function () {
						resolve(true)
					},
					onFail: function (err) {
						reject()
					}
				});
			}
			// 其他
			else {
				reject()
			}
		})
	}

	public static playEnd() {
		return new Promise((resolve, reject) => {
			// dingding
			if (Platform.isInDD()) {
				dingding.device.audio.onPlayEnd({
					onSuccess: function () {
						resolve(true)
					},
					onFail: function () {
						reject()
					}
				});
			}
			// 其他
			else {
				reject()
			}
		})
	}

	public static stop(params : { localAudioId : string }) {
		return new Promise((resolve, reject) => {
			// dingding
			if (Platform.isInDD()) {
				dingding.device.audio.stop({
					localAudioId: params.localAudioId,
					onSuccess: function () {
						resolve(true)
					},
					onFail: function (err) {
						reject()
					}
				});
			}
			// 其他
			else {
				reject()
			}
		})
	}
}