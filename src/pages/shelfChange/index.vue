<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		onMounted,
		nextTick,
		watch,
		computed
	} from 'vue';
	import {
		onShow
	} from "@dcloudio/uni-app"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import ScanTypeSelect from "./components/ScanTypeSelect.vue"
	// 工具
	import {
		nowFormat
	} from "@/store/common"
	import {
		useCheckEmptyInObj,
		useDebounce
	} from "@ultra-man/noa"
	// 接口
	import {
		getPositionInfo,
		shelfChange
	} from "@/api/business"
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
			url: routes.sCDefaultSetPage.path
		})
	}
	// -------------------------------------------------------------------------------------初始化
	onMounted(() => {
		dateSelected.value = [nowFormat]
	})
	let config = ref < Obj > ({})
	onShow(() => {
		const configStr = uni.getStorageSync("sfCDefaultSet")
		config.value = configStr ? JSON.parse(configStr) : {}
		if (config.value.stockroomSelected) {
			scanSearchParams.value.whCode = config.value.stockroomSelected[0].code
		}
	})
	// -------------------------------------------------------------------------------------表单
	// 表单
	const initForm = (): Obj => {
		return {
			// 物料
			invCode: "",
			invName: "",
			batch: "",
			quantity: "",
			//
			remark: "",
			// 原货位
			oriPosition: "",
			oriShelfName: "",
			// 新货位
			position: "",
			cwhCode: "",
			shelfName: "",
			count: "",
			date: nowFormat,
		}
	}
	const form = ref(initForm())

	// 查找类型
	const typeSelect = ref(0)
	watch(typeSelect, () => {
		form.value = initForm()
		scanSearchParams.value.searchKey = typeSelect.value === 0 ? "code" : "posCode"
		materialSelected.value = []
	})
	// 查找参数
	const scanSearchParams = ref < Obj > ({
		searchKey: "code"
	})
	// 选择的物料
	const materialSelected = ref < Obj[] > ([])
	const materialSelect = (materiels: Obj[]) => {
		// 处理form
		if (materiels.length > 0) {
			const item = materiels[0]
			form.value.invCode = item.cInvCode
			form.value.invName = item.cInvName
			form.value.batch = item.cbatch
			form.value.oriPosition = item.cposcode
			form.value.oriShelfName = item.cwhname + item.cposname
			form.value.quantity = item.iQuantity
		}
	}

	// 日期
	const dateSelected = ref < string[] > ([])
	const dateSelect = (dates: string[]) => {
		if (dates.length) {
			form.value.date = dates[0]
		}
	}

	// 新货架扫码成功
	const resetFormShelf = () => {
		nextTick(() => {
			form.value.position = ""
			form.value.cwhCode = ""
			form.value.shelfName = ""
		})
	}
	const scanSuccess = useDebounce(async (code: string) => {
		if (code) {
			if (!config.value.stockroomSelected) {
				uni.showToast({
					title: "请先选择仓库",
					icon: "none"
				})
				return
			}
			try {
				const res = await getPositionInfo({
					cPosCode: code
				})
				if (res && res.data) {
					if (res.data.cWhCode !== config.value.stockroomSelected[0].code) {
						resetFormShelf()
						uni.showToast({
							title: "所选仓库不存在此货位",
							icon: "none"
						})
					} else {
						form.value.position = res.data.cPosCode
						form.value.cwhCode = res.data.cWhCode
						form.value.shelfName = res.data.cWhName + res.data.cPosName
					}
				} else {
					resetFormShelf()
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

	// 添加到明细
	const add = () => {
		tableData.value.push(form.value)
		form.value = initForm()
	}
	const addDisabled = computed(() => {
		if (!form.value.invCode || !form.value.position) return true
		if (form.value.count <= 0 || form.value.count > form.value.quantity) return true
		return false
	})

	// -------------------------------------------------------------------------------------表格
	// table实际展示的数据, 表格由前端自己维护
	const tableData = ref < Obj[] > ([])
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
	const open = (item: Obj, key: number) => {
		originData.value = item
		editData.value.index = key
		editData.value.count = item.count
		showPopup.value = true
	}
	// -------------------------------------------------------------------------------------弹窗
	const editData = ref({
		index: 0,
		count: 0,
	})
	const originData = ref < Obj > ({})
	const showPopup = ref(false)
	// 仓库数据清空
	const resetOriginDataShelf = () => {
		nextTick(() => {
			originData.value.position = ""
			originData.value.cwhCode = ""
			originData.value.shelfName = ""
		})
	}
	const itemScanSuccess = useDebounce(async (code: string) => {
		if (code) {
			try {
				const res = await getPositionInfo({
					cPosCode: code
				})
				if (res && res.data) {
					if (res.data.cWhCode !== config.value.stockroomSelected[0].code) {
						resetOriginDataShelf()
						uni.showToast({
							title: "所选仓库不存在此货位",
							icon: "none"
						})
					} else {
						originData.value.position = res.data.cPosCode
						originData.value.cwhCode = res.data.cWhCode
						originData.value.shelfName = res.data.cWhName + res.data.cPosName
					}
				} else {
					resetOriginDataShelf()
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
		const value = Number(editData.value.count)
		const max = Number(originData.value.quantity)
		const min = 0
		if (value > max) {
			uni.showToast({
				icon: "none",
				title: "调整数量不能大于库存数量"
			})
			return
		}
		if (value <= min) {
			uni.showToast({
				icon: "none",
				title: "调整数量不能小于0"
			})
			return
		}
		originData.value.count = editData.value.count
		showPopup.value = false
	}
	// -------------------------------------------------------------------------------------提交
	const submiting = ref(false)
	const submit = async () => {
		try {
			// 默认值检查
			if (useCheckEmptyInObj([config.value.stockroomSelected, config.value.depSelected], [])) {
				uni.showToast({
					title: "请填写完默认参数",
					icon: "none"
				})
				return
			}
			// 库位填写检查
			for (const key in tableData.value) {
				const item = tableData.value[key]
				if (!item.position) {
					uni.showToast({
						icon: "none",
						title: `第${Number(key)+1}行库位未填写`
					})
					return
				}
				if (item.cwhCode !== config.value.stockroomSelected[0].code) {
					uni.showToast({
						icon: "none",
						title: `第${Number(key)+1}行库位设置不正确`
					})
					return
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
						bPosCode: item.oriPosition,
						aPosCode: item.position,
						batch: item.batch,
						invCode: item.invCode,
						quantity: item.count
					}
				}),
				head: {
					depcode: config.value.depSelected[0].code,
					ddate: dateSelected.value[0],
					whcode: config.value.stockroomSelected[0].code
				}
			}
			await shelfChange(params)
			tableData.value = []
			uni.showToast({
				title: "调整成功",
				icon: "none"
			})
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
		<CustomNavBar :title="routes.shelfChange.style.navigationBarTitleText" @rightClick="rightClick"></CustomNavBar>

		<view>
			<view class="common-section-title">
				基本信息
			</view>

			<ScanTypeSelect v-model="typeSelect" class="tab-box"></ScanTypeSelect>

			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="100" style="padding: 0">
					<UpInputMaterielPicker @select="materialSelect" placeholder="扫码/手输物料编码" clearable class="input-item"
						v-model:selected="materialSelected" v-model="form.invCode" scan :scanSearchParams="scanSearchParams"
						v-if="typeSelect === 0" focus>
					</UpInputMaterielPicker>
					<up-input border="none" placeholder="自动填充" clearable class="input-item" v-model="form.invCode" readonly
						v-if="typeSelect === 1">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.invName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.batch">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次现存量:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly type="number"
						v-model="form.quantity">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="原货位编码:" borderBottom labelWidth="100" style="padding: 0">
					<UpInputMaterielPicker @select="materialSelect" placeholder="扫码/手输货位码" clearable class="input-item"
						v-model:selected="materialSelected" v-model="form.oriPosition" scan :scanSearchParams="scanSearchParams"
						v-if="typeSelect === 1" focus>
					</UpInputMaterielPicker>

					<up-input border="none" placeholder="自动填充" clearable class="input-item" v-model="form.oriPosition" readonly
						v-if="typeSelect === 0">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="原货位名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.oriShelfName">
					</up-input>
				</up-form-item>

				<up-form-item required class="common-form-item" label="新货位:" borderBottom labelWidth="100" style="padding: 0">
					<up-input-scan placeholder="请扫新货位" clearable class="input-item" @scanSuccess="scanSuccess"
						v-model="form.position"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="新货位名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.shelfName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="调整数量:" borderBottom labelWidth="100" style="padding: 0">
					<up-input placeholder="大于0, 小于现存量" clearable class="input-item" type="number" :min="0"
						v-model="form.count">></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="制单日期:" borderBottom labelWidth="100" style="padding: 0">
					<UpInputDatePicker border="none" placeholder="选择制单日期" clearable class="input-item" readonly
						v-model:selected="dateSelected" @select="dateSelect">
					</UpInputDatePicker>
				</up-form-item>
			</up-form>
			<view class="btn-box">
				<up-button type="primary" text="加入" class="bottom-button" shape="circle" @click="add"
					:disabled="addDisabled"></up-button>
			</view>
			<view class="common-section-title">
				本次调整明细
			</view>
		</view>

		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">编码</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">名称</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">批次</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">数量</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">老货位</uni-th>
						<uni-th class="nowrap" align="left" width="100rpx">新货位</uni-th>
						<uni-th class="nowrap" align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<uni-tr v-for="item,key in tableData" :key="key" @click="open(item, key+1)">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.invCode }}</uni-td>
						<uni-td class="nowrap">{{ item.invName }}</uni-td>
						<uni-td class="nowrap">{{ item.batch }}</uni-td>
						<uni-td class="nowrap">{{ item.count }}</uni-td>
						<uni-td class="nowrap">{{ item.oriShelfName }}</uni-td>
						<uni-td class="nowrap">{{ item.shelfName }}</uni-td>
						<uni-td class="warning nowrap" @click.stop="deleteTable">删除</uni-td>
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

								<up-form-item class="common-form-item" label="调整数量:" borderBottom labelWidth="100" style="padding: 0">
									<up-input placeholder="" clearable class="input-item" v-model="editData.count" type="number">
									</up-input>
								</up-form-item>

								<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="100" style="padding: 0">
									<up-input-scan placeholder="请扫货位码" clearable class="input-item" @scanSuccess="itemScanSuccess"
										v-model="originData.position" focus></up-input-scan>
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
			<up-button type="primary" text="提交调整" class="bottom-button" shape="circle" @click="submit"
				:disabled="submitDisabled"></up-button>
		</view>

	</view>

</template>

<style scoped lang='less'>
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

	.btn-box {
		margin-top: 10px
	}
</style>