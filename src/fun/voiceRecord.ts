import { Platform } from "@/util/env"

export class VoiceRecord {

	public static start() {
		return new Promise((resolve, reject) => {
			// dingding
			if (Platform.isInDD()) {
				dingding.device.audio.startRecord({
					maxDuration: 90,
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

	public static stop() {
		return new Promise((resolve, reject) => {
			// dingding
			if (Platform.isInDD()) {
				dingding.device.audio.stopRecord({
					onSuccess: function (res : { mediaId : string, duration : number }) {
						resolve(res)
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
}