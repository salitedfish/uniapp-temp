<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		onMounted
	} from 'vue';
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	// 接口
	import {
		useTimeFormat
	} from "@ultra-man/noa"
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
			url: routes.srCDefaultSetPage.path
		})
	}

	onMounted(() => {
		dateSelected.value = [useTimeFormat("{YYYY}-{MM}-{dd}")(Date.now()).format]
	})

	// 表单
	const materialInputValue = ref("")
	const materialSelected = ref < Materiel[] > ([])
	const materielSelect = (materiels: Materiel[]) => {}

	const shelfInputValue = ref("")
	const shelfSelected = ref < Materiel[] > ([])
	const shelfSelect = (materiels: Materiel[]) => {}

	const scanSuccess = () => {}

	// 日期
	const dateSelected = ref < string[] > ([])

	// 表格
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
		<CustomNavBar :title="routes.stockroomChange.style.navigationBarTitleText" @rightClick="rightClick"></CustomNavBar>

		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="100" style="padding: 0">
					<UpInputMaterielPicker @select="materielSelect" placeholder="扫码/手输物料编码" clearable class="input-item"
						v-model:selected="materialSelected" v-model="materialInputValue" scan>
					</UpInputMaterielPicker>
				</up-form-item>

				<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly>
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly>
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次现存量:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly type="number">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="原货位编码:" borderBottom labelWidth="100" style="padding: 0">
					<UpInputMaterielPicker @select="shelfSelect" placeholder="扫码/手输货位码" clearable class="input-item"
						v-model:selected="shelfSelected" v-model="shelfInputValue" scan>
					</UpInputMaterielPicker>
				</up-form-item>

				<up-form-item class="common-form-item" label="原货位名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly>
					</up-input>
				</up-form-item>

				<up-form-item required class="common-form-item" label="新货位:" borderBottom labelWidth="100" style="padding: 0">
					<up-input-scan border="none" placeholder="请扫新货位" clearable class="input-item" @scanSuccess="scanSuccess"
						readonly></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="新货位名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly>
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="调整数量:" borderBottom labelWidth="100" style="padding: 0">
					<up-input placeholder="大于0,小于现存量" clearable class="input-item" type="number" :min="0">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="制单日期:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDatePicker border="none" placeholder="选择制单日期" clearable class="input-item" readonly
						v-model:selected="dateSelected">
					</UpInputDatePicker>
				</up-form-item>
			</up-form>
			<view class="btn-box">
				<up-button type="primary" text="加入" class="bottom-button" shape="circle"></up-button>
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
						<uni-th align="left" width="60rpx">序号</uni-th>
						<uni-th align="left" width="100rpx">编码</uni-th>
						<uni-th align="left" width="100rpx">名称</uni-th>
						<uni-th align="left" width="100rpx">批次</uni-th>
						<uni-th align="left" width="100rpx">数量</uni-th>
						<uni-th align="left" width="100rpx">老货位</uni-th>
						<uni-th align="left" width="100rpx">新货位</uni-th>
						<uni-th align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key">
						<uni-td>{{ key + 1 }}</uni-td>
						<uni-td>{{ item.code }}</uni-td>
						<uni-td>{{ item.name }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td>{{ item.num }}</uni-td>
						<uni-td class="warning" @click.stop="deleteTable">删除</uni-td>
					</uni-tr>
				</uni-table>
			</view>
		</view>

		<!-- 		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalSize" :current="searchParam.page"
				:pageSize="searchParam.size" @change="pageChange"></uni-pagination>
		</view> -->

		<view class="btn-box">
			<up-button type="primary" text="提交调整" class="bottom-button" shape="circle"></up-button>
		</view>

	</view>

</template>

<style scoped lang='less'>
	.btn-box {
		margin-top: 10px
	}
</style>