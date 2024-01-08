<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
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
	import UpInputStockroomPicker from "@/components/UpInputStockroomPicker.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	// import {
	// 	useTable
	// } from "@/hook/usePageTable"
	import {
		useDeepClone,
		useTimeFormat,
		useDebounce
	} from "@ultra-man/noa"
	// 接口
	import {
		getBusiness,
		getPositionInfo
	} from "@/api/business"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		nowFormat,
		batchFormat
	} from "@/store/common"
	// 类型
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
			url: routes.oOSDDefaultSetPage.path
		})
	}

	// --------------------------------------------------------------------------------初始化
	onMounted(() => {
		dateSelected.value = [nowFormat]
	})
	let config = ref < Obj > ({})
	onShow(() => {
		const configStr = uni.getStorageSync("oOSDDefaultSet")
		config.value = configStr ? JSON.parse(configStr) : {}
	})
	// 判断仓库是否开启货位管理，开启了才能选择货位
	const shelfSelectEnable = computed(() => {
		return config.value.stockroomSelected && config.value.stockroomSelected[0].bWhPos === "1"
	})

	// --------------------------------------------------------------------------------表单
	// 物料
	const materialInputValue = ref("")
	const materialSelected = ref < Business[] > ([])
	const materielSelect = (materiels: Business[]) => {}

	// 仓库选择
	// const stockroomText = ref("")
	// const stockroomSelect = (stockroom: Business[]) => {}
	// const stockroomSelected = ref < Business[] > ()

	const initForm = () => {
		return {
			invCode: "",
			invName: "",
			quantity: "",
			count: "",
			remark: "",
			position: "",
			cwhCode: "",
			shelfName: "",
			bInvBatch: "",
			batch: "",
			date: nowFormat
		}
	}
	// 表单
	const form = ref(initForm())

	// 库位扫码
	const shelfScanSuccess = useDebounce(async (code: string) => {
		if (code) {
			try {
				const res = await getPositionInfo({
					cPosCode: code
				})
				if (res && res.data) {
					form.value.position = res.data.cPosCode
					form.value.cwhCode = res.data.cWhCode
					form.value.shelfName = res.data.cWhName + res.data.cPosName
				} else {
					nextTick(() => {
						form.value.position = ""
						form.value.cwhCode = ""
						form.value.shelfName = ""
					})
					uni.showToast({
						title: "未查询到货位",
						icon: "none"
					})
				}
			} catch (err) {
				console.log(err)
			}
		}
	})

	// 日期
	const dateSelected = ref < string[] > ([])
	const dateSelect = (dates: string[]) => {
		if (dates.length) {
			form.value.date = dates[0]
		}
	}
	// --------------------------------------------------------------------------------表格
	// table实际展示的数据, 表格由前端自己维护
	const tableData = ref < Obj[] > ([])

	// 表格操作
	const open = (item: Obj, key: number) => {
		originData.value = item
		editData.value.index = key
		editData.value.batch = item.batch
		editData.value.quantity = item.count
		showPopup.value = true
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
	// --------------------------------------------------------------------------------弹窗
	const editData = ref < Obj > ({})
	const originData = ref < Obj > ({})
	const showPopup = ref(false)
	// 弹窗内货位码扫描成功
	const itemScanSuccess = useDebounce(async (code: string) => {
		if (code) {
			try {
				const res = await getPositionInfo({
					cPosCode: code
				})
				if (res && res.data) {
					originData.value.position = res.data.cPosCode
					originData.value.cwhCode = res.data.cWhCode
					originData.value.shelfName = res.data.cWhName + res.data.cPosName
				} else {
					nextTick(() => {
						originData.value.position = ""
						originData.value.cwhCode = ""
						originData.value.shelfName = ""
					})
					uni.showToast({
						title: "未查询到货位",
						icon: "none"
					})
				}
			} catch (err) {
				console.log(err)
			}
		}
	})
	const edit = () => {
		const value = Number(editData.value.quantity)
		const max = Number(originData.value.quantity)
		const min = 0
		if (value > max) {
			uni.showToast({
				icon: "none",
				title: "出库数量不能大于应出库数量"
			})
			return
		}
		if (value <= min) {
			uni.showToast({
				icon: "none",
				title: "出库数量不能小于0"
			})
			return
		}
		originData.value.batch = editData.value.batch
		originData.value.count = editData.value.quantity
	}
</script>

<template>
	<view class="common-page-container ">
		<CustomNavBar :title="routes.otherOutStockDoc.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view class="common-section-title">
			基本信息
		</view>

		<up-form class="common-form" labelPosition="left">

			<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputMaterielPicker @select="materielSelect" placeholder="扫码/手输物料编码" clearable class="input-item"
					v-model:selected="materialSelected" v-model="materialInputValue" scan>
				</UpInputMaterielPicker>
			</up-form-item>
			<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="80" style="padding: 0">
				<up-input border="none" placeholder="扫码或输入物料编码后,自动带出" clearable class="input-item" readonly></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">
				<up-input border="none" placeholder="U8若启用批次管理,则会自动生成" clearable class="input-item" readonly></up-input>
			</up-form-item>
			<up-form-item required class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input placeholder="扫码后,自动带出" clearable class="input-item" type="number"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="80" style="padding: 0">
				<up-input placeholder="请输入备注" clearable class="input-item"></up-input>
			</up-form-item>
			<!-- 			<up-form-item required class="common-form-item" label="仓库:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputStockroomPicker border="none" placeholder="默认值带出,可改" clearable class="input-item" readonly
					@select="stockroomSelect" v-model:selected="stockroomSelected" v-model="stockroomText">
				</UpInputStockroomPicker>
			</up-form-item> -->
			<up-form-item required class="common-form-item" label="货位:" borderBottom labelWidth="80" style="padding: 0"
				v-if="shelfSelectEnable">
				<up-input-scan placeholder="请扫货位码" clearable class="input-item" @scanSuccess="shelfScanSuccess"
					v-model="form.position"></up-input-scan>
			</up-form-item>
			<up-form-item class="common-form-item" label="货位名称:" borderBottom labelWidth="80" style="padding: 0"
				v-if="shelfSelectEnable">
				<up-input placeholder="仓库名称+货位名称" clearable class="input-item" v-model="form.shelfName"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="出库日期:" borderBottom labelWidth="80" style="padding: 0">
				<UpInputDatePicker border="none" placeholder="选择出库日期" clearable class="input-item" readonly
					v-model:selected="dateSelected" @select="dateSelect" :maxDate="Date.now()">
				</UpInputDatePicker>
			</up-form-item>
		</up-form>
		<view class="btn-box">
			<up-button type="primary" text="加入" class="bottom-button" shape="circle"></up-button>
		</view>

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
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key+1)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.invCode }}</uni-td>
						<uni-td class="nowrap">{{ item.invName }}</uni-td>
						<uni-td class="nowrap">{{ item.count }}</uni-td>
						<uni-td class="nowrap">{{ item.position }}</uni-td>
						<uni-td class="warning nowrap" @click.stop="deleteTable(key)">删除</uni-td>
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
									<up-input border="none" placeholder="" clearable class="input-item" v-model="editData.index" readonly>
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

								<up-form-item class="common-form-item" label="规格:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invStd"
										readonly>
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="计量单位:" borderBottom labelWidth="80" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.invUnit"
										readonly>
									</up-input>
								</up-form-item>

								<!-- 								<up-form-item class="common-form-item" label="已出库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item"
										v-model="originData.inStockQuantity" readonly type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="未出库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item"
										:modelValue="originData.poQuantity - originData.inStockQuantity" readonly type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="应出库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input border="none" placeholder="" clearable class="input-item" v-model="originData.quantity"
										readonly type="number">
									</up-input>
								</up-form-item> -->

								<up-form-item class="common-form-item" label="本次出库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="editData.quantity" type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="80" style="padding: 0"
									v-if="shelfSelectEnable">
									<up-input-scan placeholder="请扫货位码" clearable class="input-item" @scanSuccess="itemScanSuccess"
										v-model="originData.position" focus></up-input-scan>
								</up-form-item>

								<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="100" style="padding: 0"
									v-if="originData.bInvBatch === '1'">
									<up-input placeholder="" clearable class="input-item" v-model="editData.batch">
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
			<up-button type="primary" text="提交出库" class="bottom-button" shape="circle"></up-button>
		</view>

	</view>

</template>

<style scoped lang='scss'>
	.btn-box {
		margin-top: 10px
	}

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
</style>