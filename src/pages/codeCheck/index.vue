<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		computed,
		nextTick,
		watch
	} from 'vue';
	// 组件
	import UpInputScan from "@/components/UpInputScan.vue"
	import UpInputCheckDocPicker from "@/components/UpInputCheckDocPicker.vue"
	// 工具
	import {
		useDebounce
	} from "@ultra-man/noa"
	// 接口
	import {
		getCheckVouchDetail,
		submitCheckVouch
	} from "@/api/checkVouch"
	// 数据
	import {
		globalColor
	} from "@/store/theme"
	// 类型
	import type {
		CheckVouch
	} from "@/type/business"
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	// 盘点单
	const checkDocSelected = ref < CheckVouch[] > ([])
	const checkDocSelect = async () => {
		// 选择到盘点单后开始查明细
		genTableData()
	}

	// --------------------------------------------------------------------------------表单
	// 表单数据
	const showPopup = ref(false)
	const initEditData = () => {
		return {
			invCode: "",
			invName: "",
			batch: "",
			count: "",
		}
	}
	const editData = ref < Obj > (initEditData())
	const popupTable = ref < Obj[] > ([])
	const scanSuccess = useDebounce((code: string) => {
		if (code) {
			editData.value.invCode = code
			for (const item of tableData.value) {
				if (editData.value.invCode === item.cInvCode) {
					popupTable.value = tableData.value.filter(item => item.cInvCode === editData.value.invCode)
					showPopup.value = true
					return
				}
			}
			// 如果没查到物料
			nextTick(() => {
				editData.value = initEditData()
			})
			uni.showToast({
				icon: "none",
				title: "该物料不存在于该盘点单"
			})
		}
	})
	const tableTdSelect = (item: Obj) => {
		editData.value.invName = item.cInvName
		editData.value.batch = item.cCVBatch
		editData.value.count = item.iCVCQuantity
		showPopup.value = false
	}
	// --------------------------------------------------------------------------------表格
	// 表格
	const loading = ref(false)
	const tableData = ref < Obj[] > ([])
	const genTableData = async () => {
		if (checkDocSelected.value.length > 0) {
			try {
				loading.value = true
				tableData.value = []
				for (const item of checkDocSelected.value) {
					const id = item.id
					const res = await getCheckVouchDetail({
						id
					})
					tableData.value.push(...res.data.detailList)
				}
			} catch (err) {
				console.log(err)
			} finally {
				loading.value = false
			}
		}
	}
	// --------------------------------------------------------------------------------提交
	// 提交
	const submit = () => {
		if (editData.value.count < 0) {
			uni.showToast({
				icon: "none",
				title: "实盘数量不能小于0"
			})
			return
		}
		const origin = editData.value.invCode + editData.value.batch
		for (const item of tableData.value) {
			const target = item.cInvCode + item.cCVBatch
			if (origin === target) {
				item.iCVCQuantity = editData.value.count
				item.cDefine25 = "1"
				break
			}
		}
		editData.value = initEditData()
	}
	const submitDisable = computed(() => {
		return !editData.value.invCode || !editData.value.invName || !editData.value.batch
	})
	// 结束盘点
	const finish = async () => {
		try {
			uni.showLoading({
				icon: "none",
				title: "盘点结果提交中",
				mask: true
			})
			const params = {
				detailList: tableData.value,
				id: checkDocSelected.value[0].id
			}
			const res = await submitCheckVouch(params)
			if (res) {
				tableData.value = []
				uni.showToast({
					title: "盘点结果提交成功",
					icon: "none"
				})
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}

	}
	const finishDisable = computed(() => {
		return tableData.value.length <= 0
	})
</script>

<template>
	<view class="common-page-container">

		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="盘点单:" borderBottom labelWidth="80" style="padding: 0" required>
					<UpInputCheckDocPicker @select="checkDocSelect" border="none" placeholder="请选择盘点单" readonly clearable
						class="input-item" v-model:selected="checkDocSelected">
					</UpInputCheckDocPicker>
				</up-form-item>
			</up-form>
			<view class="common-section-title">
				实盘
			</view>
			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input-scan v-model="editData.invCode" placeholder="扫码/手输物料编码" clearable class="input-item"
						@scanSuccess="scanSuccess"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="80" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="editData.invName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="80" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="editData.batch">
					</up-input>
				</up-form-item>
				<up-form-item class="common-form-item" label="实盘数量:" borderBottom labelWidth="80" style="padding: 0">
					<up-input placeholder="请输入实盘数量" clearable class="input-item" type="number" v-model="editData.count">
					</up-input>
				</up-form-item>
			</up-form>

			<view class="btn-box">
				<up-button type="primary" text="提交" class="bottom-button" shape="circle" @click="submit"
					:disabled="submitDisable"></up-button>
				<up-button type="warning" text="结束" class="bottom-button" shape="circle" @click="finish"
					:disabled="finishDisable"></up-button>
			</view>

			<view class="common-section-title">
				待盘点明细
			</view>
			<view class="common-section-title">
				总数：{{ tableData.length }} 待盘：{{ tableData.filter(item => item.cDefine25 !== '1').length }}
			</view>
		</view>

		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据" :loading="loading">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th class="nowrap" align="left" width="30px">序号</uni-th>
						<uni-th class="nowrap" align="left" width="80px">编码</uni-th>
						<uni-th class="nowrap" align="left" width="80px">名称</uni-th>
						<uni-th class="nowrap" align="left" width="80px">批次</uni-th>
						<uni-th class="nowrap" align="left" width="80px">货位</uni-th>
						<uni-th class="nowrap" align="left" width="80px">账面数</uni-th>
						<uni-th class="nowrap" align="left" width="80px">实盘数</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key" :class="{checked: item.cDefine25 === '1'}">
						<uni-td class="nowrap">{{ key + 1 }}</uni-td>
						<uni-td class="nowrap">{{ item.cInvCode }}</uni-td>
						<uni-td class="nowrap">{{ item.cInvName }}</uni-td>
						<uni-td class="nowrap">{{ item.cCVBatch }}</uni-td>
						<uni-td class="nowrap">{{ item.cPosition }}</uni-td>
						<uni-td class="primary nowrap">{{ item.iCVQuantity }}</uni-td>
						<uni-td class="primary nowrap">{{ item.iCVCQuantity }}</uni-td>
					</uni-tr>
				</uni-table>
			</view>

			<u-popup :show="showPopup" mode="bottom" @close="showPopup = false" safeAreaInsetTop>
				<view class="popup-content common-page-container" style="height: 80vh">
					<view class="common-section-title">
						物料批次选择
					</view>
					<view class="popup-form common-page-largest">
						<uni-table border stripe emptyText="暂无更多数据" :loading="loading">
							<!-- 表头行 -->
							<uni-tr>
								<uni-th class="nowrap" align="left" width="30px">序号</uni-th>
								<uni-th class="nowrap" align="left" width="80px">编码</uni-th>
								<uni-th class="nowrap" align="left" width="80px">名称</uni-th>
								<uni-th class="nowrap" align="left" width="80px">批次</uni-th>
								<uni-th class="nowrap" align="left" width="80px">货位</uni-th>
								<uni-th class="nowrap" align="left" width="80px">账面数</uni-th>
								<uni-th class="nowrap" align="left" width="80px">实盘数</uni-th>
							</uni-tr>
							<!-- 表格数据行 -->
							<uni-tr v-for="item,key in popupTable" :key="key" @click="tableTdSelect(item)">
								<uni-td class="nowrap">{{ key + 1 }}</uni-td>
								<uni-td class="nowrap">{{ item.cInvCode }}</uni-td>
								<uni-td class="nowrap">{{ item.cInvName }}</uni-td>
								<uni-td class="nowrap">{{ item.cCVBatch }}</uni-td>
								<uni-td class="nowrap">{{ item.cPosition }}</uni-td>
								<uni-td class="primary nowrap">{{ item.iCVQuantity }}</uni-td>
								<uni-td class="primary nowrap">{{ item.iCVCQuantity }}</uni-td>
							</uni-tr>
						</uni-table>
					</view>
				</view>
			</u-popup>

		</view>

		<!-- 		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalSize" :current="searchParam.page"
				:pageSize="searchParam.size" @change="pageChange"></uni-pagination>
		</view> -->

		<!-- 		<view class="btn-box">
			<up-button type="primary" text="提交调整" class="bottom-button" shape="circle"></up-button>
		</view> -->

	</view>

</template>

<style scoped lang='scss'>
	.btn-box {
		margin-top: 10px;
		display: flex;

		.bottom-button+.bottom-button {
			margin-left: 12rpx
		}
	}

	.checked {
		background-color: v-bind("globalColor.primary_background") !important;
	}
</style>