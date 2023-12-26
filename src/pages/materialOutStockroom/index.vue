<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		watch
	} from 'vue';
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import ReferTypeCheck from "./components/ReferTypeCheck.vue"
	import PrintTypeCheck from "./components/PrintTypeCheck.vue"
	import UnInputProcessSendDocPicker from "@/components/UpInputProcesSendDocPicker.vue"
	import UpInputMaterielApplyDocPicker from "@/components/UpInputMaterielApplyDocPicker"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import PrintContent from "./components/PrintContent.vue"
	// 工具
	// import {
	// 	useTable
	// } from "@/hook/usePageTable"
	import {
		useDeepClone
	} from "@ultra-man/noa"
	// 接口
	// 数据
	import {
		routes
	} from "@/store/route"
	// 类型
	import type {
		Materiel
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const rightClick = () => {
		uni.navigateTo({
			url: routes.mOSDefaultSetPage.path
		})
	}

	// tab切换
	const typeSelect = ref(0)
	watch(typeSelect, () => {
		processSendDocSelected.value = []
		materielApplyDocSelected.value = []
		tableData.value = []
	})

	// 是否打印
	const printTypeCheck = ref(0)
	const showPrintContent = ref(false)
	const closePrintContent = () => {
		showPrintContent.value = false
	}

	// 参照生产订单工序派工资料情况
	const processSendDocSelected = ref([])
	const processSendDocSelect = () => {
		// todo请求列表
	}

	// 参照领料申请单情况
	const materielApplyDocSelected = ref([])
	const materielApplyDocSelect = () => {
		// todo请求列表
	}

	// 日期
	const dateSelected = ref < string[] > ([])

	// 生成分页所需的数据
	// const {
	// 	searchList,
	// 	searchParam,
	// 	searching,
	// 	resultData,
	// 	reSetPage,
	// } = useTable()

	// 分页切换时
	// const pageChange = () => {
	// 	searchList()
	// }

	// table实际展示的数据, 表格由前端自己维护
	const tableData = ref([{
		code: "1",
		name: "物料1",
		num: 100
	}])

	// 表格操作
	const operateData = ref < Materiel > ({})
	const originData = ref < Materiel > ({})
	const showPopup = ref(false)
	const open = (item: Materiel) => {
		originData.value = item
		operateData.value = useDeepClone(item)({
			complete: true
		})
		showPopup.value = true
	}
	// 弹窗内货位码扫描成功
	const edit = () => {
		originData.value.code = operateData.value.code
		showPopup.value = false
	}
	const deleteTable = () => {
		uni.showModal({
			content: "确定要删除吗？",
			showCancel: true,
			success(res) {
				if (res.confirm) {
					uni.showToast({
						icon: "none",
						title: "删除成功"
					})
				}
			}
		})
	}

	// 确认出库
	const confirm = () => {
		if (printTypeCheck.value === 0) {
			showPrintContent.value = true
		}
	}
</script>

<template>
	<view class="common-page-container common-page">
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
					clearable class="input-item" v-model:selected="materielApplyDocSelected" multiple>
				</UpInputMaterielApplyDocPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="派工资料:" borderBottom labelWidth="90" style="padding: 0"
				v-if="typeSelect === 0">
				<UnInputProcessSendDocPicker @select="processSendDocSelect" border="none" placeholder="选择生产订单工序派工资料" readonly
					clearable class="input-item" v-model:selected="processSendDocSelected" multiple>
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
						<uni-th align="left" width="60rpx">序号</uni-th>
						<uni-th align="left" width="100rpx">物料编码</uni-th>
						<uni-th align="left" width="100rpx">物料名称</uni-th>
						<uni-th align="left" width="100rpx">数量信息</uni-th>
						<uni-th align="left" width="100rpx">货位信息</uni-th>
						<uni-th align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item)">
						<uni-td>{{ key + 1 }}</uni-td>
						<uni-td>{{ item.code }}</uni-td>
						<uni-td>{{ item.name }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td class="warning" @click.stop="deleteTable">删除</uni-td>
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
									<up-input border="none" placeholder="" clearable class="input-item" v-model="operateData.name"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="operateData.code"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="operateData.name"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="规格:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>
								<up-form-item class="common-form-item" label="计量单位:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>
								<up-form-item class="common-form-item" label="应入库数量:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>
								<up-form-item class="common-form-item" label="已入库数量:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>
								<up-form-item class="common-form-item" label="未入库数量:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>
								<up-form-item class="common-form-item" label="本次入库数量:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>

								<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">

								</up-form-item>

								<up-form-item class="common-form-item" label="出库日期:" borderBottom labelWidth="80" style="padding: 0">
									<UpInputDatePicker border="none" placeholder="选择出库日期" clearable class="input-item" readonly
										v-model:selected="dateSelected">
									</UpInputDatePicker>
								</up-form-item>
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

		<!-- 		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalSize" :current="searchParam.page"
				:pageSize="searchParam.size" @change="pageChange"></uni-pagination>
		</view> -->

		<PrintTypeCheck class="print-check-box" v-model="printTypeCheck"></PrintTypeCheck>

		<PrintContent class="" :showPrintContent="showPrintContent" @closePrintContent="closePrintContent"></PrintContent>

		<view class="btn-box">
			<up-button type="primary" text="提交出库" class="bottom-button" shape="circle" @click="confirm"></up-button>
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

	.print-check-box {
		margin-bottom: 10px;
	}
</style>