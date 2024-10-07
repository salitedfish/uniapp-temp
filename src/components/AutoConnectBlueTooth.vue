<script lang='ts' setup>
	import {
		blueTooth,
		blueToothStore
	} from "@/store/blueTooth"
	import {
		Platform
	} from '@/util/env';
	import {
		routes
	} from "@/store/route"

	const checkBlueTooth = () => {
		// 如果是app并且未连接并且没在搜索中
		if (!blueToothStore.connected && Platform.isApp() && !blueToothStore.searching) {
			// 查看是否之前有连接过
			const blueToothDeviceId = uni.getStorageSync("blueToothDeviceId")
			// 如果连接过，自动连接
			if (blueToothDeviceId) {
				blueTooth.autoConnect(blueToothDeviceId)
			}
			// 如果没连接过，提示手动连接
			else {
				uni.showModal({
					title: '提示',
					content: "首次连接蓝牙需手动连接",
					success: (res) => {
						if (res.confirm) {
							uni.switchTab({
								url: routes.blueTooth.path
							})
						}
					}
				});
			}
		}
	}

	defineExpose({
		checkBlueTooth
	})
</script>

<template>
	<up-button class="btn-item" @click="checkBlueTooth" :type="blueToothStore.connected? 'success' : 'primary' "
		:text="blueToothStore.searching ? '蓝牙搜索中...' : blueToothStore.connected? '蓝牙已连接' : '点击连接蓝牙'"
		v-if="Platform.isApp()">
	</up-button>
</template>

<style>
</style>