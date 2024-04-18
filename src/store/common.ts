import {
	useTimeFormat
} from "@ultra-man/noa"

const format = useTimeFormat("{YYYY}-{MM}-{dd}")
const format1 = useTimeFormat("{YYYY}{MM}{dd}")

export let nowFormat = ""
export let nextDayFormat = ""
export let preMonthFormat = ""

export let batchFormat = ""

export const updateAllDate = () => {
	nowFormat = format(Date.now()).format
	nextDayFormat = format(Date.now() + 24 * 60 * 60 * 1000).format
	preMonthFormat = format(Date.now() - 24 * 60 * 60 * 1000 * 30).format
	batchFormat = format1(Date.now()).format
}