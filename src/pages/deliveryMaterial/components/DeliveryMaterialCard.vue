<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
	} from 'vue';
	// 组件
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	import UpInputBusTypePicker from "@/components/UpInputBusTypePicker.vue"
	import UpInputSaleTypePicker from "@/components/UpInputSaleTypePicker.vue"
	import UpInputStockroomPicker from "@/components/UpInputStockroomPicker.vue"
	import UpInputOutSrTypePicker from "@/components/UpInputOutSrTypePicker.vue"
	import UpInputDepPicker from "@/components/UpInputDepPicker.vue"
	import UpInputCustomerPicker from "@/components/UpInputCustomerPicker.vue"
	// 工具
	import {
		deliveryDocVal,
		outSrDocVal
	} from "../util"
	// 接口
	import {
		getShippingInformation,
		getShippingAndOutboundInformation,
		deliveryMaterialInsert,
	} from "@/api/deliveryMaterial"
	// 数据
	import {
		states
	} from "../store"
	import {
		nowFormat
	} from "@/store/common"
	// 类型
	import type {
		DeliveryMaterial,
		DeliveryDocDetail,
		Business,
		OutSrDocDetail
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	import {
		globalColor
	} from "@/store/theme"

	// 弹窗分为查看和发货
	enum PopupType {
		CHECK,
		DELIVERY
	}

	const props = defineProps < {
		deliveryMaterial: DeliveryMaterial
	} > ()

	// 步骤1弹窗
	const showPopup = ref(false)
	const confirmOneLoading = ref(false)
	const popupTitle = ref("")
	const popupType = ref(PopupType.CHECK)
	// 步骤2弹窗
	const showPopupTwo = ref(false)
	const confirmTwoLoading = ref(false)
	// 步骤3弹窗
	const showPopupThree = ref(false)
	const confirmThreeLoading = ref(false)

	// 卡片上的查看和发货
	// 查看
	const check = async () => {
		popupTitle.value = "发货计划查看"
		popupType.value = PopupType.CHECK
		showPopup.value = true
		// await getDeliveryPlanDocDetail({
		// 	id: props.deliveryMaterial.id
		// })
	}
	// 发货
	const delivery = async () => {
		popupTitle.value = "发货计划详情"
		popupType.value = PopupType.DELIVERY
		showPopup.value = true
		// await getDeliveryPlanDocDetail({
		// 	id: props.deliveryMaterial.id
		// })
	}

	// 根据状态来获取一些信息
	const getInfoByState = (state: number) => {
		for (const item of states.slice(1)) {
			if (state === Number(item.value)) {
				return item
			}
		}
	}

	// 弹窗内的确认和取消
	// 确认发货，内部控制各个状态
	const confirm = async (step: number) => {
		try {
			if (step === 1) {
				confirmOneLoading.value = true
				await getDeliveryDoc()
				showPopupTwo.value = true
			}
			// 创建发货单步骤
			if (step === 2) {
				confirmTwoLoading.value = true
				await editDeliveryDoc(deliveryDocDetail.value)
				showPopupThree.value = true
			}
			// 创建出库单步骤
			if (step === 3) {
				confirmThreeLoading.value = true
				await createOutSrDoc()
				confirmThreeLoading.value = false
				showPopupThree.value = false
				showPopupTwo.value = false
				showPopup.value = false
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
			confirmOneLoading.value = false
			confirmTwoLoading.value = false
			confirmThreeLoading.value = false
		}

	}
	// 查看的取消和发货的取消操作不同
	const cancel = (step: number) => {
		if (step === 1) {
			showPopup.value = false
		}
		if (step === 2) {
			showPopupTwo.value = false
		}
		if (step === 3) {
			showPopupThree.value = false
		}
	}

	//-------------------------------------------------------------------------------------- 修改发货单
	const deliveryDocDetail = ref < DeliveryDocDetail > ({})
	//// 发货时间
	const deliveryDateSelected = ref < string[] > ([])
	const deliveryDateSelect = (date: string[]) => {
		// deliveryDateSelected.value = date
		if (date.length > 0) {
			deliveryDocDetail.value.planDate = date[0]
		}
	}
	//// 业务类型
	const busTypeSelected = ref < Partial < Business > [] > ([])
	const busTypeSelect = (e: Business[]) => {
		if (e.length > 0) {
			deliveryDocDetail.value.busTypeCode = e[0].code
			deliveryDocDetail.value.busType = e[0].name
		}
	}
	//// 销售类型
	const saleTypeSelected = ref < Partial < Business > [] > ([])
	const saleTypeSelect = (e: Business[]) => {
		if (e.length > 0) {
			deliveryDocDetail.value.saleTypeCode = e[0].code
			deliveryDocDetail.value.saleType = e[0].name
		}
	}
	const getDeliveryDoc = async () => {
		const res = await getShippingInformation({
			id: props.deliveryMaterial.id
		})
		if (res) {
			deliveryDocDetail.value = res.data
			deliveryDateSelected.value = [nowFormat]
			busTypeSelected.value = [{
				code: deliveryDocDetail.value.busTypeCode,
				name: deliveryDocDetail.value.busType
			}]
			saleTypeSelected.value = [{
				code: deliveryDocDetail.value.saleTypeCode,
				name: deliveryDocDetail.value.saleType,
			}]
		}
	}
	//// 编辑发货数量
	const editItem = ref < Obj > ({})
	const showEditModal = ref(false)
	const editPlanNum = (item: Obj) => {
		editItem.value = item
		showEditModal.value = true
	}
	const editConfirm = () => {
		showEditModal.value = false
	}

	//-------------------------------------------------------------------------------------- 修改出库单
	const outSrDocDetail = ref < OutSrDocDetail > ({})
	const editDeliveryDoc = async (deliveryDocDetail: DeliveryDocDetail) => {
		// 先判断
		await deliveryDocVal(deliveryDocDetail)
		// 再提交
		const res = await getShippingAndOutboundInformation(deliveryDocDetail)
		if (res) {
			outSrDocDetail.value = res.data
			outSrDateSelected.value = [outSrDocDetail.value.planDate]
			stockroomSelected.value = [{
				code: outSrDocDetail.value.warehouseCode,
				name: outSrDocDetail.value.warehouseName,
			}]
			outSrTypeSelected.value = [{
				code: outSrDocDetail.value.cRdCode,
				name: outSrDocDetail.value.cRdName,
			}]
			busTypeSelectedTwo.value = [{
				code: outSrDocDetail.value.busTypeCode,
				name: outSrDocDetail.value.busType
			}]
			depSelected.value = [{
				code: outSrDocDetail.value.saleDepartmentCode,
				name: outSrDocDetail.value.saleDepartment
			}]
			customerSelected.value = [{
				code: outSrDocDetail.value.customerCode,
				name: outSrDocDetail.value.customerName
			}]
		}
	}

	//// 出库时间
	const outSrDateSelected = ref < string[] > ([])
	const outSrDateSelect = (date: string[]) => {
		if (date.length > 0) {
			outSrDocDetail.value.planDate = date[0]
		}
	}
	//// 仓库选择
	const stockroomSelected = ref < Partial < Business > [] > ([])
	const stockroomSelect = (e: Business[]) => {
		if (e.length > 0) {
			outSrDocDetail.value.warehouseCode = e[0].code
			outSrDocDetail.value.warehouseName = e[0].name
		}
	}
	//// 出库类别
	const outSrTypeSelected = ref < Partial < Business > [] > ([])
	const outSrTypeSelect = (e: Business[]) => {
		if (e.length > 0) {
			outSrDocDetail.value.outboundCode = e[0].code
			outSrDocDetail.value.outboundName = e[0].name
		}
	}
	//// 业务类型
	const busTypeSelectedTwo = ref < Partial < Business > [] > ([])
	const busTypeSelectTwo = (e: Business[]) => {
		if (e.length > 0) {
			outSrDocDetail.value.busTypeCode = e[0].code
			outSrDocDetail.value.busType = e[0].name
		}
	}
	//// 销售部门
	const depSelected = ref < Partial < Business > [] > ([])
	const depSelect = (e: Business[]) => {
		if (e.length > 0) {
			outSrDocDetail.value.saleDepartmentCode = e[0].code
			outSrDocDetail.value.saleDepartment = e[0].name
		}
	}
	//// 客户
	const customerSelected = ref < Partial < Business > [] > ([])
	const customerSelect = (e: Business[]) => {
		if (e.length > 0) {
			outSrDocDetail.value.customerCode = e[0].code
			outSrDocDetail.value.customerName = e[0].name
		}
	}

	// -------------------------------------------------------------------------------------- 创建出库单
	const createOutSrDoc = async () => {
		// 先判断
		await outSrDocVal(outSrDocDetail)
		// 再提交
		uni.showLoading({
			mask: true,
			title: "出库单生成中",
		})
		await deliveryMaterialInsert(outSrDocDetail.value)
		uni.hideLoading()
		uni.showToast({
			title: "出库单生成成功",
			icon: "none"
		})

	}
</script>

<template>
	<view class="card">
		<view class="title">
			<view>{{deliveryMaterial.billCode}}</view>
			<view :class="getInfoByState(deliveryMaterial.state).className">
				{{getInfoByState(deliveryMaterial.state).name}}
			</view>
		</view>
		<view class="body">
			<view v-if="deliveryMaterial.detailList">
				<view>
					物料编码：{{deliveryMaterial.detailList[0].cInvCode}}
				</view>
				<view>
					物料名称：{{deliveryMaterial.detailList[0].cInvName}}
				</view>
				<view v-if="deliveryMaterial.detailList.length > 1">
					...
				</view>
			</view>

			<view>
				客户名称：{{deliveryMaterial?.customerName}}
			</view>
			<view>
				计划发货时间：{{deliveryMaterial?.planDate}}
			</view>
			<view class="flex-box">
				<view>
					创建人：{{deliveryMaterial?.createName}}
				</view>
				<view>
					创建时间：{{deliveryMaterial?.createTime}}
				</view>
			</view>
		</view>
		<view class="btn-box">
			<up-button type="primary" text="查看" class="bottom-button" @click="check" shape="circle" size="small"></up-button>
			<up-button type="primary" text="发货" class="bottom-button" @click="delivery" shape="circle"
				size="small"></up-button>
		</view>

		<u-popup :show="showPopup" mode="bottom" @close="showPopup = false">
			<view class="popup-content common-page common-page-container" style="height: 90vh">
				<view class="common-section-title popup-title ">
					{{popupTitle}}
				</view>
				<view class="popup-form common-page-largest">
					<up-form class="common-form" labelPosition="left">
						<up-form-item class="common-form-item" label="计划发货单号:" borderBottom labelWidth="100" style="padding: 0">
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.billCode">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="计划发货日期:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.planDate">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="业务类型:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.busType">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="销售类型:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.saleType">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="销售订单号:" borderBottom labelWidth="100" style="padding: 0">
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.saleBillCode">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="客户名称:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.customerName">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="销售部门:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.saleDepartment">
							</up-input>
						</up-form-item>

						<!-- 						<up-form-item class="common-form-item" label="业务员:" borderBottom labelWidth="100" style="padding: 0">
							<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly
								v-model="deliveryMaterial.sendUserNames">
							</up-input>
						</up-form-item> -->
					</up-form>

					<view class="common-section-title">
						明细
					</view>

					<view class="common-table">
						<uni-table border stripe emptyText="暂无更多数据">
							<uni-tr>
								<uni-th align="left" width="60px">序号</uni-th>
								<uni-th align="left" width="90px">物料编码</uni-th>
								<uni-th align="left" width="90px">物料名称</uni-th>
								<uni-th align="left" width="100px">计划发货数量</uni-th>
								<uni-th align="left" width="90px">仓库</uni-th>
								<uni-th align="left" width="90px">创建人</uni-th>
								<uni-th align="left" width="90px">创建时间</uni-th>
							</uni-tr>
							<uni-tr v-for="item,key in deliveryMaterial.detailList" :key="key">
								<uni-td>{{ key + 1 }}</uni-td>
								<uni-td>{{ item.cInvCode }}</uni-td>
								<uni-td>{{ item.cInvName }}</uni-td>
								<uni-td>{{ item.planNum }}</uni-td>
								<uni-td>{{ item.warehouseName }}</uni-td>
								<uni-td>{{ item.createName }}</uni-td>
								<uni-td>{{ item.createTime }}</uni-td>
							</uni-tr>
						</uni-table>
					</view>
				</view>

				<view class="btn-box">
					<up-button type="primary" text="确认" class="bottom-button" @click="showPopup = false" shape="circle"
						size="small" v-show="popupType === PopupType.CHECK"></up-button>
					<up-button type="primary" text="确认发货" class="bottom-button" @click="confirm(1)" shape="circle" size="small"
						v-show="popupType === PopupType.DELIVERY" :loading="confirmOneLoading"
						:disabled="confirmOneLoading"></up-button>
					<up-button text="取消" class="bottom-button" @click="cancel(1)" shape="circle" size="small"
						:disabled="confirmOneLoading"></up-button>
				</view>
			</view>
		</u-popup>

		<u-popup :show="showPopupTwo" mode="bottom" @close="showPopupTwo = false">
			<view class="popup-content common-page common-page-container" style="height: 90vh">
				<view class="common-section-title popup-title ">
					发货单
				</view>
				<view class="popup-form common-page-largest">
					<up-form class="common-form" labelPosition="left">

						<up-form-item class="common-form-item" label="发货日期:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputDatePicker border="none" placeholder="选择发货日期" clearable class="input-item" readonly
								@select="deliveryDateSelect" v-model:selected="deliveryDateSelected">
							</UpInputDatePicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="业务类型:" borderBottom labelWidth="100" style="padding: 0">
							<UpInputBusTypePicker border="none" placeholder="选择业务类型" clearable class="input-item" readonly
								@select="busTypeSelect" v-model:selected="busTypeSelected">
							</UpInputBusTypePicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="销售类型:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputSaleTypePicker border="none" placeholder="选择销售类型" clearable class="input-item" readonly
								@select="saleTypeSelect" v-model:selected="saleTypeSelected">
							</UpInputSaleTypePicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="销售订单号:" borderBottom labelWidth="100" style="padding: 0">
							<up-input border="none" placeholder="填写销售订单号" clearable class="input-item" readonly
								v-model="deliveryDocDetail.saleBillCode">
							</up-input>
						</up-form-item>

						<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="100" style="padding: 0">
							<up-input placeholder="填写备注" clearable class="input-item" v-model="deliveryDocDetail.cmaker">
							</up-input>
						</up-form-item>
					</up-form>

					<view class="common-section-title">
						发货单明细
					</view>

					<view class="common-table">
						<uni-table border stripe emptyText="暂无更多数据">
							<!-- 表头行 -->
							<uni-tr>
								<uni-th align="left" width="60px">序号</uni-th>
								<uni-th align="left" width="90px">物料编码</uni-th>
								<uni-th align="left" width="90px">物料名称</uni-th>
								<!-- 								<uni-th align="left" width="100rpx">物料图号</uni-th>
								<uni-th align="left" width="100rpx">客户图号</uni-th>
								<uni-th align="left" width="100rpx">客户名称</uni-th> -->
								<uni-th align="left" width="90px">发货量</uni-th>
								<uni-th align="left" width="90px">现存量</uni-th>
								<uni-th align="left" width="90px">仓库</uni-th>
								<!-- <uni-th align="left" width="100rpx">批号</uni-th> -->
								<!-- <uni-th align="left" width="100rpx">备注</uni-th> -->
							</uni-tr>
							<!-- 表格数据行 -->
							<uni-tr v-for="item,key in deliveryDocDetail.detailList" :key="key">
								<uni-td>{{ key + 1 }}</uni-td>
								<uni-td>{{ item.cInvCode }}</uni-td>
								<uni-td>{{ item.cInvName }}</uni-td>
								<uni-td class="link" @click="editPlanNum(item)">{{ item.planNum }}</uni-td>
								<uni-td>{{ item.stockNum }}</uni-td>
								<uni-td>{{ item.warehouseName }}</uni-td>
							</uni-tr>

							<u-modal :show="showEditModal" title="输入发货数量" @confirm="editConfirm">
								<view class="slot-content">
									<up-input placeholder="填写数量" clearable class="input-item" v-model="editItem.planNum" type="number">
									</up-input>
								</view>
							</u-modal>
						</uni-table>
					</view>
				</view>

				<view class="btn-box">
					<up-button type="primary" text="创建发货单" class="bottom-button" @click="confirm(2)" shape="circle" size="small"
						:loading="confirmTwoLoading" :disabled="confirmTwoLoading"></up-button>
					<up-button text="上一步" class="bottom-button" @click="cancel(2)" shape="circle" size="small"
						:disabled="confirmTwoLoading"></up-button>
				</view>
			</view>
		</u-popup>

		<u-popup :show="showPopupThree" mode="bottom" @close="confirmThreeLoading ? null : showPopupThree = false">
			<view class="popup-content common-page common-page-container" style="height: 90vh">
				<view class="common-section-title popup-title ">
					销售出库单
				</view>
				<view class="popup-form common-page-largest">
					<up-form class="common-form" labelPosition="left">
						<!-- 						<up-form-item class="common-form-item" label="出库单号:" borderBottom labelWidth="100" style="padding: 0">
						</up-form-item> -->

						<up-form-item class="common-form-item" label="出库日期:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputDatePicker border="none" placeholder="选择出库日期" clearable class="input-item" readonly
								@select="outSrDateSelect" v-model:selected="outSrDateSelected">
							</UpInputDatePicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="仓库:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputStockroomPicker border="none" placeholder="选择仓库" clearable class="input-item" readonly
								@select="stockroomSelect" v-model:selected="stockroomSelected">
							</UpInputStockroomPicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="出库类别:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputOutSrTypePicker border="none" placeholder="选择出库类别" clearable class="input-item" readonly
								@select="outSrTypeSelect" v-model:selected="outSrTypeSelected">
							</UpInputOutSrTypePicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="业务类型:" borderBottom labelWidth="100" style="padding: 0">
							<UpInputBusTypePicker border="none" placeholder="选择业务类型" clearable class="input-item" readonly
								@select="busTypeSelectTwo" v-model:selected="busTypeSelectedTwo">
							</UpInputBusTypePicker>
						</up-form-item>

						<!-- 						<up-form-item class="common-form-item" label="销售单号:" borderBottom labelWidth="100" style="padding: 0"
							required>
						</up-form-item> -->

						<up-form-item class="common-form-item" label="销售部门:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputDepPicker border="none" placeholder="选择销售部门" clearable class="input-item" readonly
								@select="depSelect" v-model:selected="depSelected">
							</UpInputDepPicker>
						</up-form-item>

						<!-- 						<up-form-item class="common-form-item" label="业务员:" borderBottom labelWidth="100" style="padding: 0">
						</up-form-item> -->

						<up-form-item class="common-form-item" label="客户:" borderBottom labelWidth="100" style="padding: 0"
							required>
							<UpInputCustomerPicker border="none" placeholder="选择客户" clearable class="input-item" readonly
								@select="customerSelect" v-model:selected="customerSelected">
							</UpInputCustomerPicker>
						</up-form-item>

						<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="100" style="padding: 0">
							<up-input placeholder="填写备注" clearable class="input-item" v-model="outSrDocDetail.cmaker">
							</up-input>
						</up-form-item>
					</up-form>

					<view class="common-section-title">
						销售出库单明细
					</view>

					<view class="common-table">
						<uni-table border stripe emptyText="暂无更多数据">
							<!-- 表头行 -->
							<uni-tr>
								<uni-th align="left" width="60px">序号</uni-th>
								<uni-th align="left" width="90px">货位编码</uni-th>
								<uni-th align="left" width="90px">物料编码</uni-th>
								<uni-th align="left" width="90px">物料名称</uni-th>
								<!-- <uni-th align="left" width="100rpx"> 物料图号</uni-th> -->
								<uni-th align="left" width="90px">批号</uni-th>
								<uni-th align="left" width="90px">规格型号</uni-th>
								<uni-th align="left" width="90px">主计量单位</uni-th>
								<uni-th align="left" width="90px">出库数量</uni-th>
								<uni-th align="left" width="90px">现存量</uni-th>
								<!-- <uni-th align="left" width="100rpx">备注</uni-th> -->
							</uni-tr>
							<!-- 表格数据行 -->
							<uni-tr v-for="item,key in outSrDocDetail.outboundDetailList" :key="key">
								<uni-td>{{ key + 1 }}</uni-td>
								<uni-td>{{ item.cposition }}</uni-td>
								<uni-td>{{ item.cInvCode }}</uni-td>
								<uni-td>{{ item.cInvName }}</uni-td>
								<uni-td>{{ item.cBatch }}</uni-td>
								<uni-td>{{ item.cInvStd }}</uni-td>
								<uni-td>{{ item.unitName }}</uni-td>
								<uni-td>{{ item.planNum }}</uni-td>
								<uni-td>{{ item.stockNum }}</uni-td>
							</uni-tr>
						</uni-table>
					</view>
				</view>

				<view class="btn-box">
					<up-button type="primary" text="创建出库单" class="bottom-button" @click="confirm(3)" shape="circle" size="small"
						:loading="confirmThreeLoading" :disabled="confirmThreeLoading"></up-button>
					<up-button text="上一步" class="bottom-button" @click="cancel(3)" shape="circle" size="small"
						:disabled="confirmThreeLoading"></up-button>
				</view>
			</view>
		</u-popup>

	</view>
</template>

<style scoped lang='scss'>
	.card {
		padding: 0 10px;
		border: 2rpx solid $u-border-color;
		border-radius: 5px;

		color: v-bind("globalColor.default");

		.title {
			padding: 10px 0;
			border-bottom: 2rpx solid $u-border-color;
			display: flex;
			justify-content: space-between;

		}

		.body {
			padding: 10px 0;
			border-bottom: 2rpx solid $u-border-color;
			font-size: 14px;

			line-height: 24px;

			.flex-box {
				display: flex;
				justify-content: space-between;
			}
		}

		.btn-box {
			padding: 10px 0;
			display: flex;
			justify-content: flex-end;

			.bottom-button+.bottom-button {
				margin-left: 10px;
			}

			.bottom-button {
				width: 30%;
				margin: 0;
			}
		}

		.popup-content {

			.popup-title {
				font-size: 18px;
				text-align: center;
				color: v-bind("globalColor.main");
				font-weight: bold;
			}
		}
	}
</style>