import { ref } from "vue"
import {
	useTimeFormat
} from "@ultra-man/noa"
import { Platform } from "@/util/env"

const format = useTimeFormat("{YYYY}-{MM}-{dd}")
const format1 = useTimeFormat("{YYYY}{MM}{dd}")
const format2 = useTimeFormat("{YY}{MM}{dd}")

export let nowFormat = ""
export let nowFormat1 = ""
export let nextDayFormat = ""
export let preMonthFormat = ""
export let preWeekFormat = ""

export let batchFormat = ""

export const updateAllDate = () => {
	nowFormat = format(Date.now()).format
	nowFormat1 = format2(Date.now()).format
	nextDayFormat = format(Date.now() + 24 * 60 * 60 * 1000).format
	preMonthFormat = format(Date.now() - 24 * 60 * 60 * 1000 * 30).format
	preWeekFormat = format(Date.now() - 24 * 60 * 60 * 1000 * 7).format

	batchFormat = format1(Date.now()).format
}

export const appVersion = ref("")
if (Platform.isApp()) {
	plus.runtime.getProperty(plus.runtime.appid as string, async (widgetInfo) => {
		appVersion.value = widgetInfo.versionCode || ""
	});
}