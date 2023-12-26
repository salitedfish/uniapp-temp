<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
	} from 'vue';
	// 组件
	import UpInputMaterielPicker from "@/components/UpInputMaterielPicker.vue"
	import UpInputCheckDocPicker from "@/components/UpInputCheckDocPicker.vue"
	// 工具
	// 接口
	import {
		getCheckVouchDetail
	} from "@/api/checkVouch"
	// 数据
	// 类型
	import type {
		Business,
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
	// 扫码或输入物料编码
	const materialInputValue = ref("")
	const materialSelected = ref < Business[] > ([])
	const materielSelect = () => {
		if (materialSelected.value.length > 0) {
			materialInputValue.value = materialSelected.value[0].code
			materielName.value = materialSelected.value[0].name
			materielBatch.value = materialSelected.value[0].bInvBatch
		}
	}
	const scanSuccess = (code: string) => {
		materialInputValue.value = code
	}

	// 表单数据
	const materielName = ref("")
	const materielBatch = ref("")
	const actualCount = ref(null)

	// 表格
	const loading = ref(false)
	const tableData = ref < Record < string,
		any > [] > ([])
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

	// 提交
	const submit = () => {
		// 提交一个盘点获取一次新的数据
		genTableData()
	}
	// 结束盘点
	const finish = () => {}
</script>

<template>
	<view class="common-page-container">

		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="盘点单:" borderBottom labelWidth="100" style="padding: 0" required>
					<UpInputCheckDocPicker @select="checkDocSelect" border="none" placeholder="请选择盘点单" readonly clearable
						class="input-item" v-model:selected="checkDocSelected" multiple>
					</UpInputCheckDocPicker>
				</up-form-item>
			</up-form>
			<view class="common-section-title">
				实盘
			</view>
			<up-form class="common-form" labelPosition="left">
				<up-form-item class="common-form-item" label="物料编码:" borderBottom labelWidth="100" style="padding: 0">
					<UpInputMaterielPicker @select="materielSelect" placeholder="扫码/手输物料编码" clearable class="input-item"
						v-model:selected="materialSelected" v-model="materialInputValue" @scanSuccess="scanSuccess" scan
						searchKey="condition">
					</UpInputMaterielPicker>
				</up-form-item>

				<up-form-item class="common-form-item" label="物料名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="materielName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="批次号:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="materielBatch">
					</up-input>
				</up-form-item>
				<up-form-item class="common-form-item" label="实盘数量:" borderBottom labelWidth="100" style="padding: 0">
					<up-input placeholder="请输入实盘数量" clearable class="input-item" type="number" v-model="actualCount">
					</up-input>
				</up-form-item>
			</up-form>

			<view class="btn-box">
				<up-button type="primary" text="提交" class="bottom-button" shape="circle" @click="submit"></up-button>
				<up-button type="warning" text="结束" class="bottom-button" shape="circle" @click="finish"></up-button>
			</view>

			<view class="common-section-title">
				待盘点明细
			</view>
			<view class="common-section-title">
				总数：{{ tableData.length }} 待盘：{{ tableData.filter(item => item.iCVQuantity !== item.iCVCQuantity).length }}
			</view>
		</view>

		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据" :loading="loading">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th align="left" width="30px">序号</uni-th>
						<uni-th align="left" width="50px">编码</uni-th>
						<uni-th align="left" width="100px">名称</uni-th>
						<uni-th align="left" width="50px">批次</uni-th>
						<uni-th align="left" width="80px">货位</uni-th>
						<uni-th align="left" width="80px">账面数</uni-th>
						<uni-th align="left" width="80px">实盘数</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key">
						<uni-td>{{ key + 1 }}</uni-td>
						<uni-td>{{ item.cInvCode }}</uni-td>
						<uni-td>{{ item.cInvName }}</uni-td>
						<uni-td>{{ item.cCVBatch }}</uni-td>
						<uni-td>{{ item.cPosition }}</uni-td>
						<uni-td class="primary">{{ item.iCVQuantity }}</uni-td>
						<uni-td class="primary">{{ item.iCVCQuantity }}</uni-td>
					</uni-tr>
				</uni-table>
			</view>
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
</style>