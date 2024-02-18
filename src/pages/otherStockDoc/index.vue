<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		computed,
		onMounted,
		nextTick
	} from 'vue';
	import {
		onShow
	} from "@dcloudio/uni-app"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	import {
		useCheckEmptyInObj,
		useThrottle
	} from "@ultra-man/noa"
	import {
		splitCodes
	} from "@/util/common"
	// 接口
	import {
		getBusiness,
		getPositionInfo,
		addRdRecord08
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
	import {
		PickerTypeId
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const rightClick = () => {
		uni.navigateTo({
			url: routes.oSDDefaultSetPage.path
		})
	}

	// -------------------------------------------------------------------------------------初始化
	let config = ref < Obj > ({})
	onShow(() => {
		const configStr = uni.getStorageSync("oSDDefaultSet")
		config.value = configStr ? JSON.parse(configStr) : {}
	})
	onMounted(() => {
		dateSelected.value = [nowFormat]
	})
	// 判断仓库是否开启货位管理，开启了才能选择货位
	const shelfSelectEnable = computed(() => {
		return config.value.stockroomSelected && config.value.stockroomSelected[0]?.bWhPos === "1"
	})
	// -------------------------------------------------------------------------------------表单操作
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
	// 物料扫码
	const procuctScanSuccess = useThrottle(async (code: string) => {
		if (code) {
			try {
				const codeInfo = splitCodes(code)
				nextTick(() => {
					form.value.invCode = codeInfo.code
				})
				const res = await getBusiness({
					id: PickerTypeId.MATERIAL,
					code: codeInfo.code
				})
				if (res && res.data.list.length > 0) {
					if (res.data.list[0].bInvBatch === '1') {
						// 如果开启了批次管理
						form.value.batch = codeInfo.batch
					}
					form.value.quantity = codeInfo.quantity
					form.value.count = form.value.quantity
					form.value.invName = res.data.list[0].name
					form.value.bInvBatch = res.data.list[0].bInvBatch
				} else {
					uni.showToast({
						title: "未查询到物料",
						icon: "none"
					})
					form.value = initForm()
				}
			} catch (err) {
				console.log(err)
			}
		}
	}, 2000)
	// 货位扫码
	const shelfScanSuccess = useThrottle(async (code: string) => {
		if (code) {
			try {
				const res = await getPositionInfo({
					cPosCode: code
				})
				if (res && res.data) {
					if (res.data.cWhCode !== config.value.stockroomSelected[0].code) {
						nextTick(() => {
							form.value.position = ""
							form.value.cwhCode = ""
							form.value.shelfName = ""
						})
						uni.showToast({
							title: "所选转入仓库不存在此货位",
							icon: "none"
						})
					} else {
						form.value.position = res.data.cPosCode
						form.value.cwhCode = res.data.cWhCode
						form.value.shelfName = res.data.cWhName + res.data.cPosName
					}
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
	// 表单数据加入表格
	const add = () => {
		tableData.value.push(form.value)
		form.value = initForm()
	}
	// 加入按钮是否可用
	const addDisabled = computed(() => {
		if (shelfSelectEnable.value) {
			return !form.value.invCode || !form.value.position || !form.value.count
		} else {
			return !form.value.invCode || !form.value.count
		}
	})

	// -------------------------------------------------------------------------------------表格操作
	// table实际展示的数据, 表格由前端自己维护
	const tableData = ref < Obj[] > ([])
	// 表格操作
	const showPopup = ref(false)
	const editData = ref({
		index: 0,
		batch: "",
		quantity: "",

	})
	const originData = ref < Obj > ({})

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
	// 弹窗货位码扫描成功
	const itemScanSuccess = useThrottle(async (code: string) => {
		if (code) {
			try {
				const res = await getPositionInfo({
					cPosCode: code
				})
				if (res && res.data) {
					if (res.data.cWhCode !== config.value.stockroomSelected[0].code) {
						nextTick(() => {
							originData.value.position = ""
							originData.value.cwhCode = ""
							originData.value.shelfName = ""
						})
						uni.showToast({
							title: "所选转入仓库不存在此货位",
							icon: "none"
						})
					} else {
						originData.value.position = res.data.cPosCode
						originData.value.cwhCode = res.data.cWhCode
						originData.value.shelfName = res.data.cWhName + res.data.cPosName
					}
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
	// 表格编辑
	const edit = () => {
		const value = Number(editData.value.quantity)
		const max = Number(originData.value.quantity)
		const min = 0
		if (value > max) {
			uni.showToast({
				icon: "none",
				title: "入库数量不能大于应入库数量"
			})
			return
		}
		if (value <= min) {
			uni.showToast({
				icon: "none",
				title: "入库数量不能小于0"
			})
			return
		}
		originData.value.batch = editData.value.batch
		originData.value.count = editData.value.quantity
		showPopup.value = false
	}

	// -------------------------------------------------------------------------------------提交操作
	const submiting = ref(false)
	const submit = async () => {
		try {
			// 默认值检查
			if (useCheckEmptyInObj([config.value.stockroomSelected, config.value.stockroomSaveTypeSelected],
					[])) {
				uni.showToast({
					title: "请填写完默认参数",
					icon: "none"
				})
				return
			}
			if (shelfSelectEnable.value) {
				// 库位填写检查
				for (const key in tableData.value) {
					const item = tableData.value[key]
					if (!item.position) {
						uni.showToast({
							icon: "none",
							title: `第${Number(key)+1}行货位未填写`
						})
						return
					}
					if (item.cwhCode !== config.value.stockroomSelected[0].code) {
						uni.showToast({
							icon: "none",
							title: `第${Number(key)+1}行，默认仓库没有该货位，请确认后再试`
						})
						return
					}
				}
			}

			// 开始提交
			submiting.value = true
			uni.showLoading({
				title: "提交中",
				icon: "none",
				mask: true
			})
			// 参数赋值
			const params = {
				body: tableData.value.map(item => {
					return {
						invCode: item.invCode,
						quantity: item.count,
						posCode: item.position,
						batch: item.batch
					}
				}),
				head: {
					depcode: config.value.depSelected.length > 0 ? config.value.depSelected[0].code : "",
					crdcode: config.value.stockroomSaveTypeSelected[0].code,
					cwhcode: config.value.stockroomSelected[0].code,
					ddate: tableData.value[0].date,
					cbusType: config.value.busTypeSelected.length > 0 ? config.value.busTypeSelected[0].name : ""
				}

			}
			await addRdRecord08(params)

			tableData.value = []
			uni.showToast({
				title: "入库成功",
				icon: "none"
			})
		} catch (err) {
			console.log(err)
		} finally {
			submiting.value = false
		}
	}
	const submitDisabled = computed(() => {
		return submiting.value || tableData.value.length <= 0
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.otherStockDoc.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left" required>
				<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input-scan placeholder="扫码后,自动带出" clearable class="input-item" @scanSuccess="procuctScanSuccess"
						v-model="form.invCode" focus></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="80" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.invName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0"
					v-if="form.bInvBatch === '1'">
					<up-input placeholder="" clearable class="input-item" v-model="form.batch">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="入库数量:" borderBottom labelWidth="80" style="padding: 0" required>
					<up-input placeholder="自动填充" clearable class="input-item" type="number" v-model="form.count">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="80" style="padding: 0">
					<up-input placeholder="请输入备注" clearable class="input-item" v-model="form.remark">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="80" style="padding: 0" required
					v-if="shelfSelectEnable">
					<up-input-scan placeholder="请扫货位码" clearable class="input-item" @scanSuccess="shelfScanSuccess"
						v-model="form.position"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="货位名称:" borderBottom labelWidth="80" style="padding: 0"
					v-if="shelfSelectEnable">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.shelfName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="入库日期:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDatePicker border="none" placeholder="选择入库日期" clearable class="input-item" readonly
						v-model:selected="dateSelected" @select="dateSelect" :maxDate="Date.now()">
					</UpInputDatePicker>
				</up-form-item>
			</up-form>
			<view class="btn-box">
				<up-button type="primary" text="加入" class="bottom-button" shape="circle" @click="add"
					:disabled="addDisabled"></up-button>
			</view>
			<view class="common-section-title">
				本次入库明细
			</view>
		</view>

		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料编码</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">物料名称</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">入库数量</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">货位信息</uni-th>
						<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key+1)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.invCode }}</uni-td>
						<uni-td class="nowrap">{{ item.invName }}</uni-td>
						<uni-td class="nowrap primary">{{ item.count }}</uni-td>
						<uni-td class="nowrap primary">{{ item.position }}</uni-td>
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
									<up-input border="none" placeholder="" clearable class="input-item" v-model="editData.index" readonly>
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

								<up-form-item class="common-form-item" label="入库数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="editData.quantity" type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="100" style="padding: 0"
									v-if="shelfSelectEnable">
									<up-input-scan placeholder="请扫货位码" clearable class="input-item" @scanSuccess="itemScanSuccess"
										v-model="originData.position" focus></up-input-scan>
								</up-form-item>

								<up-form-item class="common-form-item" label="货位名称:" borderBottom labelWidth="100" style="padding: 0"
									v-if="shelfSelectEnable">
									<up-input border="none" placeholder="自动带出" clearable class="input-item" v-model="originData.shelfName"
										readonly></up-input>
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
			<up-button type="primary" text="提交入库" class="bottom-button" shape="circle" @click="submit"
				:disabled="submitDisabled" :loading="submiting"></up-button>
		</view>

	</view>

</template>

<style scoped lang='less'>
	.btn-box {
		margin-top: 10px
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