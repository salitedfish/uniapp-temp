import { reactive } from "vue"

export const customModalStore = reactive({
	exist: false,
	visiable: false,
	title: "",
	content: "",
	success: undefined as undefined | Function,
	cancel: undefined as undefined | Function
})

export const setCustomModal = (config : {
	title ?: string,
	visiable : boolean,
	content : string,
	success ?: Function,
	cancel ?: Function
}) => {
	customModalStore.title = config.title || "提示"
	customModalStore.visiable = config.visiable
	customModalStore.content = config.content
	customModalStore.success = config.success
	customModalStore.cancel = config.cancel
}