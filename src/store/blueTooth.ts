import { reactive } from "vue"
import type { BlueToothDevice, BlueToothService, BlueToothCharacteristic } from "../type/blueTooth"


export const blueToothStore = reactive({
	hasBlueTooth: false,

	startFound: false,

	devices: [] as BlueToothDevice[],
	deviceId: "",

	servers: [] as BlueToothService[],
	serviceId: "",

	characteristics: [] as BlueToothCharacteristic[],
	characteristic: {} as BlueToothCharacteristic,
	characteristicId: "",

	connected: false,

	searching: false
})