import {
	Printer
} from "@/fun/printer"
import {
	printPage
} from "@/store/print"
import {
	blueToothStore
} from "@/store/blueTooth"

// 打印箱码
export const printBoxBarcode = (data : Obj) => {
	console.log("开始打印")
	const printer = new Printer()
	printer.setPrinterParams(blueToothStore)
	let tsplTemplate = ""
	tsplTemplate = tsplTemplate +
		`SIZE ${printPage.value.width} mm, ${printPage.value.height} mm\n GAP ${printPage.value.gap} mm, 0 mm\n DIRECTION 0\n DENSITY 8\n CLS\n `
	tsplTemplate = tsplTemplate + `TEXT ${20},${40},"TSS24.BF2",0,2,2,"${data.codeName}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${20},${120},"TSS24.BF2",0,1,1,"物料编码：${data.productCode}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${20},${160},"TSS24.BF2",0,1,1,"客户件号：${data.cusProductCode}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${20},${200},"TSS24.BF2",0,1,1,"每箱数量：${data.maxNum}"\n `
	tsplTemplate = tsplTemplate + `QRCODE ${340},${40},L,${9},A,0,"${data.barcode}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${200},${300},"TSS24.BF2",0,1,1,"${data.barcode}"\n `
	tsplTemplate = tsplTemplate + `PRINT 1\n `
	printer.print([tsplTemplate])
}

export const printBoxBarcode1 = (data : Obj) => {
	console.log("开始打印")
	const printer = new Printer()
	printer.setPrinterParams(blueToothStore)
	let tsplTemplate = ""
	tsplTemplate = tsplTemplate +
		`SIZE ${printPage.value.width} mm, ${printPage.value.height} mm\n GAP ${printPage.value.gap} mm, 0 mm\n DIRECTION 0\n DENSITY 8\n CLS\n `
	tsplTemplate = tsplTemplate + `QRCODE ${170},${40},L,${9},A,0,"${data.barcode}"\n `
	tsplTemplate = tsplTemplate + `TEXT ${200},${300},"TSS24.BF2",0,1,1,"${data.barcode}"\n `
	tsplTemplate = tsplTemplate + `PRINT 1\n `
	printer.print([tsplTemplate])
}

