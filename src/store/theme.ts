import { reactive, ref } from "vue"


// 全局色值变量，基本复制uview-plus的色值
export const globalColor = ref({
	border: "#dadbde",
	default: "#909399",
	default_background: "rgba(245,245,245,0.8)",
	info: "#909399",
	primary: "#549df8",
	primary_background: "rgba(84, 157, 248, 0.1)",
	success: "#5ac725",
	fail: "#d81e06",
	error: "#d81e06",
	warning: "#ff9900",
})