<script setup lang="ts">
	import { onMounted, ref } from "vue"
	import { useThrottle } from "@ultra-man/noa"
	import { BlueTooth } from "../../components/blueTooth"
	import { blueToothStore } from "../../store/blueTooth"
	import { printPage } from "../../store/print"
	import { globalColor } from "../../store/theme"

	const show = ref(false)
	const blueTooth = new BlueTooth()

	// 分段器数据
	const subList = ["设备", "服务", "特征"]
	const subSelect = ref(0)
	const subChange = (index : number) => {
		subSelect.value = index
	}
	// 关闭弹窗
	const closePopup = () => {
		show.value = false
		setTimeout(() => {
			subSelect.value = 0
		}, 1000)
	}

	// 搜索按钮点击
	const searchClick = () => {
		if (blueToothStore.hasBlueTooth) {
			deviceId = ""
			blueTooth.discoveryPrinter()
		} else {
			uni.showToast({
				icon: "error",
				title: "不支持蓝牙搜索"
			})
		}
	}

	// 保存之前连接的设备信息
	let deviceId = ""

	// 重新连接
	const reConnect = useThrottle(() => {
		blueTooth.reConnect()
	})
	// 设备列表选择改变
	const radioChange = useThrottle(async (value : string) => {
		if (deviceId === value) return
		try {
			// 改变设备选择时先断开原先的设备
			if (blueToothStore.connected) {
				await blueTooth.closeConnect(deviceId)
			}
			// 选择设备后关闭搜索
			if (blueToothStore.searching) {
				blueTooth.stopDiscoveryPrinter()
			}
		} catch (err) { } finally {
			deviceId = value
			blueToothStore.deviceId = value
			blueToothStore.serviceId = ""
			blueToothStore.servers = []
			blueToothStore.characteristics = []
			blueToothStore.characteristicId = ""
			//连接蓝牙
			blueTooth.connect()
		}
	})
	// 设备服务列表选择改变
	const radioChange2 = useThrottle((value : string) => {
		blueToothStore.characteristics = []
		blueToothStore.characteristicId = ""
		blueToothStore.serviceId = value
		// 获取蓝牙特征值
		blueTooth.getBLEDeviceCharacteristics()
	})
	// 特征值选择改变
	const radioChange3 = useThrottle((value : string) => {
		blueToothStore.characteristicId = value
		for (let item of blueToothStore.characteristics) {
			if (value === item.uuid) {
				blueToothStore.characteristic = item
				break
			}
		}
	})

	// 初始化获取蓝牙模块
	onMounted(() => {
		// 初始化蓝牙模块
		//@ts-ignore
		if (uni.openBluetoothAdapter) {
			blueToothStore.hasBlueTooth = true
			blueTooth.openBluetoothAdapter()
		} else {
			blueToothStore.hasBlueTooth = false
			uni.showToast({
				icon: "none",
				title: "未找到蓝牙模块",
			})
		}
	})
</script>

<template>
	<view class="print">
		<!-- 蓝牙连接状态 -->
		<u-sticky>
			<up-button class="btn-item" @click="show = true" :type="blueToothStore.connected? 'success' : 'primary' "
				:text="blueToothStore.connected? '蓝牙已连接' : '连接蓝牙'">
			</up-button>
		</u-sticky>

		<!-- 蓝牙弹出框 -->
		<u-popup :show="show" mode="right" @close="closePopup">
			<view class="print-option">
				<view class="btn-box">
					<up-button class="search-btn" @click="searchClick" type="primary" :loading="blueToothStore.searching"
						text="开始搜索" loading-text="搜索中" shape="circle"></up-button>
					<up-button class="search-btn" @click="reConnect" type="primary" text="重新连接" shape="circle"></up-button>
				</view>

				<u-subsection :list="subList" :current="subSelect" @change="subChange" mode="subsection"></u-subsection>

				<view class="options-box">
					<!-- 设备列表 -->
					<view v-show="subSelect === 0">
						<u-transition v-for="(item, index) in blueToothStore.devices" :key="index" :show="true" mode="slide-up"
							duration="200">
							<view class="option-item" :class="{'option-active': blueToothStore.deviceId === item.deviceId }"
								@click="radioChange(item.deviceId)">
								<view class="option-label">
									<image class="option-icon" v-if="blueToothStore.deviceId === item.deviceId "
										src="../../assets/blueTooth_active.svg" alt="" />
									<image class="option-icon" v-else src="../../assets/blueTooth.svg" alt="" />
								</view>
								<view class="option-value">
									{{ item.name }}
								</view>
								<view class="option-label">
									<image class="option-icon" src="../../assets/signal_1.svg" alt="" v-if="item.RSSI <= -100" />
									<image class="option-icon" src="../../assets/signal_2.svg" alt="" v-else-if="item.RSSI <= -80" />
									<image class="option-icon" src="../../assets/signal_3.svg" alt="" v-else-if="item.RSSI <= -60" />
									<image class="option-icon" src="../../assets/signal_4.svg" alt="" v-else-if="item.RSSI <= -40" />
									<image class="option-icon" src="../../assets/signal_5.svg" alt="" v-else />
								</view>
							</view>
						</u-transition>
					</view>

					<!-- 服务列表 -->
					<view v-show="subSelect === 1">
						<view class="option-item" :class="{'option-active': blueToothStore.serviceId === item.uuid }"
							v-for="(item, index) in blueToothStore.servers" :key="index" @click="radioChange2(item.uuid)">
							<view class="option-label">
								<image class="option-icon" v-if="blueToothStore.serviceId === item.uuid "
									src="../../assets/service_active.svg" alt="" />
								<image class="option-icon" v-else src="../../assets/service.svg" alt="" />
							</view>
							<view class="option-value">
								{{ item.uuid }}
							</view>
						</view>
					</view>

					<!-- 特征列表 -->
					<view v-show="subSelect === 2">
						<view class="option-item" :class="{'option-active': blueToothStore.characteristicId === item.uuid }"
							v-for="(item, index) in blueToothStore.characteristics" :key="index" @click="radioChange3(item.uuid)">
							<view class="option-label">
								<image class="option-icon" v-if="blueToothStore.serviceId === item.uuid "
									src="../../assets/characteristic_active.svg" alt="" />
								<image class="option-icon" v-else src="../../assets/characteristic.svg" alt="" />
							</view>
							<view class="option-value">
								{{ item.properties.write ? '可写' : '不可写'  }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 修改自定义打印配置 -->
		<view class="uni-common-mt">
			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text text="打印纸宽度(mm)" type="info"></up-text>
				</view>
				<up-input border="surround" v-model="printPage.width" placeholder="输入打印纸宽度" clearable type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="打印纸高度(mm)" type="info"></up-text>
				</view>
				<up-input border="surround" v-model="printPage.height" placeholder="输入打印纸高度" clearable type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="打印纸间隙(mm)" type="info"></up-text>
				</view>

				<up-input border="surround" v-model="printPage.gap" placeholder="输入打印纸间隙" clearable type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="二维码大小等级(1～10)" type="info"></up-text>
				</view>

				<up-input border="surround" v-model="printPage.QRCodeLevel" placeholder="输入二维码大小等级" clearable
					type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="二维码左偏移(mm)" type="info"></up-text>
				</view>

				<up-input border="surround" v-model="printPage.QRCodeLeftOffset" placeholder="输入二维码左偏移量" clearable
					type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="二维码上偏移(mm)" type="info"></up-text>
				</view>

				<up-input border="surround" v-model="printPage.QRCodeTopOffset" placeholder="输入二维码上偏移量" clearable
					type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="文本左偏移(mm)" type="info"></up-text>
				</view>

				<up-input border="surround" v-model="printPage.textLeftOffset" placeholder="输入文本左偏移量" clearable
					type="number"></up-input>
			</view>

			<view class="uni-form-item uni-column">
				<view class="title">
					<up-text class="title" text="文本上偏移(mm)" type="info"></up-text>
				</view>

				<up-input border="surround" v-model="printPage.textTopOffset" placeholder="输入文本上偏移量" clearable
					type="number"></up-input>
			</view>

		</view>
	</view>
</template>

<style scoped lang="scss">
	.print {
		width: 100%;

		.print-option {
			position: relative;
			width: 85vw;
			height: 100vh;

			.btn-box {
				position: absolute;
				left: 50%;
				bottom: 12rpx;
				transform: translateX(-50%);
				width: 95%;
				display: flex;

				.search-btn {
					margin-top: 12rpx;
					border-radius: 60rpx;

					&+.search-btn {
						margin-left: 12rpx;
					}
				}
			}

			.options-box {
				height: 90vh;
				overflow-y: scroll;
				padding: 0 24rpx 24rpx;

				.title {
					margin-bottom: 16rpx;
				}

				.option-item {
					display: flex;
					padding: 20rpx 30rpx;
					border: 1rpx solid v-bind("globalColor.default");
					border-radius: 10rpx;
					align-items: center;
					margin-top: 12rpx;
					background-color: v-bind("globalColor.default_background");

					.option-label {
						height: 36rpx;
						width: 36rpx;
						margin-right: 12rpx;
						display: flex;
						justify-content: center;
						align-items: center;

						.option-icon {
							width: 100%;
							height: 100%;
						}
					}

					.option-value {
						flex: 1;
						width: 0;
						color: v-bind("globalColor.default")
					}
				}

				.option-active {
					border: 1rpx solid v-bind("globalColor.primary");
					background-color: v-bind("globalColor.primary_background");

					.option-value {
						flex: 1;
						width: 0;
						color: v-bind("globalColor.primary")
					}
				}
			}
		}

		.uni-common-mt {
			padding: 0rpx 24rpx 400rpx;

			.uni-form-item {
				margin-top: 24rpx;

				.title {
					margin-bottom: 16rpx;
				}
			}
		}
	}
</style>