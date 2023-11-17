const gbk = require("./gbk")

interface PrinterParams {
	deviceId : string
	serviceId : string
	characteristicId : string
	characteristic : any
}

// 打印机
export class Printer {
	// 打印机相关的参数
	private printerParams : PrinterParams = {
		// 打印机id
		deviceId: "",
		// 服务id
		serviceId: "",
		// 特征值id
		characteristicId: "",
		// 特征值对象
		characteristic: null,
	}
	// 设置打印机参数
	public setPrinterParams(printerParams : PrinterParams) {
		this.printerParams = printerParams
	}
	// 调用打印
	public print(commands : string[], printerParams ?: PrinterParams) {
		if (printerParams) {
			this.setPrinterParams(printerParams)
		}
		this.writeBLECharacteristicValue(commands)
	}
	// 参数判断
	private writeBLECharacteristicValue = (commands : string[]) => {
		if (!this.printerParams.deviceId) {
			uni.showToast({
				icon: "none",
				title: "请选择设备",
			})
			return
		}
		if (!this.printerParams.serviceId) {
			uni.showToast({
				icon: "none",
				title: "请选择设备服务",
			})
			return
		}
		if (!this.printerParams.characteristicId) {
			uni.showToast({
				icon: "none",
				title: "请选择特征值",
			})
			return
		}
		if (!this.printerParams.characteristic.properties.write) {
			uni.showToast({
				icon: "none",
				title: "当前特征值不支持打印功能",
			})
			return
		}
		uni.showLoading({
			title: "打印中",
		})
		// 开始打印数据
		this.startPrintData(commands)
	}
	// 开始打印数据
	private async startPrintData(commands : string[]) {
		try {
			// 循环打印每一句指令
			for (const command of commands) {
				await this.printbuffs(this.stringToArrayBuffer(command))
			}
			//打印结束
			uni.showToast({
				icon: "none",
				title: "打印完成",
			})
		} catch (err) {
			uni.showToast({
				icon: "none",
				title: `打印失败:${err}`,
			})
		}
	}
	// 分包打印每条指令
	private async printbuffs(buffer : ArrayBuffer) {
		const maxChunk = 20
		const length = buffer.byteLength
		// 分包调用打印
		for (let i = 0; i < length; i = i + maxChunk) {
			const start = i
			const end = i + maxChunk <= length ? i + maxChunk : length
			let subPackage = buffer.slice(start, end)
			await this.printbuff(subPackage)
		}
	}
	// 实际打印
	private printbuff(buffer : any) {
		return new Promise((resolve, reject) => {
			uni.writeBLECharacteristicValue({
				deviceId: this.printerParams.deviceId,
				serviceId: this.printerParams.serviceId,
				characteristicId: this.printerParams.characteristicId,
				// 这里的value是ArrayBuffer类型
				value: buffer,
				success: (res) => {
					setTimeout(resolve, 100)
				},
				fail: (res) => {
					setTimeout(reject, 100, res.errMsg)
				},
			})
		})
	}

	// 字符串转arraybuffer
	public stringToArrayBuffer(str : string) {
		// 转utf-8格式，uniapp不支持
		// const encoder = new TextEncoder();
		// // 将字符串编码为UTF-8的ArrayBuffer
		// return encoder.encode(str).buffer;

		// 转utf-16格式
		// let val: string = ""
		// for (const item of str) {
		//   val = val + "," + item.charCodeAt(0).toString(16)
		// }
		// val = val.slice(1)
		// const regExpMatchArray = val.match(/[\da-f]{2}/gi)
		// if (regExpMatchArray) {
		//   const arr = regExpMatchArray.map(function (h: any) {
		//     return parseInt(h, 16)
		//   })
		//   return new Uint8Array(arr).buffer
		// } else {
		//   return new Uint8Array().buffer
		// }

		// 下面转成utf-8编码，uniapp也能用
		// const buffer = new ArrayBuffer(str.length * 3)
		// const view = new DataView(buffer)
		// let offset = 0

		// for (let i = 0; i < str.length; i++) {
		//   const codePoint = str.codePointAt(i) as number

		//   if (codePoint <= 0x7f) {
		//     view.setUint8(offset++, codePoint)
		//   } else if (codePoint <= 0x7ff) {
		//     view.setUint8(offset++, (codePoint >> 6) | 0xc0)
		//     view.setUint8(offset++, (codePoint & 0x3f) | 0x80)
		//   } else if (codePoint <= 0xffff) {
		//     view.setUint8(offset++, (codePoint >> 12) | 0xe0)
		//     view.setUint8(offset++, ((codePoint >> 6) & 0x3f) | 0x80)
		//     view.setUint8(offset++, (codePoint & 0x3f) | 0x80)
		//   } else {
		//     view.setUint8(offset++, (codePoint >> 18) | 0xf0)
		//     view.setUint8(offset++, ((codePoint >> 12) & 0x3f) | 0x80)
		//     view.setUint8(offset++, ((codePoint >> 6) & 0x3f) | 0x80)
		//     view.setUint8(offset++, (codePoint & 0x3f) | 0x80)
		//   }
		// }

		// return buffer.slice(0, offset)

		// gbk格式的编码
		return new Uint8Array(gbk.encode(str)).buffer
	}
}