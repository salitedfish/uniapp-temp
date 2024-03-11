<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		watch,
		onMounted,
		computed,
		nextTick
	} from 'vue';
	import {
		onShow
	} from "@dcloudio/uni-app"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import StockTypeCheck from "./components/StockTypeCheck.vue"
	import UpInputArrivalDocPicker from "@/components/UpInputArrivalDocPicker.vue"
	import UpInputTestDocPicker from "@/components/UpInputTestDocPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	import {
		useCheckEmptyInObj,
		useThrottle
	} from "@ultra-man/noa"
	// 接口
	import {
		getPurchaseArrivalList,
		getArrivalVouchList,
		purchaseStockroomSubmit,
		getTestVouchList
	} from "@/api/purchaseArrival"
	import {
		getPositionInfo
	} from "@/api/business"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		globalColor
	} from "@/store/theme"
	import {
		nowFormat,
		batchFormat
	} from "@/store/common"
	// 类型
	import type {
		PageListApi
	} from "@/type/common"
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

	// -------------------------------------------------------------------------------------初始化
	onMounted(() => {
		dateSelected.value = [nowFormat]
	})
	let config = ref < Obj > ({})
	onShow(() => {
		const configStr = uni.getStorageSync("pSDefaultSet")
		config.value = configStr ? JSON.parse(configStr) : {}
	})
	// 判断仓库是否开启货位管理，开启了才能选择货位
	const shelfSelectEnable = computed(() => {
		return config.value.stockroomSelected && config.value.stockroomSelected[0]?.bWhPos === "1"
	})
	// -------------------------------------------------------------------------------------表单操作
	const typeSelect = ref(2)
	const searching = ref(false)
	const scanAnyText = ref("")
	const arrivalDocSelected = ref < Obj[] > ([])
	const testDocSelected = ref < Obj[] > ([])
	const dateSelected = ref < string[] > ([])
	// 加载数据
	const loadData = async (params: Obj, api: PageListApi) => {
		try {
			searching.value = true
			const result = await api(params)
			if (result.data.list.length > 0) {
				// 循环处理数据
				for (const item of result.data.list) {
					item.quantity = Number(item.quantity)
					item.inStockQuantity = Number(item.inStockQuantity)
					item.rdQuantity = Number(item.rdQuantity)
					item.poQuantity = Number(item.poQuantity)
					item.count = item.quantity
					if (item.binvBatch === '1') {
						item.batch = item.supplierCode ? `${item.supplierCode}-${batchFormat}` : batchFormat
					}
				}
				/**
				 * 筛选不需要质检的数据
				 */
				tableData.value = result.data.list.filter(item => item.bgsp !== "1")
				/**
				 * 筛选需要质检的数据
				 * 如果有则弹窗提醒
				 */
				centerPopupTableData.value = result.data.list.filter(item => item.bgsp === "1")
				if (centerPopupTableData.value.length > 0) {
					showCenterPopup.value = true
				}
			}
		} catch (err) {
			console.log(err)
		} finally {
			searching.value = false
		}
	}
	// 箱/托/发货单码
	const scanAnySuccess = useThrottle(async (code: string) => {
		if (code) {
			scanAnyText.value = code
			await loadData({
				code,
				type: "rd"
			}, getPurchaseArrivalList)
		}
	}, 3000)
	// 扫货单情况
	const arrivalDocSelect = (res: Obj[]) => {
		if (res && res.length) {
			loadData({
				cCode: res[0].ccode
			}, getArrivalVouchList)
		}
	}
	// 扫检验单情况
	const testDocSelect = (res: Obj[]) => {
		if (res && res.length) {
			loadData({
				cCode: res[0].checkCode
			}, getTestVouchList)
		}
	}
	watch(typeSelect, () => {
		reset()
	})
	const reset = () => {
		scanAnyText.value = ""
		arrivalDocSelected.value = []
		testDocSelected.value = []
		tableData.value = []
	}
	const getTypeText = () => {
		switch (typeSelect.value) {
			case 0:
				return "采购订单"
			case 1:
				return "到货单"
			case 2:
				return "检验单"
		}
	}
	// -------------------------------------------------------------------------------------表格操作
	const tableData = ref < Obj[] > ([])

	const open = (item: Obj, key: number) => {
		index.value = key
		originData.value = item
		count.value = item.count
		bInvBatch.value = item.batch
		showPopup.value = true
	}

	// 删除行
	const deleteTable = (index: number) => {
		uni.showModal({
			content: "确定要删除吗？",
			showCancel: true,
			success(res) {
				if (res.confirm) {
					tableData.value.splice(index, 1)
					uni.showToast({
						icon: "none",
						title: "删除成功"
					})
				}
			}
		})
	}
	// -------------------------------------------------------------------------------------弹窗操作
	const index = ref(0)
	const count = ref("")
	const bInvBatch = ref("")
	const originData = ref < Obj > ({})
	const showPopup = ref(false)
	const itemScanSuccess = useThrottle(async (code: string) => {
		if (code) {
			try {
				const res = await getPositionInfo({
					cPosCode: originData.value.position
				})
				if (res && res.data) {
					originData.value.position = res.data.cPosCode
					originData.value.cwhCode = res.data.cWhCode
				} else {
					nextTick(() => {
						originData.value.position = ""
						originData.value.cwhCode = ""
					})
					// uni.showToast({
					// 	title: "未查询到货位",
					// 	icon: "none"
					// })
					uni.showModal({
						title: '提示',
						content: "未查询到货位"
					});
				}
			} catch (err) {
				console.log(err)
			}
		}
	})
	// 编辑行
	const edit = () => {
		const value = Number(count.value)
		const max = Number(originData.value.quantity)
		const min = 0
		if (value > max) {
			// uni.showToast({
			// 	icon: "none",
			// 	title: "入库数量不能大于应入库数量"
			// })
			uni.showModal({
				title: '提示',
				content: "入库数量不能大于应入库数量"
			});
			return
		}
		if (value <= min) {
			// uni.showToast({
			// 	icon: "none",
			// 	title: "入库数量不能小于0"
			// })
			uni.showModal({
				title: '提示',
				content: "入库数量不能小于0"
			});
			return
		}
		originData.value.batch = bInvBatch.value
		originData.value.count = count.value
		showPopup.value = false
	}
	// -------------------------------------------------------------------------------------检验提示弹窗
	const showCenterPopup = ref(false)
	const centerPopupTableData = ref < Obj[] > ([])
	// -------------------------------------------------------------------------------------提交操作
	const submiting = ref(false)
	// 提交数据
	const submit = async () => {
		try {
			// 默认值检查
			if (useCheckEmptyInObj([config.value.stockroomSaveTypeSelected, config.value.stockroomSelected], [])) {
				// uni.showToast({
				// 	title: "请填写完默认参数",
				// 	icon: "none"
				// })
				uni.showModal({
					title: '提示',
					content: "请填写完默认参数"
				});
				return
			}
			// 库位填写检查
			if (shelfSelectEnable.value) {
				for (const key in tableData.value) {
					const item = tableData.value[key]
					if (!item.position) {
						// uni.showToast({
						// 	icon: "none",
						// 	title: `第${Number(key)+1}行货位未填写`
						// })
						uni.showModal({
							title: '提示',
							content: `第${Number(key)+1}行货位未填写`,
						});
						return
					}
					if (item.cwhCode !== config.value.stockroomSelected[0].code) {
						// uni.showToast({
						// 	icon: "none",
						// 	title: `第${Number(key)+1}行，默认仓库没有该货位，请确认后再试`
						// })
						uni.showModal({
							title: '提示',
							content: `第${Number(key)+1}行，默认仓库没有该货位，请确认后再试`,
						});
						return
					}
				}
			}

			// 开始提交
			submiting.value = true
			uni.showLoading({
				title: "提交中",
				icon: "none",
				mask: true,
			})
			const params = {
				body: tableData.value.map(item => {
					return {
						...item,
						quantity: item.count
					}
				}),
				type: getTypeText(),
				head: {
					cdepcode: config.value.depSelected.length > 0 ? config.value.depSelected[0].code : "",
					crdcode: config.value.stockroomSaveTypeSelected[0].code,
					ddate: dateSelected.value[0],
					cwhcode: config.value.stockroomSelected[0].code
				}
			}
			await purchaseStockroomSubmit(params)

			reset()
			uni.showToast({
				title: "入库成功",
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
		if (submiting.value || tableData.value.length <= 0 ||
			dateSelected.value.length <= 0) {
			return true
		}
		return false
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.purchaseStockroom.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<StockTypeCheck v-model="typeSelect" class="tab-box"></StockTypeCheck>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="箱/发货单码:" borderBottom labelWidth="120" style="padding: 0"
				v-if="typeSelect === 0">
				<up-input-scan v-model="scanAnyText" placeholder="请扫箱/发货单码" clearable class="input-item"
					@scanSuccess="scanAnySuccess" focus></up-input-scan>
			</up-form-item>
			<up-form-item class="common-form-item" label="到货单:" borderBottom labelWidth="80" style="padding: 0"
				v-if="typeSelect === 1">
				<UpInputArrivalDocPicker @select="arrivalDocSelect" border="none" placeholder="选择到货单" readonly clearable
					class="input-item" v-model:selected="arrivalDocSelected">
				</UpInputArrivalDocPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="检验单:" borderBottom labelWidth="80" style="padding: 0"
				v-if="typeSelect === 2">
				<UpInputTestDocPicker @select="testDocSelect" border="none" placeholder="选择检验单" readonly clearable
					class="input-item" v-model:selected="testDocSelected"></UpInputTestDocPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="入库日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择入库日期" clearable class="input-item" readonly
					v-model:selected="dateSelected" :maxDate="Date.now()">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>

		<view class="common-section-title">
			本次入库明细
		</view>

		<view class="table-box ">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
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
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key+1)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.invCode }}</uni-td>
						<uni-td class="nowrap">{{ item.invName }}</uni-td>
						<uni-td class="nowrap primary">{{ item.count + item.invUnit }}</uni-td>
						<uni-td class="nowrap">{{ item.position }}</uni-td>
						<uni-td class="warning nowrap" @click.stop="deleteTable(key)">删除</uni-td>
					</uni-tr>
				</uni-table>

				<u-popup :show="showPopup" mode="right" @close="showPopup = false" safeAreaInsetTop>
					<view class="popup-content common-page-container" style="width: 85vw">
						<view class="common-section-title">
							入库详情信息
						</view>
						<view class="popup-form common-page-largest">
							<up-form class="common-form" labelPosition="left">
								<up-form-item class="common-form-item" label="行号:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="index" readonly>
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invCode"
										readonly>
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invName"
										readonly>
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="规格:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invStd"
										readonly>
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="计量单位:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invUnit"
										readonly>
									</up-input>
								</up-form-item>

								<!-- 								<up-form-item class="common-form-item" label="订单数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.poQuantity"
										readonly type="number">
									</up-input>
								</up-form-item> -->

								<up-form-item class="common-form-item" label="已入库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item"
										:modelValue="originData.inStockQuantity || originData.rdQuantity" readonly type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="未入库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" :modelValue="originData.quantity"
										readonly type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="应入库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.quantity"
										readonly type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="本次入库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="count" type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="100" style="padding: 0"
									v-if="shelfSelectEnable">
									<up-input-scan placeholder="请扫货位码" clearable class="input-item" @scanSuccess="itemScanSuccess"
										v-model="originData.position" focus></up-input-scan>
								</up-form-item>

								<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="100" style="padding: 0"
									v-if="originData.binvBatch === '1'">
									<up-input placeholder="" clearable class="input-item" v-model="bInvBatch">
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
			<up-button type="primary" text="提交入库" class="bottom-button" shape="circle" @click="submit"
				:disabled="submitDisabled"></up-button>
		</view>

	</view>

	<u-popup :show="showCenterPopup" round="10" mode="center" @close="showCenterPopup = false">
		<view style="width: 85vw" class="common-page-container center-popup">
			<view class="common-section-title">
				质检提示
			</view>
			<view class="tip">
				检测到部分物料未完成质检，请确认后再试！
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