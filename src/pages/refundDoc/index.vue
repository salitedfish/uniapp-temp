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
	import RefundTypeCheck from "./components/RefundTypeCheck.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputOutSrDocPicker from "@/components/UpInputOutSrDocPicker.vue"
	import UpInputDeliveryDocPicker from "@/components/UpInputDeliveryDocPicker.vue"
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
		Materiel,
		DeliveryDoc,
		OutSrDoc
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const rightClick = () => {
		uni.navigateTo({
			url: routes.rDDefaultSetPage.path
		})
	}

	onMounted(() => {
		dateSelected.value = [useTimeFormat("{YYYY}-{MM}-{dd}")(Date.now()).format]
	})

	// tab切换
	const typeSelect = ref(0)
	watch(typeSelect, () => {
		deliveryDocSelected.value = []
		outSrDocSelected.value = []
		tableData.value = []
	})

	// 发货单
	const deliveryDocInputValue = ref("")
	const deliveryDocSelected = ref < DeliveryDoc[] > ([])
	const deliveryDocSelect = (deliveryDocs: DeliveryDoc[]) => {}

	// 出库单
	const outSrDocInputValue = ref("")
	const outSrDocSelected = ref([])
	const outSrDocSelect = () => {
		// todo请求列表
	}

	// 扫码
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
		<CustomNavBar :title="routes.refundDoc.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<RefundTypeCheck v-model="typeSelect" class="tab-box"></RefundTypeCheck>

		<up-form class="common-form" labelPosition="left" v-show="[0, 1].includes(typeSelect)">
			<up-form-item class="common-form-item" label="发货单:" borderBottom labelWidth="80" style="padding: 0"
				v-show="typeSelect === 0">
				<UpInputDeliveryDocPicker @select="deliveryDocSelect" placeholder="选择发货单" class="input-item"
					v-model:selected="deliveryDocSelected" v-model="deliveryDocInputValue" readonly border="none">
				</UpInputDeliveryDocPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="出库单:" borderBottom labelWidth="80" style="padding: 0"
				v-show="typeSelect === 1">
				<UpInputOutSrDocPicker @select="outSrDocSelect" placeholder="选择出库单" class="input-item"
					v-model:selected="outSrDocSelected" v-model="outSrDocInputValue" readonly border="none">
				</UpInputOutSrDocPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="退货日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择退货日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="业务类型:" borderBottom labelWidth="80" style="padding: 0" required>
			</up-form-item>

			<up-form-item class="common-form-item" label="销售类型:" borderBottom labelWidth="80" style="padding: 0" required>
			</up-form-item>

			<up-form-item class="common-form-item" label="销售部门:" borderBottom labelWidth="80" style="padding: 0" required>
			</up-form-item>

			<up-form-item class="common-form-item" label="仓库名称:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="客户名称:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

		</up-form>

		<view class="btn-box">
			<up-button type="primary" text="加入" class="bottom-button" shape="circle"
				v-show="[0, 1].includes(typeSelect)"></up-button>
		</view>

		<up-form class="common-form" labelPosition="left" v-show="typeSelect === 2">
			<up-form-item class="common-form-item" label="物料扫码:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="退货数量:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="退货日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择退货日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="业务类型:" borderBottom labelWidth="80" style="padding: 0" required>
			</up-form-item>

			<up-form-item class="common-form-item" label="销售类型:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="销售部门:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="仓库名称:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>

			<up-form-item class="common-form-item" label="客户名称:" borderBottom labelWidth="80" style="padding: 0">
			</up-form-item>
		</up-form>

		<view class="common-section-title" v-if="typeSelect !== 2">
			退库明细
		</view>

		<view class="table-box " v-if="typeSelect !== 2">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th align="left" width="60rpx">序号</uni-th>
						<uni-th align="left" width="100rpx">物料编码</uni-th>
						<uni-th align="left" width="100rpx">物料名称</uni-th>
						<uni-th align="left" width="100rpx">数量</uni-th>
						<uni-th align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item)">
						<uni-td>{{ key + 1 }}</uni-td>
						<uni-td>{{ item.code }}</uni-td>
						<uni-td>{{ item.name }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td class="warning" @click.stop="deleteTable">删除</uni-td>
					</uni-tr>
				</uni-table>

				<u-popup :show="showPopup" mode="right" @close="showPopup = false" safeAreaInsetTop>
					<view class="popup-content common-page-container" style="width: 85vw">
						<view class="common-section-title">
							退货详情信息
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

								<up-form-item class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="operateData.name"> </up-input>
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
			<up-button type="primary" text="提交退货" class="bottom-button" shape="circle"></up-button>
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