<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		reactive
	} from 'vue';
	// 组件
	import UpInputProcessPicker from "@/components/UpInputProcessPicker.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getRePrintList
	} from "@/api/business"
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
	import {
		nextDayFormat
	} from "@/store/common"
	import {
		globalColor
	} from "@/store/theme"
	// 类型
	import type {
		Business
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	// 生成分页所需的数据和方法
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage,
		reSetList
	} = useTable(getRePrintList)

	// 确认搜索
	const search = () => {
		reSetPage()
		searchList()
	}
	// 重制搜索参数
	const reset = () => {
		processSelected.value = []
		materialSelected.value = []
		outMaterialSelected.value = []
		dateSelected.value = []
		reSetPage()
	}

	// 工序
	const processSelected = ref < Obj[] > ([])
	const processSelect = (res: Obj[]) => {
		if (res.length > 0) {
			searchParam.value.copdesc = res[0].id
		} else {
			searchParam.value.copdesc = null
		}
	}

	// 生产的物料选择相关
	const materialSelected = ref < Business[] > ([])
	const materialSelect = (res: Business[]) => {
		if (res.length > 0) {
			searchParam.value.productCode = res[0].code
		} else {
			searchParam.value.productCode = null
		}
	}

	// 出库的物料选择相关
	const outMaterialSelected = ref < Business[] > ([])
	const outMaterialSelect = (res: Business[]) => {
		if (res.length > 0) {
			searchParam.value.cinvcode = res[0].code
		} else {
			searchParam.value.cinvcode = null
		}
	}

	// 单据日期选择相关
	const dateSelected = ref([nextDayFormat, nextDayFormat])
	const dateSelect = (dates: string[]) => {
		searchParam.value.startDate = dates[0]
		searchParam.value.endDate = dates[1]
	}

	// 点击切换打印选择
	const selectPrint = (item: Obj) => {
		item.selected = !item.selected
	}

	// 开始打印
	const print = () => {
		if (!resultData.value) return
		// 获取打印机并设置相关参数
		const printer = new Printer()
		printer.setPrinterParams(blueToothStore)
		let tsplTemplate = ""
		for (const item of resultData.value?.list) {
			// 只有选中的打印内容才需要打印
			if (item.selected) {
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
				tsplTemplate = tsplTemplate + `TEXT ${10},${370},"TSS24.BF2",0,1,1,"${'出库物料货位:' + item.cposname}"\n `
				tsplTemplate = tsplTemplate + `TEXT ${10},${410},"TSS24.BF2",0,1,1,"${'配送工位:' + item.copdesc}"\n `
				tsplTemplate = tsplTemplate + `PRINT 1\n `
			}
		}
		if (tsplTemplate) {
			console.log("打印指令", tsplTemplate)
			// 开始打印
			printer.print([tsplTemplate])
			// emit("closePrintContent")
		} else {
			uni.showToast({
				icon: "none",
				title: "请选择要打印的标签"
			})
		}


	}
</script>

<template>

	<up-form class="common-form" labelPosition="left">

		<up-form-item class="common-form-item" label="工作中心:" borderBottom labelWidth="90" style="padding: 0">
			<UpInputProcessPicker border="none" placeholder="选择U8工作中心" readonly clearable class="input-item"
				v-model:selected="processSelected" @select="processSelect">
			</UpInputProcessPicker>
		</up-form-item>

		<up-form-item class="common-form-item" label="生产的物料:" borderBottom labelWidth="90" style="padding: 0">
			<UpInputMaterielPicker border="none" placeholder="选择U8存货档案" readonly clearable class="input-item"
				v-model:selected="materialSelected" search @select="materialSelect">
			</UpInputMaterielPicker>
		</up-form-item>

		<up-form-item class="common-form-item" label="出库的物料:" borderBottom labelWidth="90" style="padding: 0">
			<UpInputMaterielPicker border="none" placeholder="选择U8存货档案" readonly clearable class="input-item"
				v-model:selected="outMaterialSelected" search @select="outMaterialSelect">
			</UpInputMaterielPicker>
		</up-form-item>

		<up-form-item class="common-form-item" label="开工日期:" borderBottom labelWidth="80" style="padding: 0">
			<UpInputDatePicker border="none" placeholder="选择开工日期" clearable class="input-item" readonly
				v-model:selected="dateSelected" mode="range" @select="dateSelect">
			</UpInputDatePicker>
		</up-form-item>

	</up-form>

	<view class="search-btn-box">
		<up-button type="primary" text="查询" class="bottom-button" @click="search" shape="circle" :disabled="searching">
		</up-button>
		<up-button text="重置" class="bottom-button" @click="reset" shape="circle" :disabled="searching">
		</up-button>
	</view>

	<view class="" v-if="resultData && resultData.list">
		<view class="print-box" v-for="item, key in resultData.list" :key="key" @click="selectPrint(item)">
			<view class="icon-box">
				<uni-icons custom-prefix="custom-icon" type="icon-xuanze" size="18" :color="globalColor.primary"
					v-if="item.selected"></uni-icons>
				<uni-icons custom-prefix="custom-icon" type="icon-mei-xuanze" size="18" :color="globalColor.default"
					v-else></uni-icons>
			</view>

			<view class="print-template" :class="{selected: item.selected}">
				<view class="title">【工序派工资料-材料出库明细】</view>
				<view class="text">生产订单号：{{item.cmocode}}</view>
				<view class="text">开工日期：{{item.ddate}}</view>
				<view class="text">生产的物料编码：{{item.productCode}}</view>
				<view class="text">生产的物料名称：{{item.productName}}</view>
				<view class="text">出库物料编码：{{item.cinvcode}}</view>
				<view class="text">出库物料名称：{{item.cinvname}}</view>
				<view class="text">出库物料数量：{{item.count}}</view>
				<view class="text">出库物料货位：{{item.cposname}}</view>
				<view class="text">配送工位：{{item.copdesc}}</view>
			</view>
		</view>
	</view>

	<view class="btn-box" v-if="resultData && resultData.list.length > 0">
		<up-button text="打印" class="bottom-button" @click="print" shape="circle" size="small" type="primary"></up-button>
		<!-- <up-button text="取消" class="bottom-button" @click="close" shape="circle" size="small"></up-button> -->
	</view>
</template>

<style scoped lang='scss'>
	.search-btn-box {
		margin-top: 10px;
		display: flex;

		.bottom-button+.bottom-button {
			margin-left: 12rpx
		}
	}

	.print-box {
		display: flex;
		align-items: center;

		.icon-box {
			margin-right: 10px;
		}

		.print-template {
			flex: 1;
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
	}



	.print-template.selected {
		border: 1px solid v-bind("globalColor.primary_deep_background");
		background-color: v-bind("globalColor.primary_deep_background");
	}

	.print-template {
		margin-top: 10px;
	}

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
</style>