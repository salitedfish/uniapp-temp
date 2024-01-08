<script setup lang="ts">
	import { ref, watch, onMounted } from "vue"
	import { keyToLabel } from "@/store/print"
	import { genLocalFileUrl } from "@/util/common"

	// 传递模版和替换的数据
	const props = withDefaults(defineProps<{
		tempData : any
		tempStr : string
	}>(), {
		tempData: {},
		tempStr: ""
	})

	const qrcodeRef = ref(null)
	const barcodeRef = ref(null)
	const renderStr = ref("")
	// const refDoms = []

	// 初始化时如果数据完整也生成模版
	onMounted(() => {
		if (props.tempData && props.tempStr) {
			uni.showLoading({
				mask: true,
				title: "生成中..."
			})
			setPrint()
		}
	})
	// 监听传参改变时，更改渲染的数据
	watch([() => props.tempData, () => props.tempStr], () => {
		uni.showLoading({
			mask: true,
			title: "生成中..."
		})
		if (props.tempData && props.tempStr) {
			setPrint()
		}
	})

	// 设置渲染模版
	const setPrint = () => {
		if (!props.tempData || !props.tempStr) {
			uni.showToast({
				icon: "none",
				title: "模版数据获取异常"
			})
			return
		}
		let originContent = props.tempStr

		// 字符串根据关键字循环替换值
		let key : keyof typeof keyToLabel
		for (key in keyToLabel) {
			const label = keyToLabel[key]
			const value = props.tempData[key]
			originContent = originContent.replace(label, value)
		}

		// 如果有要渲染的复杂图像
		if (props.tempData.shortUrl || props.tempData.barShortUrl) {
			// 二维码
			if (props.tempData.shortUrl) {
				const url = props.tempData.shortUrl
				originContent = originContent.replace(
					/src="data:image\/png;base64/,
					`data-shortUrl="${url}" src="data:image/png;base64`
				)
				// 再赋值给要渲染的模版字符串
				renderStr.value = originContent
				uni.hideLoading()
				// 等二维码渲染完之后再去获取条形码图片路径
				// setTimeout(async () => {
				// 	if (qrcodeRef.value) {
				// 		try {
				// 			// @ts-ignore
				// 			const res = await qrcodeRef.value.GetCodeImg()
				// 			// app和web做兼容处理，web这里返回的是base64，app则是文件路径需要处理后使用
				// 			let urlTemplate = genLocalFileUrl(res.tempFilePath)
				// 			// // 将原字符串中的二维码base64替换成，生成的二维码文件路径
				// 			originContent = originContent.replace(
				// 				/src="data:image\/png;base64[^"]*/,
				// 				`data-shortUrl="${url}" src="${urlTemplate}"`
				// 			)
				// 			// 再赋值给要渲染的模版字符串
				// 			renderStr.value = originContent
				// 		} catch (err) {
				// 			uni.showToast({
				// 				icon: "none",
				// 				title: err as any,
				// 			})
				// 		} finally {
				// 			uni.hideLoading()
				// 		}
				// 	}
				// }, 1000)
			}

			// 条形码
			// if (props.tempData.barShortUrl) {
			// 	const url = props.tempData.barShortUrl
			// 	// 等条形码渲染完之后再去获取条形码图片路径
			// 	setTimeout(async () => {
			// 		if (barcodeRef.value) {
			// 			try {
			// 				// @ts-ignore
			// 				const res = await barcodeRef.value.GetCodeImg()
			// 				// app和web做兼容处理，web这里返回的是base64，app则是文件路径需要处理后使用
			// 				let urlTemplate = genLocalFileUrl(res.tempFilePath)
			// 				// // 将原字符串中的二维码base64替换成，生成的二维码文件路径
			// 				originContent = originContent.replace(
			// 					/src="data:image\/png;base64[^"]*/,
			// 					`data-barShortUrl="${url}" src="${urlTemplate}"`
			// 				)
			// 				// 再赋值给要渲染的模版字符串
			// 				renderStr.value = originContent
			// 			} catch (err) {
			// 				uni.showToast({
			// 					icon: "none",
			// 					title: err as any,
			// 				})
			// 			} finally {
			// 				uni.hideLoading()
			// 			}
			// 		}
			// 	}, 1000)
			// }
		} else {
			renderStr.value = originContent
			uni.hideLoading()
		}
	}
</script>



<template>
	<!-- 生成二维码 -->
	<!-- 	<w-qrcode ref="qrcodeRef" :options="{ code: props.tempData.shortUrl, size: 400}"
		v-if="props.tempData && props.tempData.shortUrl" style="position: fixed; left: -9999px"></w-qrcode> -->

	<!-- 生成条形码 -->
	<!-- 	<w-barcode ref="barcodeRef" :options="{ code: props.tempData.shortUrl, width: 400, height: 100}"
		v-if="props.tempData && props.tempData.barShortUrl" style="position: fixed; left: -9999px"></w-barcode> -->

	<!-- 渲染模版 -->
	<view v-html="renderStr" class="template"></view>
</template>

<style lang="scss" scoped>
	.template {
		position: relative;
		display: inline-block;
	}

	.html-template {
		position: relative;
	}
</style>