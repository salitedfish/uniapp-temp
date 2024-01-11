<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		computed,
		onMounted,
		nextTick,
	} from 'vue';
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import UpInputDepPicker from "@/components/UpInputDepPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	import {
		useCheckEmptyInObj,
		useThrottle
	} from "@ultra-man/noa"
	import {
		onShow
	} from "@dcloudio/uni-app"
	// 接口
	import {
		getPurchaseArrivalList,
		confirmArrival,
		createQmInspectVoucher
	} from "@/api/purchaseArrival"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		nowFormat,
		batchFormat
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
	// nav右上角点击
	const rightClick = () => {
		uni.navigateTo({
			url: routes.pADefaultSetPage.path
		})
	}

	onShow(() => {
		if (depSelected.value.length <= 0) {
			const configStr = uni.getStorageSync("pADefaultSet")
			if (configStr) {
				const config = JSON.parse(configStr)
				depSelected.value = config.depSelected
			}
		}
	})

	onMounted(() => {
		dateSelected.value = [nowFormat]
	})

	// 扫描成功后如果有值则请求列表
	const codeText = ref("")
	const searching = ref(false)
	// 扫描带出供应商
	const supplier = ref < Obj > ({})
	// 选择的部门
	const depSelected = ref < Business[] > ([])
	// 日期
	const dateSelected = ref < string[] > ([])
	// 表格数据
	const tableData = ref < Obj[] > ([])
	// 表格操作
	const index = ref(0)
	const count = ref("")
	const originData = ref < Obj > ({})
	const showPopup = ref(false)
	// 提交完的弹窗
	const showCenterPopup = ref(false)
	const centerPopupTableData = ref < Obj[] > ([])
	// 确认到货
	const submiting = ref(false)


	// 扫码成功
	const scanSuccess = useThrottle(async (code: string) => {
		codeText.value = code
		if (code) {
			try {
				searching.value = true
				const result = await getPurchaseArrivalList({
					code
				})
				if (result.data.list.length > 0) {
					tableData.value = result.data.list
					for (const item of tableData.value) {
						item.count = item.quantity
						// 如果开启了批次管理则生成批次号
						if (item.bInvBatch === "1") {
							item.batch = item.supplierCode ? `${item.supplierCode}-${batchFormat}` : batchFormat
						}
					}
					supplier.value = tableData.value[0]
				}
			} catch (err) {
				nextTick(() => {
					codeText.value = ""
				})
				console.log(err)
			} finally {
				searching.value = false
			}
		}
	}, 3000)
	// 打开弹窗
	const open = (item: Obj, key: number) => {
		if (submiting.value) return
		originData.value = item
		count.value = item.count
		index.value = key
		showPopup.value = true
	}
	// 编辑完弹窗数据
	const edit = () => {
		const value = Number(count.value)
		const max = Number(originData.value.quantity)
		const min = 0
		if (value > max) {
			uni.showToast({
				icon: "none",
				title: "到货数量不能大于应到数量"
			})
			return
		}
		if (value <= min) {
			uni.showToast({
				icon: "none",
				title: "到货数量不能小于0"
			})
			return
		}
		originData.value.count = count.value
		showPopup.value = false
	}
	// 删除一行
	const deleteTable = (key: number) => {
		if (submiting.value) return
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
	// 重置所有数据
	const reset = () => {
		codeText.value = ""
		supplier.value = {}
		tableData.value = []
	}
	// 提交数据
	const submit = async () => {
		try {
			// 默认值检查
			const configStr = uni.getStorageSync("pADefaultSet")
			const config: Obj = configStr ? JSON.parse(configStr) : {}
			if (useCheckEmptyInObj([config.busTypeSelected, config.purTypeSelected], [])) {
				uni.showToast({
					title: "请填写完默认参数",
					icon: "none"
				})
				return
			}
			if (depSelected.value.length <= 0) {
				uni.showToast({
					title: "请选择部门",
					icon: "none"
				})
				return
			}
			// 开始处理生成到货单
			submiting.value = true
			uni.showLoading({
				title: "到货单生成中",
				icon: "none",
				mask: true
			})
			// 参数赋值
			const params = {
				billDate: dateSelected.value[0],
				busType: config.busTypeSelected[0].name,
				deptCode: depSelected.value[0].code,
				deptName: depSelected.value[0].name,
				list: tableData.value.map(item => {
					return {
						...item,
						quantity: item.count
					}
				}),
				purchaseTypeCode: config.purTypeSelected[0].code,
				purchaseTypeName: config.purTypeSelected[0].name,
			}
			// 请求生成到货单
			const res = await confirmArrival(params)
			// 开始处理生成来料报检单
			uni.showLoading({
				title: "报检单生成中",
				icon: "none",
				mask: true
			})
			const ree = await createQmInspectVoucher({
				arrivalVouchId: res.data
			})
			// 如果报检单返回的有数据，则显示报检数据弹窗
			if (ree && ree.data && ree.data.length > 0) {
				centerPopupTableData.value = ree.data
				showCenterPopup.value = true
			}
			reset()
			uni.showToast({
				title: "提交成功",
				icon: "none"
			})

		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
			submiting.value = false
		}
	}

	// 提交按钮可不可用
	const submitDisabled = computed(() => {
		if (!codeText.value || submiting.value || !supplier.value.supplierCode || tableData.value.length <= 0 ||
			depSelected.value.length <= 0 || dateSelected.value.length <= 0) {
			return true
		}
		return false
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.purchaseArrival.style.navigationBarTitleText" @rightClick="rightClick"></CustomNavBar>

		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="箱/托/发货单码:" borderBottom labelWidth="120" style="padding: 0">
					<up-input-scan v-model="codeText" placeholder="请扫箱/托/发货单码" clearable class="input-item"
						@scanSuccess="scanSuccess" focus></up-input-scan>
				</up-form-item>
				<up-form-item class="common-form-item" label="供应商:" borderBottom labelWidth="80" style="padding: 0">
					<up-input border="none" placeholder="扫码后自动带出供应商" clearable class="input-item" v-model="supplier.supplierName"
						readonly>
					</up-input>
				</up-form-item>
				<up-form-item class="common-form-item" label="部门:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDepPicker border="none" placeholder="选择部门" readonly clearable class="input-item"
						v-model:selected="depSelected">
					</UpInputDepPicker>
				</up-form-item>
				<up-form-item class="common-form-item" label="制单日期:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDatePicker border="none" placeholder="选择制单日期" clearable class="input-item" readonly
						v-model:selected="dateSelected" :maxDate="Date.now()">
					</UpInputDatePicker>
				</up-form-item>
			</up-form>
			<view class="common-section-title">
				到货信息明细
			</view>
		</view>
		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料编码</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料名称</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">数量信息</uni-th>
						<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.invCode}}</uni-td>
						<uni-td class="nowrap">{{ item.invName }}</uni-td>
						<uni-td class="nowrap primary">{{ item.count + item.invUnit }}</uni-td>
						<uni-td class="warning nowrap" @click.stop="deleteTable(key)">删除</uni-td>
					</uni-tr>
				</uni-table>

				<u-popup :show="showPopup" mode="right" @close="showPopup = false" safeAreaInsetTop>
					<view class="popup-content common-page-container" style="width: 85vw">
						<view class="common-section-title">
							到货详情信息
						</view>
						<view class="popup-form common-page-largest">
							<up-form class="common-form" labelPosition="left">
								<up-form-item class="common-form-item" label="行号:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" :modelValue="index + 1" readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invCode"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invName"
										readonly>
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="订单数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.poQuantity"
										readonly type="number">
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="已到数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item"
										v-model="originData.inStockQuantity" readonly type="number">
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="未到数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item"
										:modelValue="originData.poQuantity - originData.inStockQuantity" readonly type="number">
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="应到数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.quantity"
										readonly type="number">
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="本次到货数量:" borderBottom labelWidth="80" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="count" type="number">
									</up-input>
								</up-form-item>
								<up-form-item class="common-form-item" label="计量单位:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="supplier.invUnit"
										readonly>
									</up-input>
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
		<view class="btn-box">
			<up-button type="primary" text="确认到货" class="bottom-button" shape="circle" @click="submit" :loading="submiting"
				:disabled="submitDisabled"></up-button>
		</view>
	</view>

	<u-popup :show="showCenterPopup" round="10" mode="center" @close="showCenterPopup = false">
		<view style="width: 85vw" class="common-page-container center-popup">
			<view class="common-section-title">
				质检提示
			</view>
			<view class="tip">
				到货操作已完成，以下物料会同步生成报检单，请及时跟进处理
			</view>
			<view class="common-page-largest">
				<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
					<uni-tr>
						<uni-th align="left" width="60rpx">序号</uni-th>
						<uni-th align="left" width="100rpx">物料编码</uni-th>
						<uni-th align="left" width="100rpx">物料名称</uni-th>
					</uni-tr>
					<uni-tr v-for="item,key in centerPopupTableData" :key="key">
						<uni-td>{{ key + 1 }}</uni-td>
						<uni-td>{{ item.invCode}}</uni-td>
						<uni-td>{{ item.invName }}</uni-td>
					</uni-tr>
				</uni-table>
			</view>
			<view class="btn-box">
				<up-button type="primary" text="确认" class="bottom-button" shape="circle"
					@click="showCenterPopup = false"></up-button>
			</view>
		</view>
	</u-popup>

</template>

<style scoped lang='scss'>
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

	.center-popup {
		padding-bottom: 10px;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		max-height: 80vh;

		.common-page-largest {
			margin: 10px 0;
		}

		.tip {
			color: v-bind("globalColor.primary");
			font-size: 24rpx;
			text-indent: 48rpx;
		}
	}
</style>