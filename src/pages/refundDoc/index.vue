<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		watch,
		onMounted,
		computed,
	} from 'vue';
	import {
		onShow
	} from "@dcloudio/uni-app"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputCustomerPicker from "@/components/UpInputCustomerPicker.vue"
	import UpInputOutSrDocPicker from "@/components/UpInputOutSrDocPicker.vue"
	import UpInputDeliveryDocPicker from "@/components/UpInputDeliveryDocPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import RefundTypeCheck from "./components/RefundTypeCheck.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	// 工具
	import {
		useTimeFormat,
		useCheckEmptyInObj,
		useThrottle
	} from "@ultra-man/noa"
	// 接口
	import {
		refundSubmit,
		getBusiness
	} from "@/api/business"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 类型
	import {
		PickerTypeId
	} from "@/type/business"
	import type {
		Business
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
	let config = ref < Obj > ({})
	onShow(() => {
		const configStr = uni.getStorageSync("rDDefaultSet")
		config.value = configStr ? JSON.parse(configStr) : {}
	})

	// tab切换
	const typeSelect = ref(0)
	watch(typeSelect, () => {
		deliveryDocSelected.value = []
		outSrDocSelected.value = []
		form.value = {}
		// customerSelected.value = []
		tableData.value = []
	})

	// 发货单
	const deliveryDocSelected = ref < Obj[] > ([])
	const deliveryDocSelect = (deliveryDocs: Obj[]) => {
		if (deliveryDocs.length > 0) {
			tableData.value = deliveryDocs
			tableData.value[0].count = Number(tableData.value[0].iquantity)
		}
	}

	// 出库单
	const outSrDocInputValue = ref("")
	const outSrDocSelected = ref < Obj[] > ([])
	const outSrDocSelect = () => {
		// todo请求列表
	}

	// 物料扫码
	const form = ref < Obj > ({})
	const procuctScanSuccess = useThrottle(async (code: string) => {
		if (code) {
			try {
				const res = await getBusiness({
					id: PickerTypeId.MATERIAL,
					code: code
				})
				if (res && res.data.list.length > 0) {
					form.value.cinvcode = code
					form.value.count = ""
					// 表单数据推入到待提交数据中
					tableData.value = [form.value]
				} else {
					// uni.showToast({
					// 	title: "未查询到物料",
					// 	icon: "none"
					// })
					uni.showModal({
						title: '提示',
						content: "未查询到物料",
					});
					form.value = {}
					tableData.value = []
				}
			} catch (err) {
				console.log(err)
			}
		}
	}, 2000)
	// 查找参数
	// const scanSearchParams = ref < Obj > ({
	// 	searchKey: "code",
	// 	customerCode: ""
	// })
	// const materialSelected = ref < Obj[] > ([])
	// const materialSelect = (res: Obj[]) => {
	// 	if (res.length > 0) {
	// 		form.value = res[0]
	// 		form.value.cinvcode = form.value.cInvCode
	// 		form.value.batch = form.value.cbatch
	// 		form.value.count = ""

	// 		tableData.value = [form.value]
	// 	}
	// }

	// 日期
	const dateSelected = ref < string[] > ([])

	// 客户选择
	const customerSelected = ref < Business[] > ([])
	const customerSelect = (res: Business[]) => {
		// if (res.length > 0) {
		// 	scanSearchParams.value.customerCode = res[0].code
		// }
	}

	// table实际展示的数据, 表格由前端自己维护
	const tableData = ref < Obj[] > ([])

	// 表格操作
	const operateData = ref < Obj > ({
		index: 0,
		count: ""
	})
	const originData = ref < Obj > ({})
	const showPopup = ref(false)
	const open = (item: Obj, key: number) => {
		operateData.value.count = item.count
		operateData.value.index = key
		originData.value = item
		showPopup.value = true
	}

	const edit = () => {
		const value = Number(operateData.value.count)
		const max = Number(originData.value.iquantity)
		const min = 0
		if (value > max) {
			// uni.showToast({
			// 	icon: "none",
			// 	title: "退货数量不能大于可退货数量"
			// })
			uni.showModal({
				title: '提示',
				content: "退货数量不能大于可退货数量",
			});
			return
		}
		if (value <= min) {
			// uni.showToast({
			// 	icon: "none",
			// 	title: "退货数量不能小于0"
			// })
			uni.showModal({
				title: '提示',
				content: "退货数量不能小于0",
			});
			return
		}
		originData.value.count = value
		showPopup.value = false
	}
	const deleteTable = (key: number) => {
		uni.showModal({
			content: "确定要删除吗？",
			showCancel: true,
			success(res) {
				if (res.confirm) {
					tableData.value.splice(key, 1)
					uni.showToast({
						icon: "none",
						title: "删除成功"
					})
				}
			}
		})
	}

	const submiting = ref(false)
	const submit = async () => {
		try {
			// 默认值检查
			if (useCheckEmptyInObj([config.value.busTypeSelected, config.value.saleTypeSelected, config.value
					.stockroomSelected, config.value.depSelected
				], [])) {
				// uni.showToast({
				// 	title: "请填写完默认参数",
				// 	icon: "none"
				// })
				uni.showModal({
					title: '提示',
					content: "请填写完默认参数",
				});
				return
			}
			if (useCheckEmptyInObj([customerSelected.value], [])) {
				// uni.showToast({
				// 	title: "请选择客户",
				// 	icon: "none"
				// })
				uni.showModal({
					title: '提示',
					content: "请选择客户",
				});
				return
			}
			for (const item of tableData.value) {
				if (Number(item.count) <= 0) {
					// uni.showToast({
					// 	title: "退货数量必须大于0",
					// 	icon: "none"
					// })
					uni.showModal({
						title: '提示',
						content: "退货数量必须大于0",
					});
					return
				}
			}
			submiting.value = true
			uni.showLoading({
				title: "提交退货中",
				mask: true
			})

			const params = {
				body: tableData.value.map(item => {
					return {
						...item,
						iquantity: item.count
					}
				}),
				head: {
					cbustype: config.value.busTypeSelected[0].name,
					cdepcode: config.value.depSelected[0].code,
					ccuscode: customerSelected.value[0].code,
					cstcode: config.value.saleTypeSelected[0].code,
					date: dateSelected.value[0],
					whcode: config.value.stockroomSelected[0].code
				},
				type: typeSelect.value === 0 ? "SO_SOMain_DispatchList" : ""
			}
			await refundSubmit(params)

			uni.showToast({
				title: "退货成功",
				icon: "none",
			})

			deliveryDocSelected.value = []
			outSrDocSelected.value = []
			form.value = {}
			tableData.value = []
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
			submiting.value = false
		}
	}
	const submitDisabled = computed(() => {
		return tableData.value.length <= 0 || submiting.value
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.refundDoc.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<RefundTypeCheck v-model="typeSelect" class="tab-box"></RefundTypeCheck>

		<up-form class="common-form" labelPosition="left" v-if="[0, 1].includes(typeSelect)">
			<up-form-item class="common-form-item" label="发货单:" borderBottom labelWidth="80" style="padding: 0"
				v-show="typeSelect === 0">
				<UpInputDeliveryDocPicker @select="deliveryDocSelect" placeholder="选择发货单" class="input-item"
					v-model:selected="deliveryDocSelected" readonly border="none">
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

			<up-form-item class="common-form-item" label="客户名称:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputCustomerPicker border="none" placeholder="选择U8客户" readonly clearable class="input-item"
					v-model:selected="customerSelected" search @select="customerSelect">
				</UpInputCustomerPicker>
			</up-form-item>

		</up-form>

		<!-- 		<view class="btn-box">
			<up-button type="primary" text="加入" class="bottom-button" shape="circle"
				v-show="[0, 1].includes(typeSelect)"></up-button>
		</view> -->

		<up-form class="common-form" labelPosition="left" v-if="typeSelect === 2">

			<up-form-item class="common-form-item" label="物料扫码:" borderBottom labelWidth="80" style="padding: 0">
				<up-input-scan placeholder="扫码后,自动带出" clearable class="input-item" @scanSuccess="procuctScanSuccess"
					v-model="form.cinvCode" focus></up-input-scan>

				<!-- 				<UpInputMaterielPicker @select="materialSelect" placeholder="扫码/手输物料编码" clearable class="input-item"
					v-model:selected="materialSelected" v-model="form.cinvcode" scan2 :scanSearchParams="scanSearchParams" focus>
				</UpInputMaterielPicker> -->
			</up-form-item>

			<!-- 			<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">
				<up-input placeholder="请输入批次号" clearable class="input-item" v-model="form.batch"> </up-input>
			</up-form-item> -->

			<up-form-item class="common-form-item" label="退货数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input placeholder="请输入退货数量" clearable class="input-item" v-model="form.count" type="number"> </up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="退货日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择退货日期" clearable class="input-item" readonly
					v-model:selected="dateSelected">
				</UpInputDatePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="客户名称:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputCustomerPicker border="none" placeholder="选择U8客户" readonly clearable class="input-item"
					v-model:selected="customerSelected" search @select="customerSelect">
				</UpInputCustomerPicker>
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
						<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料编码</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料名称</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">数量</uni-th>
						<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key + 1)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.cinvcode }}</uni-td>
						<uni-td class="nowrap">{{ item.cinvname }}</uni-td>
						<uni-td class="nowrap primary">{{ item.count}}</uni-td>
						<uni-td class="nowrap warning" @click.stop="deleteTable(key)">删除</uni-td>
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

								<up-form-item class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="operateData.count"> </up-input>
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
			<up-button type="primary" text="提交退货" class="bottom-button" shape="circle" :disabled="submitDisabled"
				@click="submit" :loading="submiting"></up-button>
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