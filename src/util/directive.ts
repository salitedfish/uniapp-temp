import type { App } from "vue"

export default function (app : App) {
	app.directive('max', {
		mounted(el : any, binding : any) {
			console.log(el)
			console.log(binding)
			el.addEventListener('click', () => {
				console.log(el.value)
				if (el.value > binding.value) {
					el.value = binding.value
				}
			})
		}
	})
}