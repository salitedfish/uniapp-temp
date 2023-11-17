import { blueToothStore } from "../store/blueTooth"

export class BlueTooth {
	// 开启蓝牙
	public openBluetoothAdapter() {
		uni.openBluetoothAdapter({
			complete: (e) => {
				console.log(e)
				if (!e.errCode) {
					console.log("初始化完成")
				} else if (e.errCode == 10001) {
					uni.showToast({
						icon: "none",
						title: "请打开手机蓝牙",
					})
				} else {
					uni.showToast({
						icon: "none",
						title: e.errMsg,
					})
				}
			},
		})
	}
	// 开始搜寻附近的蓝牙外围设备,获取设备列表
	public discoveryPrinter() {
		// 搜之前先关闭之前的连接，否则搜不到原来的设备
		if (blueToothStore.connected) {
			this.closeConnect()
		}
		// 搜之前先关闭之前的搜索
		if (blueToothStore.startFound) {
			this.stopDiscoveryPrinter()
		}
		if (!blueToothStore.hasBlueTooth) return
		blueToothStore.deviceId = ""
		blueToothStore.devices = []
		blueToothStore.searching = true
		uni.startBluetoothDevicesDiscovery({
			complete: (e) => {
				if (
					e.errMsg == "startBluetoothDevicesDiscovery:ok" &&
					!blueToothStore.startFound
				) {
					blueToothStore.startFound = true
					this.printerFound()
				}
			},
		})
	}
	// 停止搜寻附近的蓝牙外围设备
	public stopDiscoveryPrinter() {
		if (!blueToothStore.hasBlueTooth) return
		uni.stopBluetoothDevicesDiscovery()
		blueToothStore.searching = false
	}
	// 发现蓝牙设备就推入列表
	public printerFound() {
		// ArrayBuffer转16进度字符串示例
		uni.onBluetoothDeviceFound((devices) => {
			// 很多没有名字的蓝牙不知道啥东西，直接忽略
			if (devices.devices[0].name) {
				blueToothStore.devices.push(devices.devices[0])
			}
		})
	}
	// 连接蓝牙设备
	public connect() {
		uni.showLoading({
			title: "正在连接设备",
		})
		uni.createBLEConnection({
			deviceId: blueToothStore.deviceId,
			success: (res) => {
				uni.showLoading({
					title: "蓝牙连接成功，开始获取服务",
				})
				blueToothStore.connected = true
				setTimeout(() => {
					this.getBLEDeviceServices()
				}, 2000)
			},
			fail: (res) => {
				uni.showToast({
					icon: "none",
					title: `蓝牙连接失败:${res.errMsg}`,
				})
			},
		})
	}
	// 重新连接蓝牙
	public async reConnect() {
		try {
			await this.closeConnect()
		} catch (err) { } finally {
			this.connect()
		}
	}
	// 关闭连接蓝牙
	public closeConnect(deviceId ?: string) {
		uni.showLoading({
			title: "正在关闭连接"
		})
		return new Promise((resolve, reject) => {
			uni.closeBLEConnection({
				deviceId: deviceId || blueToothStore.deviceId,
				success: () => {
					uni.showToast({
						icon: "none",
						title: "连接关闭成功"
					})
					blueToothStore.connected = false
					resolve("close")
				},
				fail: () => {
					uni.showToast({
						icon: "none",
						title: "连接关闭失败"
					})
					reject()
				}
			})
		})
	}
	// 通过选择的设备id，获取设备服务列表
	public getBLEDeviceServices() {
		uni.getBLEDeviceServices({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: blueToothStore.deviceId,
			success: (res) => {
				if (res.services.length <= 0) {
					uni.showToast({
						icon: "none",
						title: "未获取到设备服务",
					})
				} else {
					uni.showToast({
						icon: "none",
						title: "设备服务获取完成",
					})
					blueToothStore.servers = res.services
				}
			},
			fail: (e) => {
				uni.showToast({
					icon: "none",
					title: `服务获取失败${e.errMsg}`,
				})
			},
		})
	}
	// 通过选择的设备id和设备服务，获取特征值
	public getBLEDeviceCharacteristics() {
		uni.getBLEDeviceCharacteristics({
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: blueToothStore.deviceId,
			// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
			serviceId: blueToothStore.serviceId,
			success: (res) => {
				if (res.characteristics.length <= 0) {
					uni.showToast({
						icon: "none",
						title: "未获取到特征值",
					})
				} else {
					uni.showToast({
						icon: "none",
						title: "特征值获取成功",
					})
					blueToothStore.characteristics = res.characteristics
				}
			},
			fail: (res) => {
				uni.showToast({
					icon: "none",
					title: `特征值获取失败:${res.errMsg}`,
				})
			},
		})
	}
}