export enum IframeAction {
	SCAN_CODE = "scanCode",
	CLOSE_APP = "closeApp",

	AUDIO_DOWNLOAD = "audioDownload",
	AUDIO_PLAY = "audioPlay",
	AUDIO_STOP = "audioStop",

	VOICE_RECORD_START = "voiceRecordStart",
	VOICE_RECORD_STOP = "voiceRecordStop",

	// 页面跳转
	LOGIN_PAGE = "loginPage"
}

export enum IframeActionResult {
	AUDIO_PLAY_SUCCESS = "audioPlaySuccess",
	AUDIO_PLAY_FAIL = "audioPlayFail",

	AUDIO_PLAY_END = "audioPlayEnd",

	AUDIO_STOP_SUCCESS = "audioStopSuccess",
	AUDIO_STOP_FAIL = "audioStopFail",

	VIDEO_RECORD_START_SUCCESS = "voiceRecordStartSuccess",
	VIDEO_RECORD_START_FAIL = "voiceRecordStartFail",

	VIDEO_RECORD_STOP_FAIL = "voiceRecordStopFail"
}