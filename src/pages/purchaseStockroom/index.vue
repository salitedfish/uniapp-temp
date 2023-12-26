<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		watch,
		onMounted
	} from 'vue';
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import StockTypeCheck from "./components/StockTypeCheck.vue"
	import UpInputArrivalDocPicker from "@/components/UpInputArrivalDocPicker.vue"
	import UpInputTestDocPicker from "@/components/UpInputTestDocPicker.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	// import {
	// 	useTable
	// } from "@/hook/usePageTable"
	import {
		useDeepClone,
		useTimeFormat
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
			url: routes.pSDefaultSetPage.path
		})
	}

	onMounted(() => {
		dateSelected.value = [useTimeFormat("{YYYY}-{MM}-{dd}")(Date.now()).format]
	})

	// tab切换
	const typeSelect = ref(0)
	watch(typeSelect, () => {
		scanText.value = ""
		arrivalDocSelected.value = []
		testDocSelected.value = []
		tableData.value = []
	})

	// 物料扫码情况
	// const materialInputValue = ref("")
	// const materialSelected = ref < Materiel[] > ([])
	// const materielSelect = (materiels: Materiel[]) => {}
	// 箱/托/发货单码
	const scanAnyText = ref("")
	const scanAnySuccess = () => {}

	// 货位扫码
	const scanText = ref("")
	const scanSuccess = (res: string) => {
		if (res) {
			scanText.value = res
			// todo请求列表
		}
	}

	// 扫货单情况
	const arrivalDocSelected = ref([])
	const arrivalDocSelect = () => {
		// todo请求列表
	}

	// 扫检验单情况
	const testDocSelected = ref([])
	const testDocSelect = () => {
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
	}, {
		code: "2",
		name: "物料2",
		num: 200
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
	const itemScanSuccess = (res: string) => {
		operateData.value.code = res
	}
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
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.purchaseStockroom.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<StockTypeCheck v-model="typeSelect" class="tab-box"></StockTypeCheck>

		<up-form class="common-form" labelPosition="left" v-show="typeSelect === 0">
			<up-form-item class="common-form-item" label="箱/托/发货单码:" borderBottom labelWidth="120" style="padding: 0">
				<!-- 				<UpInputMaterielPicker @select="materielSelect" placeholder="请扫箱/托/发货单码" clearable class="input-item"
					v-model:selected="materialSelected" v-model="materialInputValue" scan>
				</UpInputMaterielPicker> -->
				<up-input-scan v-model="scanAnyText" border="none" placeholder="请扫箱/托/发货单码" clearable class="input-item"
					@scanSuccess="scanAnySuccess" readonly></up-input-scan>
			</up-form-item>
			<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="100" style="padding: 0">
				<up-input border="none" placeholder="扫码后,自动带出" clearable class="input-item" readonly></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="100" style="padding: 0">
				<up-input border="none" placeholder="扫码后,自动带出" clearable class="input-item" readonly></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="100" style="padding: 0">
				<up-input border="none" placeholder="U8若启用批次管理,则会自动生成" clearable class="input-item" readonly></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="发货单号:" borderBottom labelWidth="100" style="padding: 0">
				<up-input border="none" placeholder="扫码后,自动带出" clearable class="input-item" readonly></up-input>
			</up-form-item>
			<up-form-item required class="common-form-item" label="数量:" borderBottom labelWidth="100" style="padding: 0">
				<up-input placeholder="扫码后,自动带出" clearable class="input-item" type="number"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="100" style="padding: 0">
				<up-input placeholder="请输入备注" clearable class="input-item"></up-input>
			</up-form-item>
			<up-form-item required class="common-form-item" label="货位:" borderBottom labelWidth="100" style="padding: 0">
				<up-input-scan border="none" placeholder="请扫货位码" clearable class="input-item" @scanSuccess="scanSuccess"
					readonly></up-input-scan>
			</up-form-item>
			<up-form-item class="common-form-item" label="货位名称:" borderBottom labelWidth="100" style="padding: 0">
				<up-input placeholder="仓库名称+货位名称" clearable class="input-item"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="入库日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择入库日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>

		<view class="btn-box">
			<up-button type="primary" text="加入" class="bottom-button" shape="circle" v-show="typeSelect === 0"></up-button>
		</view>

		<up-form class="common-form" labelPosition="left" v-show="typeSelect === 1">
			<up-form-item class="common-form-item" label="到货单:" borderBottom labelWidth="60" style="padding: 0">
				<UpInputArrivalDocPicker @select="arrivalDocSelect" border="none" placeholder="选择到货单" readonly clearable
					class="input-item" v-model:selected="arrivalDocSelected" multiple></UpInputArrivalDocPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="入库日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择入库日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>

		<up-form class="common-form" labelPosition="left" v-show="typeSelect === 2">
			<up-form-item class="common-form-item" label="检验单:" borderBottom labelWidth="60" style="padding: 0">
				<UpInputTestDocPicker @select="testDocSelect" border="none" placeholder="选择检验单" readonly clearable
					class="input-item" v-model:selected="testDocSelected" multiple></UpInputTestDocPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="入库日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择入库日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>

		<view class="common-section-title">
			本次入库明细
		</view>

		<view class="table-box ">
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
							入库详情信息
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

								<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="80" style="padding: 0">
									<up-input-scan border="none" placeholder="请扫货位码" clearable class="input-item"
										@scanSuccess="itemScanSuccess" readonly v-model="operateData.code"></up-input-scan>
								</up-form-item>

								<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">
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

		<view class="btn-box">
			<up-button type="primary" text="提交入库" class="bottom-button" shape="circle"></up-button>
		</view>

	</view>

</template>

<style scoped lang='scss'>
	.tab-box {
		margin-bottom: 10px
	}

	.btn-box {
		margin-top: 10px;
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
</style>