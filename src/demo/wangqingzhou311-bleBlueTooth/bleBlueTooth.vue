<template>
	<view class="content">
		<radio-group class="radio" @change="radioChange">
			<label class="label"
						 v-for="(item, index) in [{value:'tspl',name:'标签模式'},{value:'cpcl',name:'面单模式'},{value:'esc',name:'票据模式'},{value:'0',name:'其它'}]"
						 :key="index">
				<radio :value="item.value" :checked="item.value === state.current"/>
				{{ item.name }}
			</label>
		</radio-group>
		<view class="btn">
			<button @click="onPrintClick" type="primary">打印</button>
			<button @click="getBluetooth" type="primary">搜索</button>
		</view>
		<view class="list">
			<view class="title">设备列表：</view>
			<scroll-view scroll-y="true" class="scroll-Y">
				<button v-for="item in state.deviceData" :key="item.deviceId" class="button" type="primary"
								@click="onBtnClick(item.deviceId)" :plain="item.deviceId===state.deviceId">{{ item.name }}
				</button>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import {
	reactive,
	onMounted,
	onUnmounted
} from 'vue';
import Printer from './printer';
import {commands} from './command';

const state = reactive({
	current: 'tspl',
	deviceData: [
		{deviceId:0,name:'deviceId'},
		{deviceId:1,name:'deviceId'}
	],
	data: [
		{
			id: "12345",
			width: 100,
			height: 100,
			title1: 'title_1',
			title2: 'title_2',
			title3: 'title_3'
		},
		{
			id: "123456",
			width: 100,
			height: 100,
			title1: 'title_4',
			title2: 'title_5',
			title3: 'title_6'
		},
		{
			id: "123456789",
			width: 100,
			height: 100,
			title1: 'title_7',
			title2: 'title_8',
			title3: 'title_9'
		}
	],
	deviceId: ''
});

onMounted(() => {
	Printer.init();
});
onUnmounted(() => {
	Printer.closeBluetoothAdapter();
});
const radioChange = (e) => {
	state.current = e.detail.value;
}
const getBluetooth = () => {
	Printer.getBluetooth(function (res) {
		state.deviceData = res.devices;
	});
}

const onPrintClick = () => {
	const stringData = [];

	state.data.forEach(item => {
		stringData.push(commands(state.current, item));
	})
	Printer.printer(stringData, () => {
		uni.showToast({
			title: '打印成功',
			duration: 2000,
		});
	})
}
const onBtnClick = (deviceId) => {
	state.deviceId = deviceId;
	Printer.connectDevice(deviceId);
}
</script>

<style scoped>
.content {
	padding-top: 50rpx;
	font-size: 14rpx;

	.radio {
		display: flex;
		justify-content: space-around;
	}

	.btn {
		display: flex;
		margin: 30rpx;
	}

	.list {
		.title {
			padding: 30rpx;
		}

		.scroll-Y {
			height: calc(100vh - 500rpx);
			border: 1px solid #4400ff;

			.button {
				margin: 30rpx;
			}
		}
	}
}
</style>