import { Printer } from "@/fun/printer"
import { printPage } from "@/store/print"
import { blueToothStore } from "@/store/blueTooth"


// 打印条码
export const printBoxBarcode = (data : Obj) => {
	console.log("开始打印", data)
	const printer = new Printer()
	printer.setPrinterParams(blueToothStore)
	let tsplTemplate = ""
	tsplTemplate = tsplTemplate + `SIZE ${printPage.value.width} mm, ${printPage.value.height} mm\n GAP ${printPage.value.gap} mm, 0 mm\n DIRECTION 0\n DENSITY 8\n CLS\n `
	// tsplTemplate = tsplTemplate + `QRCODE ${20},${40},L,${9},A,0,"${data.productCode}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${40},"TSS24.BF2",0,1,1,"产品编码：${data.productCode}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${80},"TSS24.BF2",0,1,1,"产品名称：${data.productName}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${120},"TSS24.BF2",0,1,1,"产品规格：${data.productSpec}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${160},"TSS24.BF2",0,1,1,"客户产品件号：${data.cusProductCode}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${200},"TSS24.BF2",0,1,1,"客户产品名称：${data.cusProductName}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${240},"TSS24.BF2",0,1,1,"状态：${data.result == 1 ? "合格" : "不合格"}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${280},"TSS24.BF2",0,1,1,"不合格原因：${data.failureModeNames}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${320},"TSS24.BF2",0,1,1,"工序名称：${data.processName}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${360},"TSS24.BF2",0,1,1,"检验人员：${data.createName}"\n `
	// tsplTemplate = tsplTemplate + `TEXT ${350},${400},"TSS24.BF2",0,1,1,"检验时间：${data.createTime}"\n `

	tsplTemplate = tsplTemplate + `TEXT ${40},${40},"TSS24.BF2",0,1,1,"产品编码：${data.productCode}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${80},"TSS24.BF2",0,1,1,"产品名称：${data.productName}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${120},"TSS24.BF2",0,1,1,"二维码：${data.barcode1}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${160},"TSS24.BF2",0,1,1,"状态：${data.result == 1 ? "合格" : "不合格"}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${200},"TSS24.BF2",0,1,1,"不合格原因：${data.failureModeNames}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${240},"TSS24.BF2",0,1,1,"工序名称：${data.processName}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${280},"TSS24.BF2",0,1,1,"报工人员：${data.createName}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${40},${320},"TSS24.BF2",0,1,1,"报工时间：${data.createTime}"\n `
	tsplTemplate = tsplTemplate + `PRINT 1\n `
	tsplTemplate = tsplTemplate + `END \n `

	console.log("打印指令", tsplTemplate)
	printer.print([tsplTemplate])
}