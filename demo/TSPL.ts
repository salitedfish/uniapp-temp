import type { Component, ComponentInternalInstance } from "vue"
import { textOptions, qrcodeOptions } from "../../../type/printOptions"

export const mmToDot = (mm: number) => {
  return mm * 8
}

export const tspl = (item: any) => {
  // 模板字符串 自带换行符 \n (也可以用字符串拼接 每行指令结尾 + \n)
  // 字符串拼接：SIZE 100mm, 100mm\n TEXT 250,0,"TSS24.BF2",0,1,1,"test"\n PRINT 1\n
  const string = `SIZE ${item.width} mm, ${item.height} mm
		GAP 0 mm, 0 mm
		DIRECTION 0
		CLS
		TEXT ${mmToDot(2)},${mmToDot(2)},"TSS24.BF2",0,1,1,"标题1：${item.title1} ${item.title2}"
		TEXT ${mmToDot(2)},${mmToDot(12)},"TSS24.BF2",0,1,1,"标题2：${item.title2} 标题3：${item.title3}"
		QRCODE ${mmToDot(2)},${mmToDot(22)},H,6,A,0,"${item.id}"
		PRINT 1
		`
  return string
}

export const genTSPL = (instance: ComponentInternalInstance | null, printOptions: string[], printData: any) => {
	
  console.log(printOptions)
	
  let command = `SIZE 80 mm, 80 mm\n GAP 0 mm, 0 mm\n DIRECTION 0\n CLS\n `
  
  uni.createSelectorQuery().select('.html-template').fields({
	  rect: true
  }, (data) => {
	  command = command + `TEXT ${mmToDot(2)},${mmToDot(2)},"TSS24.BF2",0,1,1,"${data}"\n `
  	  console.log('标签纸', data)
  }).exec()
  

  for(const option of printOptions) {
	  uni.createSelectorQuery()
	    .select(`.template-${option}`)
	    .fields({
			rect: true
		}, (data) => {
			console.log('每一项', data)
			if(data) {
				// 如果是打印文字的情况
				if(textOptions.includes(`template-${option}`)) {
					command = command + `TEXT ${mmToDot(2)},${mmToDot(2)},"TSS24.BF2",0,1,1,"${printData[option]}"\n `
				}
				
				// 如果是打印二维码的情况
				if(qrcodeOptions.includes(`template-${option}`)) {
					command = command + `QRCODE ${mmToDot(2)},${mmToDot(22)},H,6,A,0,"${printData[option]}"\n `
				}
			}
	    })
	    .exec()
  }
  command = command + `PRINT 1\n `
  
  return command
}
