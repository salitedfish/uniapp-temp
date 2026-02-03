<template>
	<div class="bluetooth-writer">
		<!-- 1. 设备扫描与选择区域 -->
		<div class="btns-group">
			<button class="scan-btn" @click="scanBluetoothDevices"
				:disabled="!isBluetoothSupported || isScanning || isConnecting">
				{{ isScanning ? '正在扫描蓝牙设备...' : '扫描蓝牙设备' }}
			</button>

			<!-- 设备选择下拉框（扫描到设备后显示） -->
			<select v-if="deviceList.length > 0" v-model="selectedDeviceId" class="device-select" :disabled="isConnecting">
				<option value="">请选择蓝牙设备</option>
				<option v-for="device in deviceList" :key="device.id" :value="device.id">
					{{ device.name || '未知设备' }} ({{ device.id }})
				</option>
			</select>

			<button @click="connectSelectedDevice" :disabled="!selectedDeviceId || isConnecting || !deviceList.length">
				连接选中设备
			</button>
		</div>

		<!-- 2. 可写入特征选择（自动找到后显示） -->
		<div v-if="writableCharacteristics.length > 0" class="char-select-group">
			<label>选择可写入的特征：</label>
			<select v-model="selectedCharIndex" class="char-select" :disabled="isWriting">
				<option v-for="(char, index) in writableCharacteristics" :key="index" :value="index">
					服务UUID: {{ char.serviceUuid }} | 特征UUID: {{ char.charUuid }} | 支持: {{ char.supportWrite ? '带响应' : '无响应' }}
				</option>
			</select>
		</div>

		<!-- 3. 数据写入区域 -->
		<div class="input-group" v-if="isDeviceConnected">
			<label>写入字符串：</label>
			<input type="text" v-model="strInputValue" placeholder="输入要发送的文本（如：LED_ON）"
				:disabled="!isDeviceConnected || isWriting">
			<button @click="writeStringData"
				:disabled="!isDeviceConnected || isWriting || !strInputValue.trim() || writableCharacteristics.length === 0">
				发送字符串
			</button>
		</div>

		<div class="input-group" v-if="isDeviceConnected">
			<label>写入十六进制指令：</label>
			<input type="text" v-model="hexInputValue" placeholder="如：010300000001840A"
				:disabled="!isDeviceConnected || isWriting">
			<button @click="writeHexData"
				:disabled="!isDeviceConnected || isWriting || !hexInputValue.trim() || writableCharacteristics.length === 0">
				发送十六进制
			</button>
		</div>

		<!-- 4. 日志输出区域 -->
		<div class="log-container" ref="logRef">
			<div v-for="(log, index) in logList" :key="index" class="log-item">
				{{ log }}
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		onMounted,
		onUnmounted,
		nextTick
	} from 'vue';

	// 响应式数据
	const isBluetoothSupported = ref(false); // 浏览器是否支持蓝牙
	const isScanning = ref(false); // 是否正在扫描设备
	const isConnecting = ref(false); // 是否正在连接设备
	const isWriting = ref(false); // 是否正在写入数据
	const isDeviceConnected = ref(false); // 设备是否已连接
	const deviceList = ref([]); // 扫描到的设备列表
	const selectedDeviceId = ref(''); // 选中的设备ID
	const selectedCharIndex = ref(0); // 选中的可写入特征索引
	const writableCharacteristics = ref([]); // 自动找到的可写入特征列表
	const strInputValue = ref(''); // 字符串输入值
	const hexInputValue = ref(''); // 十六进制输入值
	const logList = ref([]); // 日志列表
	const logRef = ref(null); // 日志容器Ref
	let bluetoothDeviceInstance = null; // 蓝牙设备实例（非响应式）

	// 日志输出方法
	const addLog = (message) => {
		const time = new Date().toLocaleTimeString();
		logList.value.push(`${time}：${message}`);
		// 自动滚动到最新日志
		nextTick(() => {
			if (logRef.value) {
				logRef.value.scrollTop = logRef.value.scrollHeight;
			}
		});
	};

	// 检查浏览器蓝牙支持
	onMounted(() => {
		isBluetoothSupported.value = !!navigator.bluetooth;
		if (!isBluetoothSupported.value) {
			addLog('当前浏览器不支持Web Bluetooth API（请使用Chrome/Edge等Chromium内核浏览器）');
		}
	});

	// 组件卸载时断开蓝牙连接
	onUnmounted(async () => {
		if (bluetoothDeviceInstance && bluetoothDeviceInstance.gatt.connected) {
			try {
				await bluetoothDeviceInstance.gatt.disconnect();
				addLog('组件卸载，已断开蓝牙连接');
			} catch (error) {
				addLog(`断开蓝牙失败：${error.message}`);
			}
		}
		deviceList.value = [];
		writableCharacteristics.value = [];
		isDeviceConnected.value = false;
	});

	// 1. 扫描所有蓝牙设备（不限制服务）
	const scanBluetoothDevices = async () => {
		if (!isBluetoothSupported.value) return;
		isScanning.value = true;
		deviceList.value = [];
		addLog('开始扫描蓝牙设备...（请确保设备处于广播模式）');

		try {
			// 关键：acceptAllDevices: true 扫描所有BLE设备
			const device = await navigator.bluetooth.requestDevice({
				acceptAllDevices: true, // 不限制任何服务/名称，显示所有设备
				optionalServices: ['00001800-0000-1000-8000-00805f9b34fb'] // 声明通用服务（Mac强制）
			});

			// 保存扫描到的设备
			deviceList.value.push({
				id: device.id,
				name: device.name,
				instance: device
			});
			addLog(`扫描到设备：${device.name || '未知设备'} (${device.id})`);

			// 监听设备断开事件
			device.addEventListener('gattdisconnected', () => {
				addLog('蓝牙设备已断开连接');
				isDeviceConnected.value = false;
				writableCharacteristics.value = [];
				bluetoothDeviceInstance = null;
			});

		} catch (error) {
			if (error.message.includes('User cancelled')) {
				addLog('用户取消了设备选择');
			} else {
				addLog(`扫描设备失败：${error.message}`);
			}
		} finally {
			isScanning.value = false;
		}
	};

	// 2. 连接选中的设备，并自动查找所有可写入特征
	const connectSelectedDevice = async () => {
		if (!selectedDeviceId.value || deviceList.value.length === 0) {
			addLog('请先选择要连接的蓝牙设备');
			return;
		}
		isConnecting.value = true;
		writableCharacteristics.value = [];
		addLog('开始连接设备，并查找可写入特征...');

		try {
			// 获取选中的设备实例
			const selectedDevice = deviceList.value.find(d => d.id === selectedDeviceId.value);
			if (!selectedDevice) {
				addLog('未找到选中的设备');
				return;
			}
			bluetoothDeviceInstance = selectedDevice.instance;

			// 连接GATT服务器
			const gattServer = await bluetoothDeviceInstance.gatt.connect();
			addLog(`已连接设备：${selectedDevice.name || '未知设备'}`);

			// 步骤1：获取设备所有主服务
			const allServices = await gattServer.getPrimaryServices();
			addLog(`找到${allServices.length}个主服务，开始遍历特征...`);

			// 步骤2：遍历所有服务，查找可写入的特征
			for (const service of allServices) {
				try {
					// 获取当前服务下的所有特征
					const allCharacteristics = await service.getCharacteristics();

					// 筛选出可写入的特征（write 或 writeWithoutResponse）
					for (const char of allCharacteristics) {
						const charProps = char.properties;
						// 检查是否支持写入
						if (charProps.write || charProps.writeWithoutResponse) {
							writableCharacteristics.value.push({
								serviceUuid: service.uuid, // 服务UUID
								charUuid: char.uuid, // 特征UUID
								charInstance: char, // 特征实例
								supportWrite: charProps.write, // 是否支持带响应写入
								supportWriteWithoutResponse: charProps.writeWithoutResponse // 是否支持无响应写入
							});
							addLog(`找到可写入特征：服务${service.uuid} → 特征${char.uuid}（支持：${charProps.write ? '带响应' : '无响应'}写入）`);
						}
					}
				} catch (serviceError) {
					// 部分服务可能无权限访问，跳过即可
					addLog(`遍历服务${service.uuid}失败：${serviceError.message}（跳过该服务）`);
				}
			}

			// 检查是否找到可写入特征
			if (writableCharacteristics.value.length === 0) {
				addLog('⚠️ 该设备未找到任何可写入的特征！');
			} else {
				addLog(`✅ 共找到${writableCharacteristics.value.length}个可写入特征，请选择后进行写入操作`);
				isDeviceConnected.value = true;
			}

		} catch (error) {
			addLog(`连接设备失败：${error.message}`);
		} finally {
			isConnecting.value = false;
		}
	};

	// 3. 通用写入方法（适配动态选择的特征）
	const writeToBluetooth = async (data, withResponse = true) => {
		if (writableCharacteristics.value.length === 0) {
			addLog('未找到可写入的特征，无法写入数据');
			return false;
		}
		if (isWriting.value) {
			addLog('正在处理上一次写入，请稍后');
			return false;
		}

		try {
			isWriting.value = true;
			// 获取选中的可写入特征实例
			const selectedChar = writableCharacteristics.value[selectedCharIndex.value];
			if (!selectedChar) {
				addLog('未选择有效的可写入特征');
				return false;
			}

			// 根据特征支持的写入方式选择
			if (withResponse && selectedChar.supportWrite) {
				await selectedChar.charInstance.writeValue(data);
				addLog('数据写入成功（已收到设备响应）');
			} else if (!withResponse && selectedChar.supportWriteWithoutResponse) {
				await selectedChar.charInstance.writeValueWithoutResponse(data);
				addLog('数据写入成功（无需设备响应）');
			} else {
				// 自动降级：如果不支持指定方式，用另一种
				if (selectedChar.supportWrite) {
					await selectedChar.charInstance.writeValue(data);
					addLog(`数据写入成功（自动降级为带响应写入）`);
				} else if (selectedChar.supportWriteWithoutResponse) {
					await selectedChar.charInstance.writeValueWithoutResponse(data);
					addLog(`数据写入成功（自动降级为无响应写入）`);
				} else {
					addLog('该特征不支持任何写入方式');
					return false;
				}
			}
			return true;
		} catch (error) {
			addLog(`数据写入失败：${error.message}`);
			// 尝试重连（可选）
			if (error.message.includes('disconnected')) {
				addLog('设备已断开，尝试重新连接...');
				await connectSelectedDevice();
			}
			return false;
		} finally {
			isWriting.value = false;
		}
	};

	// 4. 字符串转ArrayBuffer并写入
	const writeStringData = async () => {
		const str = strInputValue.value.trim();
		if (!str) return;
		const encoder = new TextEncoder();
		const buffer = encoder.encode(str);
		await writeToBluetooth(buffer);
	};

	// 5. 十六进制转ArrayBuffer并写入
	const writeHexData = async () => {
		let hexStr = hexInputValue.value.trim().replace(/[\s:]/g, '');
		// 格式校验
		if (!/^[0-9A-Fa-f]+$/.test(hexStr) || hexStr.length % 2 !== 0) {
			addLog('十六进制格式错误：需偶数位，仅含0-9/A-F');
			return;
		}
		// 转Uint8Array
		const buffer = new Uint8Array(hexStr.length / 2);
		for (let i = 0; i < hexStr.length; i += 2) {
			buffer[i / 2] = parseInt(hexStr.substring(i, i + 2), 16);
		}
		// 十六进制指令常用无响应写入
		await writeToBluetooth(buffer, false);
	};
</script>

<style scoped>
	.bluetooth-writer {
		padding: 20px;
		max-width: 800px;
		margin: 0 auto;
	}

	.btns-group,
	.char-select-group {
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.input-group {
		margin: 15px 0;
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.input-group input,
	.device-select,
	.char-select {
		padding: 8px 12px;
		flex: 1;
		max-width: 400px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	button {
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		background-color: #409eff;
		color: white;
		transition: background-color 0.2s;
	}

	button:disabled {
		background-color: #ccc;
		cursor: not-allowed;
	}

	button:not(:disabled):hover {
		background-color: #66b1ff;
	}

	.log-container {
		margin-top: 20px;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		min-height: 200px;
		max-height: 300px;
		overflow-y: auto;
		background-color: #f9f9f9;
	}

	.log-item {
		font-size: 14px;
		line-height: 1.5;
		color: #333;
		margin: 4px 0;
	}
</style>