<template>
	<button @click="print.initPrint" type="primary">打印</button>

	<!-- 下面数据提供给renderjs使用(renderjs有很多限制，没办法才用这种方式传值) -->
	<view class="printPage_width" style="display: none">
		{{ printPage.width }}
	</view>
	<view class="printPage_height" style="display: none">
		{{ printPage.height }}
	</view>
	<view class="printPage_gap" style="display: none">
		{{ printPage.gap }}
	</view>
	<view class="printPage_QRCodeLevel" style="display: none">
		{{ printPage.QRCodeLevel }}
	</view>
	<view class="printPage_QRCodeLeftOffset" style="display: none">
		{{ printPage.QRCodeLeftOffset }}
	</view>
	<view class="printPage_QRCodeTopOffset" style="display: none">
		{{ printPage.QRCodeTopOffset }}
	</view>
	<view class="printPage_textLeftOffset" style="display: none">
		{{ printPage.textLeftOffset }}
	</view>
	<view class="printPage_textTopOffset" style="display: none">
		{{ printPage.textTopOffset }}
	</view>
</template>

<script>
	import {
		printPage,
	} from "@/store/print"
	import {
		blueToothStore
	} from "@/store/blueTooth"
	import {
		Printer
	} from "@/fun/printer"

	export default {
		props: ["printData"],
		data() {
			return {
				// 页面根据实际情况设置打印纸宽、高、间隙
				printPage,
			}
		},
		methods: {
			startPrint(tsplTemplate) {
				// 获取打印机并设置相关参数
				const printer = new Printer()
				printer.setPrinterParams(blueToothStore)

				console.log(`最终打印指令：
${tsplTemplate}
				`)

				// 开始打印
				printer.print([tsplTemplate])
			},
			err(msg) {
				uni.showToast({
					icon: "none",
					title: msg,
				})
			},
		},
	}
</script>

<script module="print" lang="renderjs">
	import {
		textOptions,
		customTextOptions,
		qrcodeOptions
	} from "../store/print"

	const mmToDot = (mm) => {
		return mm * 8
	}
	export default {
		methods: {
			// 开始打印
			initPrint() {
				const printPage = this.genPrintPage()

				// 构建tspl模版
				const tsplTemplate = this.genTSPL(printPage);
				if (!tsplTemplate) {
					return
				}

				if (tsplTemplate) {
					// 调用普通script层并传递模版
					this.$ownerInstance.callMethod('startPrint', tsplTemplate)
				}
			},
			// 获取打印纸设置(renderjs有很多限制，没办法才用这种方式传值)
			genPrintPage() {
				const w = document.getElementsByClassName("printPage_width")[0].innerText
				const h = document.getElementsByClassName("printPage_height")[0].innerText
				const g = document.getElementsByClassName("printPage_gap")[0].innerText
				const qrl = document.getElementsByClassName("printPage_QRCodeLevel")[0].innerText
				const qrlo = document.getElementsByClassName("printPage_QRCodeLeftOffset")[0].innerText
				const qrto = document.getElementsByClassName("printPage_QRCodeTopOffset")[0].innerText
				const tlo = document.getElementsByClassName("printPage_textLeftOffset")[0].innerText
				const tto = document.getElementsByClassName("printPage_textTopOffset")[0].innerText
				const printPage = {
					width: w,
					height: h,
					gap: g,
					QRCodeLevel: qrl,
					QRCodeLeftOffset: qrlo,
					QRCodeTopOffset: qrto,
					textLeftOffset: tlo,
					textTopOffset: tto
				}
				return printPage
			},
			// 构建tspl模版
			genTSPL(printPage) {
				// 获取标签要打印的根节点, 获取打印纸的长和宽
				// 这里的html-template要根据实际情况修改
				const rootDom = document.getElementsByClassName("html-template")[0]
				if (!rootDom) {
					console.log('未获取到打印区域节点')
					return
				}
				const rootWidth = rootDom.style.cssText.split(" ")[1].slice(0, -3)
				const rootHeight = rootDom.style.cssText.split(" ")[3].slice(0, -3)
				if (!rootWidth || !rootHeight || isNaN(Number(rootWidth)) || isNaN(Number(rootHeight))) {
					this.$ownerInstance.callMethod('err', '打印纸长宽获取失败')
					return
				}
				// 获取页面上标签的widthpx值
				const width = window.getComputedStyle(rootDom).getPropertyValue("width").slice(0, -2)

				// 设置tspl指令
				const pageWidth = printPage.width ? printPage.width : rootWidth * 10
				const pageHeight = printPage.height ? printPage.height : rootHeight * 10
				const pageGap = printPage.gap ? printPage.gap : 0
				let command = `SIZE ${pageWidth} mm, ${pageHeight} mm\n GAP ${pageGap} mm, 0 mm\n DIRECTION 0\n CLS\n `

				// 计算毫米和px的比值
				const ratio = pageWidth / width

				// 文本节点
				for (const item of textOptions) {
					const optionDom = document.getElementsByClassName(`template-${item}`)
					if (optionDom.length > 0) {
						const currentDom = optionDom[0].childNodes[0].childNodes[0]
						// const { left, top } = this.genPosition(currentDom, rootDom)
						const left = optionDom[0].style.getPropertyValue("left").slice(0, -2)
						const top = optionDom[0].style.getPropertyValue("top").slice(0, -2)
						const leftDots = Math.round(mmToDot(left * ratio - Number(printPage.textLeftOffset)))
						const topDots = Math.round(mmToDot(top * ratio - Number(printPage.textTopOffset)))
						command = command + `TEXT ${leftDots},${topDots},"TSS24.BF2",0,1,1,"${currentDom.innerText}"\n `
					}
				}

				// 二维码节点
				for (const item of qrcodeOptions) {
					const optionDom = document.getElementsByClassName(`template-${item}`)
					if (optionDom.length > 0) {
						const currentDom = optionDom[0].childNodes[0].childNodes[0]
						// const { left, top } = this.genPosition(currentDom, rootDom)
						const left = optionDom[0].style.getPropertyValue("left").slice(0, -2)
						const top = optionDom[0].style.getPropertyValue("top").slice(0, -2)
						const w = window.getComputedStyle(optionDom[0]).getPropertyValue("width").slice(0, -2)
						const leftDots = Math.round(mmToDot(left * ratio - Number(printPage.QRCodeLeftOffset)))
						const topDots = Math.round(mmToDot(top * ratio - Number(printPage.QRCodeTopOffset)))
						const sizeLevel = Number(printPage.QRCodeLevel) ? Number(printPage.QRCodeLevel) : this
							.genQRCodeSizeLevel(w, ratio)
						const content = currentDom.getAttribute('data-shortUrl')
						command = command + `QRCODE ${leftDots},${topDots},L,${sizeLevel},A,0,"${content}"\n `
					}
				}

				// 条形码
				// todo。。。

				// 自定义文本节点
				for (const item of customTextOptions) {
					const optionDom = document.getElementsByClassName(`template-${item}`)
					if (optionDom.length > 0) {
						const currentDom = optionDom[0].childNodes[0].childNodes[0]
						// const { left, top } = this.genPosition(currentDom, rootDom
						const left = optionDom[0].style.getPropertyValue("left").slice(0, -2)
						const top = optionDom[0].style.getPropertyValue("top").slice(0, -2)
						const leftDots = Math.round(mmToDot(left * ratio - Number(printPage.textLeftOffset)))
						const topDots = Math.round(mmToDot(top * ratio - Number(printPage.textTopOffset)))
						command = command + `TEXT ${leftDots},${topDots},"TSS24.BF2",0,1,1,"${currentDom.innerText}"\n `
					}
				}

				command = command + `PRINT 1\n `

				return command
			},
			// 生成二维码的大小等级
			genQRCodeSizeLevel(w, ratio) {
				const size = w * ratio
				const level = 1 + Math.floor(size / 5)
				return level >= 10 ? 10 : level
			}
		}
	}
</script>

<style lang="less">
	.button-box {
		display: flex;

		button {
			font-size: 28rpx;
		}
	}
</style>