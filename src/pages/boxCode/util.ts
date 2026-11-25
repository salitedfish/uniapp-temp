import { Printer } from "@/fun/printer"
import { printPage } from "@/store/print"
import { blueToothStore } from "@/store/blueTooth"

/**
 * 生成箱码标签的 TSPL 指令：上面二维码，下面码值。
 * 纸张宽高取「蓝牙连接」页保存的 printPage，未配置时按 40×30mm 兜底。
 */
export const buildBoxQrTspl = (value : string) => {
	// 指令里的引号/换行会把 TSPL 截断，先清理掉
	const safe = value.replace(/"/g, "'").replace(/[\r\n]/g, " ")
	const width = Math.round(Number(printPage.value.width) || 40)
	const height = Math.round(Number(printPage.value.height) || 30)
	const gap = printPage.value.gap == null ? 3 : Number(printPage.value.gap)
	// 203dpi 打印机 1mm≈8点
	const w = width * 8
	const h = height * 8
	// 估算二维码模块数：短值 33×33，长值 41×41
	const modules = safe.length <= 60 ? 33 : 41
	const maxQrDots = Math.max(80, Math.min(w - 24, h - 60))
	const cell = Math.max(3, Math.min(10, Math.floor(maxQrDots / modules)))
	const qrDots = cell * modules
	const qrX = Math.max(0, Math.floor((w - qrDots) / 2))
	const qrY = 12
	const textY = qrY + qrDots + 12
	// TSS24.BF2 半角约 12 点宽，按字符数粗略居中；超宽时从左边距 8 点开始
	const textX = Math.max(8, Math.floor((w - safe.length * 12) / 2))
	return `SIZE ${width} mm, ${height} mm\n GAP ${gap} mm, 0 mm\n DIRECTION 0\n DENSITY 8\n CLS\n ` +
		`QRCODE ${qrX},${qrY},L,${cell},A,0,"${safe}"\n ` +
		`TEXT ${textX},${textY},"TSS24.BF2",0,1,1,"${safe}"\n ` +
		`PRINT 1\n `
}

// 调蓝牙打印机打出箱码
export const printBoxQr = async (value : string) => {
	const printer = new Printer()
	printer.setPrinterParams(blueToothStore)
	await printer.printAsync([buildBoxQrTspl(value)])
}
