<script lang='ts' setup>
	// 框架
	import {
		onMounted,
		ref,
		onUnmounted
	} from 'vue';
	import {
		onShow
	} from "@dcloudio/uni-app"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import ReferTypeCheck from "./components/ReferTypeCheck.vue"
	import PrintTypeCheck from "./components/PrintTypeCheck.vue"
	import UnInputProcessSendDocPicker from "@/components/UpInputProcesSendDocPicker.vue"
	import UpInputMaterielApplyDocPicker from "@/components/UpInputMaterielApplyDocPicker"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import PrintContent from "./components/PrintContent.vue"
	// 工具
	import {
		useTimeFormat
	} from "@ultra-man/noa"
	// 接口
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		resetAll,
		typeSelect,
		printTypeCheck,
		showPrintContent,
		processSendDocSelected,
		materielApplyDocSelected,
		dateSelected,
		tableData,
		originData,
		operateData,
		showPopup,
		closePrintContent,
		processSendDocSelect,
		materielApplyDocSelect,
		open,
		edit,
		deleteTable,
		confirm,
		config,
		confirmDisabled,
		submiting
	} from "./index"

	const rightClick = () => {
		uni.navigateTo({
			url: routes.mOSDefaultSetPage.path
		})
	}

	onMounted(() => {
		dateSelected.value = [useTimeFormat("{YYYY}-{MM}-{dd}")(Date.now()).format]
	})
	onUnmounted(() => {
		resetAll()
	})
	onShow(() => {
		const configStr = uni.getStorageSync("mOSDefaultSet")
		config.value = configStr ? JSON.parse(configStr) : {}
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.materialOutStockroom.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view class="common-section-title">
			基本信息
		</view>
		<view>
			<ReferTypeCheck class="tab-box" v-model="typeSelect"></ReferTypeCheck>
		</view>
		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="领料申请单:" borderBottom labelWidth="90" style="padding: 0"
				v-if="typeSelect === 1">
				<UpInputMaterielApplyDocPicker @select="materielApplyDocSelect" border="none" placeholder="选择领料申请单" readonly
					clearable class="input-item" v-model:selected="materielApplyDocSelected">
				</UpInputMaterielApplyDocPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="派工资料:" borderBottom labelWidth="90" style="padding: 0"
				v-if="typeSelect === 0">
				<UnInputProcessSendDocPicker @select="processSendDocSelect" border="none" placeholder="选择生产订单工序派工资料" readonly
					clearable class="input-item" v-model:selected="processSendDocSelected">
				</UnInputProcessSendDocPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="出库日期:" borderBottom labelWidth="90" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择出库日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>

		<view class="common-section-title">
			本次出库明细
		</view>
		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料编码</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料名称</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">数量信息</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">货位信息</uni-th>
						<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key + 1)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.cinvcode }}</uni-td>
						<uni-td class="nowrap">{{ item.cinvname }}</uni-td>
						<uni-td class="nowrap primary">{{ item.count }}</uni-td>
						<uni-td class="nowrap">{{ item.cposname }}</uni-td>
						<uni-td class="warning nowrap" @click.stop="deleteTable">删除</uni-td>
					</uni-tr>
				</uni-table>

				<u-popup :show="showPopup" mode="right" @close="showPopup = false" safeAreaInsetTop>
					<view class="popup-content common-page-container" style="width: 85vw">
						<view class="common-section-title">
							出库详情信息
						</view>
						<view class="popup-form common-page-largest">
							<up-form class="common-form" labelPosition="left">
								<up-form-item class="common-form-item" label="行号:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="operateData.index"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.cinvcode"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.cinvname"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.cbatch"
										readonly>
									</up-input>
								</up-form-item>
								<!-- 								<up-form-item class="common-form-item" label="现存总量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.cbatch"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="批次现存量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.cbatch"
										readonly>
									</up-input>
								</up-form-item> -->
								<up-form-item class="common-form-item" label="出库数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="operateData.count">
									</up-input>
								</up-form-item>
								<!-- 								<up-form-item class="common-form-item" label="计量单位:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.cbatch"
										readonly>
									</up-input>
								</up-form-item> -->
							</up-form>
						</view>
						<view class="btn-box">
							<up-button type="info" text="退出" class="bottom-button" @click="showPopup = false"
								shape="circle"></up-button>
							<up-button type="primary" text="确定" class="bottom-button" @click="edit" shape="circle"></up-button>
						</view>
					</view>
				</u-popup>
			</view>
		</view>

		<PrintTypeCheck class="print-check-box" v-model="printTypeCheck" v-if="typeSelect === 0"></PrintTypeCheck>

		<PrintContent class="" :printContent="tableData" :showPrintContent="showPrintContent"
			@closePrintContent="closePrintContent">
		</PrintContent>

		<view class="btn-box">
			<up-button type="primary" text="提交出库" class="bottom-button" shape="circle" @click="confirm"
				:disabled="confirmDisabled" :loading="submiting"></up-button>
		</view>

	</view>
</template>

<style scoped lang='scss'>
	.tab-box {
		margin-bottom: 10px
	}

	.popup-content {
		height: 95vh;
		display: flex;
		justify-content: space-between;
		flex-direction: column;

		.btn-box {
			display: flex;
		}
	}

	.common-page-container {
		.print-check-box {
			margin-top: 10px;
		}

		>.btn-box {
			margin-top: 10px
		}
	}
</style>