<script setup lang="ts">
	import { ref, watch, nextTick } from "vue"
	import { keyToLabel } from "../store/print"
	import uqrcode from "./Sansnn-uQRCode/components/uqrcode/uqrcode.vue"

	// 传递模版和替换的数据
	const props = withDefaults(defineProps<{
		tempData : any
		tempStr : string
	}>(), {
		tempData: {},
		tempStr: ""
	})

	const qrcodeRef = ref(null)
	const renderStr = ref("")

	// 监听传参改变时，更改渲染的数据
	watch([() => props.tempData, () => props.tempStr], () => {
		uni.showLoading({
			title: "生成中..."
		})
		if (props.tempData && props.tempStr) {
			setPrint()
		}
	})

	// 设置渲染模版
	const setPrint = () => {
		let originContent = props.tempStr

		// 字符串根据关键字循环替换值
		let key : keyof typeof keyToLabel
		for (key in keyToLabel) {
			const label = keyToLabel[key]
			const value = props.tempData[key]
			originContent = originContent.replace(label, value)
		}

		// 如果有shortUrl则要做一系列操作后再赋值
		if (props.tempData && props.tempData.shortUrl) {
			const url = props.tempData.shortUrl
			// 等二维码渲染完之后再去获取二维码图片路径
			nextTick(() => {
				if (qrcodeRef.value) {
					// @ts-ignore
					qrcodeRef.value.toTempFilePath({
						success: (res : any) => {
							// 这个在h5端无效，只在app端有效
							const urlTemplate = `file://${plus.io.convertLocalFileSystemURL(
								res.tempFilePath
							)}`
							// 将原字符串中的二维码base64替换成，生成的二维码文件路径
							originContent = originContent.replace(
								/src="data:image\/png;base64[^"]*/,
								`data-shortUrl="${url}" src="${urlTemplate}"`
							)
							// 再赋值给要渲染的模版字符串
							renderStr.value = originContent
						},
						complete: (res : any) => {
							console.log(res)
							uni.hideLoading()
						},
						fail: (res : any) => {
							uni.showToast({
								icon: "none",
								title: res,
							})
						},
					})
				}
			})
		} else {
			renderStr.value = originContent
			uni.hideLoading()
		}
	}
</script>

<template>
	<uqrcode ref="qrcodeRef" canvas-id="qrcode" v-if="props.tempData && props.tempData.shortUrl"
		:value="props.tempData.shortUrl" :options="{ margin: 10 }" style="position: fixed; left: -9999px"></uqrcode>

	<view v-html="renderStr" class="template"></view>
</template>

<style lang="scss">
</style>