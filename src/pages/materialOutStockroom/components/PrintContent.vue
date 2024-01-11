<script lang='ts'>
	// 框架
	import {
		defineComponent,
	} from 'vue';
	// 组件
	// 工具
	// 接口
	// 数据
	import {
		printPage,
	} from "@/store/print"
	import {
		blueToothStore
	} from "@/store/blueTooth"
	import {
		Printer
	} from "@/fun/printer"
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const props = defineProps < {
		showPrintContent ? : boolean,
		printContent: Obj[]
	} > ()
	const emit = defineEmits < {
		(event: "closePrintContent"): void
	} > ()

	const close = () => {
		emit("closePrintContent")
	}

	const print = () => {
		console.log('打印数据', props.printContent)
		// 获取打印机并设置相关参数
		const printer = new Printer()
		printer.setPrinterParams(blueToothStore)
		let tsplTemplate = ""
		for (const item of props.printContent) {
			tsplTemplate = tsplTemplate +
				`SIZE ${printPage.value.width} mm, ${printPage.value.height} mm\n GAP ${printPage.value.gap} mm, 0 mm\n DIRECTION 0\n DENSITY 8\n CLS\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${40},"TSS32.BF2",0,1.8,1.8,"${'【工序派工资料-材料出库明细】'}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${90},"TSS24.BF2",0,1,1,"${'生产订单号:' + item.cmocode}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${130},"TSS24.BF2",0,1,1,"${'开工日期:' + item.ddate}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${170},"TSS24.BF2",0,1,1,"${'生产的物料编码:' + item.productCode}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${210},"TSS24.BF2",0,1,1,"${'生产的物料名称:' + item.productName}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${250},"TSS24.BF2",0,1,1,"${'出库物料编码:' + item.cinvcode}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${290},"TSS24.BF2",0,1,1,"${'出库物料名称:' + item.cinvname}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${330},"TSS24.BF2",0,1,1,"${'出库物料数量:' + item.count}"\n `
			tsplTemplate = tsplTemplate + `TEXT ${10},${370},"TSS24.BF2",0,1,1,"${'配送工位:' + item.cposname}"\n `
			tsplTemplate = tsplTemplate + `PRINT 1\n `
		}
		console.log("打印指令", tsplTemplate)
		// 开始打印
		printer.print([tsplTemplate])
		// emit("closePrintContent")

	}
</script>

<template>
	<view>
		<u-popup :show="showPrintContent" mode="bottom" @close="close">
			<view class="popup-content common-page common-page-container" style="height: 90vh">
				<view class="common-section-title popup-title ">
					打印预览
				</view>

				<view class="common-page-largest">
					<view class="print-template" v-for="item, key in printContent" :key="key">
						<view class="title">【工序派工资料-材料出库明细】</view>
						<view class="text">生产订单号：{{item.cmocode}}</view>
						<view class="text">开工日期：{{item.ddate}}</view>
						<view class="text">生产的物料编码：{{item.productCode}}</view>
						<view class="text">生产的物料名称：{{item.productName}}</view>
						<view class="text">出库物料编码：{{item.cinvcode}}</view>
						<view class="text">出库物料名称：{{item.cinvname}}</view>
						<view class="text">出库物料数量：{{item.count}}</view>
						<view class="text">配送工位：{{item.cposname}}</view>
					</view>
				</view>

				<view class="btn-box">
					<up-button text="打印" class="bottom-button" @click="print" shape="circle" size="small"
						type="primary"></up-button>
					<up-button text="取消" class="bottom-button" @click="close" shape="circle" size="small"></up-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<style scoped lang='scss'>
	.btn-box {
		padding: 10px 0;
		display: flex;
		justify-content: flex-end;

		.bottom-button+.bottom-button {
			margin-left: 10px;
		}

		.bottom-button {
			flex: 1;
		}
	}

	.print-template {
		border: 1px solid rgba(0, 0, 0, 0.1);
		padding: 10px;

		.title {
			font-size: 16px;
			/* font-weight: bold; */
		}

		.text {
			font-size: 14px;
		}

	}

	.print-template+.print-template {
		margin-top: 10px;
	}
</style>