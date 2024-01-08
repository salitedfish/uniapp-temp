import {
	useTimeFormat
} from "@ultra-man/noa"

const format = useTimeFormat("{YYYY}-{MM}-{dd}")
const format1 = useTimeFormat("{YYYY}{MM}{dd}")

export const nowFormat = format(Date.now()).format

export const batchFormat = format1(Date.now()).format