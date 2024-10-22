import type { App } from "vue"

import CustomModal from "@/components/CustomModal.vue"
import CustomNavBar from "@/components/CustomNavBar.vue"

/**
 * 因为pages.json那边定义了以u-，u--，up-，uni-开头的组件的寻找地址，所以自定义全局组件不能以这些开头
 * 之前有些自定义组件也以up开头的不管了
 */
export default (app : App) => {
	app.component("CustomModal", CustomModal)
	app.component("CustomNavBar", CustomNavBar)
}