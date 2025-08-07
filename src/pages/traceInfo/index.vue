<template>
	<view class="common-page-container">
		<CustomNavBar :title="procedureName"></CustomNavBar>

		<AutoConnectBlueTooth ref="autoConnectBlueTooth" v-if="[P.打包].includes(form.procedureCode) || form.printed == 1">
		</AutoConnectBlueTooth>

		<up-steps :current="form.activeNum" style="margin-top: 10px; overflow-x: scroll">
			<up-steps-item v-for="(item, key) in processList" :key="key" :title="item.procedureName"
				:error="item.result != 1 && key != form.activeNum"></up-steps-item>
		</up-steps>

		<!-- 基础数据表单 -->
		<up-form class="common-form" :class="{ 'common-form-next': form.procedureCode === P.打包 && Platform.isApp() }"
			labelPosition="left">
			<!-- 			<up-form-item class="common-form-item" label="指导书:" borderBottom labelWidth="80" style="padding: 0">
				<up-button type="primary" class="btn" size="small" @click="useDownloadByURL(processDetail.fileUrl)('作业指导书')">
					点 击 下 载</up-button>
			</up-form-item> -->

			<up-form-item class="common-form-item" label="计划单号:" borderBottom labelWidth="80" style="padding: 0" required>
				<up-input-scan v-model="form.planCode" placeholder="请输入计划单号" clearable class="input-item"
					@scanSuccess="getPlanInfo"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="产品编码:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.productCode" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="客户件号:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.cusProductCode" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="计划数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.planNum" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="实际数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.realNum" placeholder="计划单号自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="装箱数量:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.打包].includes(form.procedureCode)">
				<up-input v-model="form.packageNum" placeholder="自动带出" clearable class="input-item" readonly
					border="none"></up-input>
			</up-form-item>

			<!-- ----------------------------------------根据不同模版显示不同选项------------------------------------- -->
			<up-form-item class="common-form-item" label="检具编码:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.procedureCode == P.定制流程1">
				<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode2ScanSuccess"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="包装码:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.procedureCode == P.定制流程2">
				<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode2ScanSuccess"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="标签码:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.procedureCode == P.定制流程3">
				<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode2ScanSuccess"></up-input-scan>
			</up-form-item>

			<!-- 条码自配展示的输入框 -->
			<up-form-item class="common-form-item" :label="`${item.codeName}:`" borderBottom labelWidth="80"
				style="padding: 0" required v-if="[P.条码自配, P.打包, P.终检].includes(form.procedureCode)"
				v-for="(item, key) in codeRules" :key="key">
				<up-input-scan :focus="item.inputFocus" v-model="item.barCode" placeholder="请输入条码" clearable class="input-item"
					@focus="customInputFocus" @scanSuccess="(str: string) => codeRuleScanSuccess(str, item, key)"
					@blur="item.inputFocus = false"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" :label="`${form.barcodeName1}:`" borderBottom labelWidth="80"
				style="padding: 0" :required="form.scanCode !== 1" v-if="![P.条码自配, P.打包, P.终检].includes(form.procedureCode)">
				<!-- 后端配了必须扫码才必须要扫码 -->
				<up-input-scan v-model="form.barcode1" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode1ScanSuccess"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" :label="`${form.barcodeName2}:`" borderBottom labelWidth="80"
				style="padding: 0" required v-if="form.procedureKindCode == PK.条码关联">
				<up-input-scan v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"
					@scanSuccess="barcode2ScanSuccess"></up-input-scan>
			</up-form-item>

			<template v-if="form.procedureCode == P.多原料绑定">
				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode3" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode4" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode5" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="来料批次条码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input v-model="form.barcode6" placeholder="请输入条码" clearable class="input-item"></up-input>
				</up-form-item>
			</template>

			<up-form-item class="common-form-item" label="客供条码:" borderBottom labelWidth="80" style="padding: 0"
				v-if="form.procedureCode == P.条码关联返工">
				<up-input v-model="form.barcode2" placeholder="请输入条码" clearable class="input-item"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
				<up-input v-model="form.thisNum" placeholder="请输入数量" clearable class="input-item" type="number"></up-input>
			</up-form-item>

			<!-- ----------------------------------------end------------------------------------- -->
		</up-form>

		<!-- 检验单 -->
		<up-text text="检验单明细:" class="grid-title" bold v-if="checkRecords && checkRecords.length"></up-text>
		<CheckRecord :checkItems="checkRecords" :form="form" @setFormResult="setFormResult" @setFailureMod="setFailureMod"
			v-if="checkRecords && checkRecords.length"> </CheckRecord>

		<!-- ----------------------------------------参数表单---------------------------------------- -->
		<up-form class="common-form common-form-next" labelPosition="left">
			<up-form-item class="common-form-item" label="是否返工:" borderBottom labelWidth="120" style="padding: 0"
				v-if="[P.扫码登记返工, P.条码关联返工].includes(form.procedureCode) || form.reworked === 1">
				<u-radio-group placement="row" class="radio-group" v-model="form.submitType">
					<u-radio :name="'2'" label="是"></u-radio>
					<u-radio :name="'1'" label="否" style="margin-left: 10px"></u-radio>
				</u-radio-group>
			</up-form-item>

			<up-form-item class="common-form-item" label="是否合格:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.statistics == '1'">
				<u-radio-group placement="row" class="radio-group" v-model="form.result">
					<u-radio :name="'1'" label="是"></u-radio>
					<u-radio :name="'0'" label="否" style="margin-left: 10px"></u-radio>
				</u-radio-group>
			</up-form-item>

			<up-form-item class="common-form-item" label="失效模式:" borderBottom labelWidth="80" style="padding: 0" required
				v-if="form.result === '0'">
				<TraceFailureModPicker v-model:selected="failureModSelected" @select="failuerModSelect"
					:processId="form.processId" :orgIds="form.orgIds" readonly border="none" placeholder="请选择失效模式"
					:multiple="true">
				</TraceFailureModPicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="附件:" borderBottom labelWidth="80" style="padding: 0"
				v-if="form.procedureKindCode == PK.扫码登记 || (form.procedureKindCode == PK.定制流程 && [P.多原料绑定, P.条码关联返工, P.扫码登记返工].includes(form.procedureCode))">
				<media-upload v-model="form.images" accept="image"></media-upload>
			</up-form-item>

			<!-- 设备选择 -->
			<up-form-item class="common-form-item" label="设备编码:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.条码自配, PK.数据采集].includes(form.procedureCode) && equipments && equipments.length > 0">
				<up-input v-model="form.equipmentCode" @change="equipmentCodeChange" placeholder="请选择设备" class="input-item"
					clearable>
					<template #suffix>
						<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
							@click="openEquipmentPicker"></uni-icons>
						<up-picker :show="showEquipmentPicker" :columns="equipments" @confirm="equipmentSelect"
							@cancel="showEquipmentPicker = false" keyName="equipmentName"></up-picker>
					</template>
				</up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="设备名称:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.条码自配].includes(form.procedureCode) && equipments && equipments.length > 0">
				<up-input v-model="form.equipmentName" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="设备数据:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.条码自配].includes(form.procedureCode) && equipments && equipments.length > 0">
				<up-textarea v-model="form.equipmentContent" placeholder="自动带出" class="input-item" disabled></up-textarea>
			</up-form-item>
			<up-form-item class="common-form-item" label="结果:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.条码自配].includes(form.procedureCode) && equipments && equipments.length > 0">
				<up-input :modelValue="ResultMap[form.result]" placeholder="自动带出" readonly class="input-item"
					border="none"></up-input>
			</up-form-item>

			<!-- 终检这步需要显示另一台设备的数据------------------------------------------------------------------------------------------- -->
			<up-form-item class="common-form-item" label="设备编码:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-input v-model="form.equipmentCode1" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="设备名称:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-input v-model="form.equipmentName1" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="设备数据:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-textarea v-model="form.equipmentContent1" placeholder="自动带出" class="input-item" disabled></up-textarea>
			</up-form-item>
			<up-form-item class="common-form-item" label="结果:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-input :modelValue="ResultMap[form.result1]" placeholder="自动带出" readonly class="input-item"
					border="none"></up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="设备编码:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-input v-model="form.equipmentCode2" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="设备名称:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-input v-model="form.equipmentName2" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
			</up-form-item>
			<up-form-item class="common-form-item" label="设备数据:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-textarea v-model="form.equipmentContent2" placeholder="自动带出" class="input-item" disabled></up-textarea>
			</up-form-item>
			<up-form-item class="common-form-item" label="结果:" borderBottom labelWidth="80" style="padding: 0"
				v-if="[P.终检].includes(form.procedureCode)">
				<up-input :modelValue="ResultMap[form.result2]" placeholder="自动带出" readonly class="input-item"
					border="none"></up-input>
			</up-form-item>
			<!-- ------------------------------------------------------------------------------------------------------------------ -->

			<up-form-item class="common-form-item" label="工装/模具:" borderBottom labelWidth="80" style="padding: 0"
				v-if="![P.条码自配, P.打包, P.终检].includes(form.procedureCode)">
				<up-input-scan v-model="form.toolingCode" @scanSuccess="toolingScanSuccess" placeholder="请输入工装/模具" clearable
					class="input-item"></up-input-scan>
			</up-form-item>
		</up-form>
		<!-- ----------------------------------------end---------------------------------------- -->

		<!-- 是否打印 -->
		<!-- 		<PrintTypeCheck class="print-check-box" v-model="printTypeCheck" label="是否打印:" style="margin-top: 10px"
			v-if="[P.打包].includes(form.procedureCode)"> </PrintTypeCheck> -->

		<!-- 按钮操作 -->
		<view class="btn-box" v-if="form.procedureKindCode === PK.条码关联">
			<up-button type="primary" class="btn" shape="circle" @click="submit">绑 定</up-button>
			<up-button type="error" class="btn" shape="circle" v-if="form.unbind == 1" @click="submitDel">解 绑</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1A2">重 置</up-button>
		</view>

		<view v-if="form.procedureKindCode === PK.数据采集 && equipmentLoading" style="text-align: center; margin-top: 5px"
			class="success">设备数据采集中...</view>
		<view class="btn-box" v-if="form.procedureKindCode === PK.数据采集">
			<up-button type="primary" class="btn" shape="circle" @click="submit">确 认</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1">更 换</up-button>
		</view>

		<view class="btn-box" v-if="form.procedureKindCode === PK.扫码登记">
			<up-button type="primary" class="btn" shape="circle" @click="submit">确 认</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1">重 置</up-button>
		</view>

		<view class="btn-box" v-if="form.procedureKindCode === PK.定制流程">
			<up-button type="primary" class="btn" shape="circle" v-if="form.procedureCode === P.定制流程1"
				@click="submit">检具检测</up-button>
			<up-button type="primary" class="btn" shape="circle" v-else-if="form.procedureCode === P.定制流程2"
				@click="submit">包装检测</up-button>
			<up-button type="primary" class="btn" shape="circle" v-else-if="form.procedureCode === P.定制流程3"
				@click="submit">标签码检测</up-button>
			<up-button type="primary" class="btn" shape="circle" v-else @click="submit">确 认</up-button>
			<up-button type="primary" class="btn" shape="circle" @click="resetBarCode1A2">重 置</up-button>
		</view>

		<!-- 打印操作 -->
		<view class="btn-box" v-if="form.procedureCode === P.打包">
			<BoxBarcodePrinter :productCode="form.productCode" :cusProductCode="form.cusProductCode" :codeRule="codeRules[1]"
				v-if="codeRules[1]" @genSuccess="boxBarcodeGenSuccess">
			</BoxBarcodePrinter>
			<!-- @startHideKeyboard="startHideKeyboard" @stopHideKeyboard="stopHideKeyboard" -->
			<BoxBarcodeRePrinter style="margin-left: 5px"> </BoxBarcodeRePrinter>
		</view>
		<view class="btn-box" v-if="form.printed == 1">
			<BoxBarcodePrinter1 :productCode="form.productCode" :cusProductCode="form.cusProductCode" :codeRule="codeRules[1]"
				v-if="codeRules[1]" @genSuccess="boxBarcodeGenSuccess">
			</BoxBarcodePrinter1>
			<BoxBarcodeRePrinter1 style="margin-left: 5px"> </BoxBarcodeRePrinter1>
		</view>

		<!-- 表格 -->
		<TraceTablePK1 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.条码关联">
		</TraceTablePK1>
		<TraceTablePK2 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.数据采集">
		</TraceTablePK2>
		<TraceTablePK3 ref="traceTableRef" :form="form" style="margin-top: 10px" v-if="form.procedureKindCode === PK.扫码登记">
		</TraceTablePK3>
		<TraceTablePK4 ref="traceTableRef" :form="form" style="margin-top: 10px"
			v-if="form.procedureKindCode === PK.定制流程 && ![P.条码自配, P.打包, P.终检].includes(form.procedureCode)">
		</TraceTablePK4>
		<TraceTablePK5 ref="traceTableRef" :form="form" :codeRules="codeRules" style="margin-top: 10px"
			v-if="[P.条码自配, P.打包, P.终检].includes(form.procedureCode)"> </TraceTablePK5>

		<CustomModal></CustomModal>
	</view>
</template>

<script lang="ts" setup>
	import { ref, onMounted, onBeforeUnmount, watch, nextTick, reactive } from "vue"
	// 类型
	import type { UploadMedia } from "@/type/file"
	// 组件
	import TraceTablePK1 from "./components/TraceTablePK1.vue"
	import TraceTablePK2 from "./components/TraceTablePK2.vue"
	import TraceTablePK3 from "./components/TraceTablePK3.vue"
	import TraceTablePK4 from "./components/TraceTablePK4.vue"
	import TraceTablePK5 from "./components/TraceTablePK5.vue"
	import UpInputScan from "@/components/UpInputScanNew.vue"
	import MediaUpload from "@/components/MediaUpload.vue"
	import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"
	import CheckRecord from "./components/CheckRecord.vue"
	import PrintTypeCheck from "@/components/PrintTypeCheck.vue"
	import AutoConnectBlueTooth from "@/components/AutoConnectBlueTooth.vue"
	import BoxBarcodePrinter from "./components/BoxBarcodePrinter.vue"
	import BoxBarcodePrinter1 from "./components/BoxBarcodePrinter1.vue"
	import BoxBarcodeRePrinter from "./components/BoxBarcodeRePrinter.vue"
	import BoxBarcodeRePrinter1 from "./components/BoxBarcodeRePrinter1.vue"
	import { setCustomModal } from "@/store/customModal"
	// 数据
	import { routes } from "@/store/route"
	import { printPage } from "@/store/print"
	import { blueToothStore } from "@/store/blueTooth"
	import { Printer } from "@/fun/printer"
	import { globalColor } from "@/store/theme"
	import { Platform } from "@/util/env"
	// 工具
	import { useThrottle, useDebounce, useRmRepeat, useDownloadByURL } from "@ultra-man/noa"
	import {
		printBoxBarcode
	} from "./util"
	// @ts-ignore
	import mqtt from "mqtt/dist/mqtt.js"
	// 接口
	import {
		getPackageNumApi,
		getProcessDetail,
		getLineDetail,
		getEquipmentByLineDetailId,
		getCheckItemListApi,
		productJobSubmit,
		productJobDel,
		checkHeadTail,
		codeCheckInfoApi,
		findCardByUrl,
		getTraceList2,
		getTraceLineDetail,
		traceResetPlc,
		getTwoEquipmentDataApi,
	} from "@/api/trace"
	import { getWorkPlan } from "@/api/workPlan"
	import { getProductByCode } from "@/api/product"
	import {
		getBarcodeList
	} from "@/api/codeRule"
	// 静态数据
	import { P, PK, BarcodeNames, ResultMap } from "./enum"

	const props = defineProps<{
		lineDetailId ?: string
		procedureName ?: string
		planCode ?: string
	}>()

	// app端有些输入框禁止人员手动输入，只能用扫码枪
	const customInputFocus = () => {
		if (Platform.isApp()) {
			uni.hideKeyboard()
		}
	}

	// // 隐藏和显示小键盘
	// const startHideKeyboard = () => {
	// 	hideKeyboardInterval = setInterval(() => {
	// 		uni.hideKeyboard()
	// 	}, 60)
	// }
	// const stopHideKeyboard = () => {
	// 	clearInterval(hideKeyboardInterval)
	// }

	onMounted(async () => {
		// // app端隐藏虚拟键盘
		// if (Platform.isApp()) {
		// 	startHideKeyboard()
		// }
		// 获取产线详情
		if (props.lineDetailId) {
			await getLine()
		}
		// 获取计划详情
		if (props.planCode) {
			await getPlanInfo(props.planCode)
		}
		// 获取工序详情
		// await getProcess()
		// 打包这一步需要蓝牙打印标签，自动连接蓝牙
		if (autoConnectBlueTooth.value && [P.打包].includes(form.value.procedureCode)) {
			autoConnectBlueTooth.value.checkBlueTooth()
		}
	})
	onBeforeUnmount(() => {
		clearInterval(Number(airtightnessInterval))
		// if (Platform.isApp()) {
		// 	stopHideKeyboard()
		// }
		if (mqttClient) {
			mqttClient.end()
			mqttClient = null
		}
	})

	// 初始化函数
	const oriForm = () => {
		return {
			orgIds: "",
			lineId: "",
			lineDetailId: props.lineDetailId,
			planId: "",
			planCode: props.planCode,
			processId: 0,
			productCode: "",
			cusProductCode: "",
			planNum: null as Num,
			realNum: null as Num,
			packageNum: null as Num,
			// 提交数量
			thisNum: 1,
			// 是否需要检验单
			checked: "",
			// 首末件检查
			checkFirstFinal: 0,
			firstNum: 0,
			finalNum: 0,
			// 各条码
			barcode1: "",
			barcodeName1: "",
			barcode2: "",
			barcodeName2: "",
			barcode3: "",
			barcode4: "",
			barcode5: "",
			barcode6: "",
			scanCode: 0,
			// 条码关联
			relation1: "",
			relation2: "",
			unbind: 0,
			images: [] as UploadMedia[],
			fileUrl: "",
			fileName: "",
			toolingCode: "",
			remark: "",
			// 设备
			equipmentCode: "",
			equipmentMac: "",
			equipmentName: "",
			equipmentContent: "",
			// 设备1
			equipmentCode1: "",
			equipmentMac1: "",
			equipmentName1: "",
			equipmentContent1: "",
			// 设备2
			equipmentCode2: "",
			equipmentMac2: "",
			equipmentName2: "",
			equipmentContent2: "",
			// 提交类型
			submitType: "1",
			statistics: "",
			// 最终结果
			result: "1" as keyof typeof ResultMap,
			result1: "1" as keyof typeof ResultMap,
			result2: "2" as keyof typeof ResultMap,
			// 失效模式
			failureModeIds: "",
			failureModeNames: "",
			// 模版
			procedureCode: "" as P,
			procedureKindCode: 0 as PK,
			// 编码规则
			codeRules: [] as Objs,
			// 是否显示返工按钮
			reworked: 0,
			activeNum: null as Num,
			// 是否控制设备
			resetPlc: 0,
			// 是否打印
			printed: 0
		}
	}
	const oriCodeCheckInfo = () => {
		return {
			canSave: 0,
		}
	}

	// 数据
	const form = ref(oriForm())
	const codeRules = ref<Objs>([])
	// const processDetail = ref < Obj > ({})
	let airtightnessInterval : undefined | number = undefined
	let hideKeyboardInterval : undefined | number = undefined
	const equipments = ref<Objs[]>([])
	const checkRecords = ref<Objs>([])
	const failureModSelected = ref<Objs>([])
	const printTypeCheck = ref(uni.getStorageSync("productPrintTypeCheck") || 0)
	const equipmentLoading = ref(false)
	const codeCheckInfo = ref<Obj>(oriCodeCheckInfo())
	const traceTableRef = ref<Obj | null>(null)
	const showEquipmentPicker = ref(false)
	const autoConnectBlueTooth = ref<Obj | undefined>()
	let mqttClient : mqtt.MqttClient | null = null
	const processList = ref<Objs>([])

	// 是否打印
	watch(printTypeCheck, (newV : number) => {
		uni.setStorageSync("productPrintTypeCheck", newV)
	})

	// 获取流程详情
	// const getProcess = async () => {
	// 	const res = await getProcessDetail({
	// 		lineDetailId: props.lineDetailId
	// 	})
	// 	processDetail.value = res.data
	// }
	// 获取产线详情
	const getLine = async () => {
		try {
			uni.showLoading({
				mask: true,
				title: "产线详情获取中",
			})
			const res = await getLineDetail({
				lineDetailId: props.lineDetailId,
			})
			const {
				resetPlc,
				lineId,
				procedureCode,
				procedureKindCode,
				processId,
				factoryId,
				submitType = "1",
				statistics,
				relation1,
				relation2,
				unbind,
				scanCode,
				checked,
				checkFirstFinal,
				codeRules,
				reworked,
				printed
			} = res.data
			form.value.processId = processId
			form.value.lineId = lineId
			form.value.orgIds = factoryId
			form.value.procedureCode = procedureCode
			form.value.procedureKindCode = procedureKindCode
			form.value.submitType = String(submitType)
			form.value.statistics = statistics
			form.value.barcodeName1 = BarcodeNames[relation1] || ""
			form.value.barcodeName2 = BarcodeNames[relation2] || ""
			form.value.unbind = unbind
			form.value.scanCode = scanCode
			form.value.checkFirstFinal = checkFirstFinal
			form.value.codeRules = codeRules ? JSON.parse(codeRules) : []
			form.value.reworked = reworked
			form.value.checked = checked || ""
			form.value.resetPlc = resetPlc;
			form.value.printed = printed;

			// 获取当前工序在此产线当中的步骤序号
			const ree = await getTraceLineDetail({
				lineId: form.value.lineId,
			})
			if (ree.data && ree.data.list) {
				ree.data.list.forEach((row : Obj, index : number) => {
					if (row.lineDetailId == form.value.lineDetailId) {
						form.value.activeNum = index
					}
				})
			}

			// 如果是数据采集
			if (form.value.procedureKindCode == PK.数据采集) {
				// 获取设备
				getEquipment()
				// 定时获取报工列表
				airtightnessInterval = setInterval(() => {
					if (traceTableRef.value) {
						traceTableRef.value.searchList({
							barcode1: form.value.barcode1,
						})
					}
				}, 10000)
			}
			// 如果是条码自配
			if ([P.条码自配].includes(form.value.procedureCode)) {
				// 获取设备
				getEquipment()
				// 连接mqtt
				initWebSocket()
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}
	// mqtt相关
	const initWebSocket = () => {
		mqttClient = mqtt.connect(import.meta.env.VITE_BASE_API_URL_WEB_WEBSOCKET, {
			username: "admin",
			password: "a@123456",
			clientId: "YinShenMobile_" + Date.now(),
		})
		// 监听消息
		mqttClient.on("message", (topic : Obj, message : string) => {
			try {
				const servies = JSON.parse(message.toString()).body.things
				console.log("所选择的设备编码：", form.value.equipmentCode)
				console.log("mqtt推送数据：", servies)

				// 监听到数据后，mqtt会返回所有设备的数据，需要通过对应的设备筛选
				let equipmentData : Obj | null = null
				for (const item of servies) {
					// 找到工序对应的设备,获取对应数据
					if (form.value.equipmentCode == item.id) {
						if (item.items[0]) {
							equipmentData = item.items[0].properties
							console.log("mqtt匹配到的设备数据：", equipmentData)
						}
					}
				}

				// 如果匹配到数据，则赋值到form中
				if (equipmentData) {
					// 赋值存储数据
					form.value.equipmentContent = equipmentData.equipment_parameters
					// 赋值最终的结果,如果结果是空的则默认合格
					if (!equipmentData.result || equipmentData.result === "OK") {
						form.value.result = "1"
					} else if (equipmentData.result === "NG") {
						form.value.result = "0"
					}
				}
			} catch (err) {
				setCustomModal({
					visiable: true,
					content: String(err),
				})
			}
		})
		// 订阅主题
		const theme = "v4/p/post/thing/live/json/1.1"
		mqttClient.subscribe(
			theme,
			{
				qos: 0,
			},
			(err : string) => {
				if (!err) {
					console.log("mqtt订阅成功")
				} else {
					setCustomModal({
						visiable: true,
						content: `mqtt订阅失败：${err}`,
					})
				}
			}
		)
	}
	// 获取设备
	const getEquipment = async () => {
		const res = await getEquipmentByLineDetailId({
			lineDetailId: props.lineDetailId,
		})
		if (res.data && res.data.length > 0) {
			equipments.value[0] = res.data.map((item) => {
				return {
					equipmentCode: item.moldCode,
					equipmentName: item.moldName,
				}
			})
			const equipment = JSON.parse(uni.getStorageSync("traceEquipment") || "{}")
			form.value.equipmentCode = equipment.equipmentCode
			form.value.equipmentName = equipment.equipmentName
		}
	}
	// 打开设备选择项
	const openEquipmentPicker = () => {
		showEquipmentPicker.value = true
	}
	// 设备编码改变时
	const equipmentCodeChange = useDebounce((res : string) => {
		const arr = {
			value: [
				{
					equipmentCode: res,
				},
			],
		}
		equipmentSelect(arr)
	})
	// 选择设备
	const equipmentSelect = useThrottle(async (res : { value : Objs }) => {
		// 选择设备后重置设备数据和结果
		form.value.equipmentContent = ""
		form.value.result = "1"
		// 扫的码有可能是url地址，要通过地址来获取设备编码
		let code = res.value[0].equipmentCode
		if (code.indexOf("http") !== -1) {
			try {
				uni.showLoading({
					mask: true,
					title: "设备获取中",
				})
				const ree = await findCardByUrl({
					url: code,
				})
				if (ree.data) {
					code = ree.data.split(",")[0]
				}
				form.value.equipmentCode = code
			} catch (err) {
				console.log(err)
			} finally {
				uni.hideLoading()
			}
		}
		// 通过设备编码来获取设备名称
		showEquipmentPicker.value = false
		for (const item of equipments.value[0]) {
			if (item.equipmentCode === code) {
				form.value.equipmentCode = item.equipmentCode
				form.value.equipmentName = item.equipmentName
				uni.setStorageSync(
					"traceEquipment",
					JSON.stringify({
						equipmentCode: form.value.equipmentCode,
						equipmentName: form.value.equipmentName,
					})
				)
				return
			}
		}
		// 如果码不正确，则都置空
		form.value.equipmentCode = ""
		form.value.equipmentName = ""
	})
	// 获取计划详情
	const getPlanInfo = async (res ?: string) => {
		form.value.planCode = res
		if (form.value.planCode) {
			try {
				uni.showLoading({
					mask: true,
					title: "计划详情获取中",
				})
				const res = await getWorkPlan({
					planCode: form.value.planCode,
					lineDetailId: form.value.lineDetailId,
				})
				const { planId, productCode, planNum, realNum, firstNum, finalNum } = res.data
				form.value.planId = planId
				form.value.productCode = productCode
				form.value.planNum = planNum
				form.value.realNum = realNum
				form.value.firstNum = firstNum
				form.value.finalNum = finalNum
				console.log(2, productCode)
				// 获取产品详情
				const ree = await getProductByCode({
					productCode,
				})
				if (ree && ree.data) {
					form.value.cusProductCode = ree.data.cusProductCode
				}
				// 获取完计划，如果不是数据采集，则获取一次列表
				if (form.value.procedureKindCode !== PK.数据采集 && traceTableRef.value) {
					traceTableRef.value.searchList({
						lineDetailId: form.value.lineDetailId,
						planId: form.value.planId,
					})
				}
				// 如果需要检验单的则获取检验单
				if (form.value.checked == "1") {
					await getCheckItemList()
				}
				// 如果是条码自配，则获取条码规则
				if ([P.条码自配, P.打包, P.终检].includes(form.value.procedureCode)) {
					getCodeRules()
				}
				// 如果是条码自配，结果默认1
				if ([P.条码自配].includes(form.value.procedureCode)) {
					form.value.result = "1"
				}
				// 终检默认为2
				else if ([P.终检].includes(form.value.procedureCode)) {
					form.value.result = "1"
					form.value.result1 = "2"
					form.value.result2 = "2"
				}
				// 如果不是条码自配，结果默认1
				else {
					form.value.result = "1"
				}
			} catch (err) {
				initFormPlan()
			} finally {
				uni.hideLoading()
			}
		} else {
			initFormPlan()
		}
	}
	const initFormPlan = () => {
		form.value.planCode = ""
		form.value.productCode = ""
		form.value.planNum = 0
		form.value.realNum = 0
		form.value.checked = ""
	}
	// 获取条码规则
	const getCodeRules = (complete ?: boolean) => {
		for (const item of form.value.codeRules) {
			// 根据产品code匹配对应的点位
			if (item.productCode === form.value.productCode) {
				const oriCodeRules = codeRules.value
				codeRules.value = item.ruleList.map((item : Obj) => {
					// 原对象没有barCode，加一个以便展示
					return {
						...item,
						inputFocus: false,
						barCode: "",
					}
				})
				// 如果不是完全重置则要保留原来的批次条码
				if (!complete && oriCodeRules.length > 0) {
					for (const item of codeRules.value) {
						if (item.repeat === "批次") {
							for (const i of oriCodeRules) {
								if (item.codeRuleId === i.codeRuleId) {
									item.barCode = i.barCode
									break
								}
							}
						}
					}
				}
				// 定位到第一个输入框
				nextTick(() => {
					if (codeRules.value[0]) {
						codeRules.value[0].inputFocus = true
					}
				})
				return
			}
		}
		codeRules.value = []
	}
	// barcode1扫码成功
	const barcode1ScanSuccess = (res : string) => {
		form.value.barcode1 = res
	}
	// barcode2扫码成功
	const barcode2ScanSuccess = (res : string) => {
		form.value.barcode2 = res
	}
	// 条码规则扫码成功
	const codeRuleScanSuccess = async (res : string, item : Obj, index : number) => {
		// 如果扫到的码是http开头的，则就去查工装码
		if (res && res.indexOf("http") !== -1) {
			try {
				uni.showLoading({
					mask: true,
					title: "工装获取中",
				})
				let ree = await findCardByUrl({
					url: res,
				})
				if (ree.data) {
					ree = ree.data.split(",")[0]
				}
				item.barCode = ree
			} catch (err) {
				console.log(err)
			} finally {
				uni.hideLoading()
			}
		} else {
			item.barCode = res
		}
		// 打包条码扫码成功时，进行追溯查询
		if ([P.打包].includes(form.value.procedureCode) && res) {
			if (index == 0) {
				await traceSearch(res)
			}
			if (index == 1) {
				await getPackageNum(res)
			}
		}
		// 如果是终检
		if ([P.终检].includes(form.value.procedureCode) && item.barCode) {
			// 扫的是第一个码
			if (index == 0) {
				await getTwoEquipmentData(item.barCode)
			}
		}

		if (item.barCode) {
			// 每次输入完，光标定位到空的那格
			for (const codeRule of codeRules.value) {
				if (!codeRule.barCode) {
					nextTick(() => {
						codeRule.inputFocus = true
					})
					return
				}
			}

			// 如果都填完了，则直接提交
			submit()
		}
	}
	// 包装码生成成功，自动填到包装码位置，并触发扫码成功事件
	const boxBarcodeGenSuccess = (res : string) => {
		const item = codeRules.value[1]
		item.barCode = res
		codeRuleScanSuccess(res, item, 1)
	}
	// 获取终检两个设备的数据
	const getTwoEquipmentData = async (barcode : string) => {
		try {
			uni.showLoading({
				mask: true,
				title: "获取设备数据中",
			})
			const params = {
				barcode,
			}
			const res = await getTwoEquipmentDataApi(params)
			if (res && res.data) {
				if (res.data.ret1) {
					form.value.equipmentCode1 = res.data.ret1.equipmentCode
					form.value.equipmentName1 = res.data.ret1.equipmentName
					form.value.equipmentContent1 = res.data.ret1.equipmentContent
					form.value.result1 = res.data.ret1.result === "OK" ? "1" : "0"
				}

				if (res.data.ret2) {
					form.value.equipmentCode2 = res.data.ret2.equipmentCode
					form.value.equipmentName2 = res.data.ret2.equipmentName
					form.value.equipmentContent2 = res.data.ret2.equipmentContent
					form.value.result2 = res.data.ret2.result === "OK" ? "1" : "0"
				}

				// if (form.value.result1 === "1" && form.value.result2 === "1") {
				// 	form.value.result = "1"
				// } else {
				// 	form.value.result = "0"
				// }

				// if (!res.data.ret1 || !res.data.ret2) {
				// 	uni.showModal({
				// 		title: "提示",
				// 		content: "该产品未获取到检测数据",
				// 	})
				// }
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}
	// 重置终检两个设备的数据
	const resetTwoEquipmentData = () => {
		form.value.equipmentCode1 = ""
		form.value.equipmentName1 = ""
		form.value.equipmentContent1 = ""
		form.value.result1 = "2"

		form.value.equipmentCode2 = ""
		form.value.equipmentName2 = ""
		form.value.equipmentContent2 = ""
		form.value.result2 = "2"
	}
	// 打包条码扫码成功时，进行追溯查询
	const traceSearch = async (barcode : string) => {
		try {
			const res = await getTraceList2({
				lineId: form.value.lineId,
				barcode,
			})
			if (res.data) {
				processList.value = res.data
				// 第一道和第二道直接改成成功
				processList.value[0].result = 1
				processList.value[0].resultName = "ok"
				processList.value[1].result = 1
				processList.value[1].resultName = "ok"
			} else {
				processList.value = []
			}
		} catch (err) {
			console.log(err)
		}
	}
	// 打包提交成功时，查询装箱数量
	const getPackageNum = async (barcode : string) => {
		try {
			const res = await getPackageNumApi({
				barcode,
				lineDetailId: form.value.lineDetailId,
			})
			if (res) {
				form.value.packageNum = res.data
				await checkPackageFull(barcode, res.data)
			}
		} catch (err) {
			console.log(err)
		}
	}
	// 检查码是否打包完了
	const checkPackageFull = async (barcode : string, packageNum : number) => {
		try {
			const res = await getBarcodeList({
				pageSize: 1,
				currentPage: 1,
				barcode
			})
			// 查询包装码详情
			if (res && res.data.list.length > 0) {
				const codeInfo = res.data.list[0]
				// 如果包装码已满，则打印码
				if (codeInfo.maxNum <= packageNum) {
					printBoxBarcode({
						barcode: codeInfo.barcode,
						codeName: codeInfo.codeName,
						productCode: codeInfo.barcode.split(",")[0],
						cusProductCode: codeInfo.cusProductCode,
						maxNum: codeInfo.maxNum,
					})
				}
			} else {
				setCustomModal({
					visiable: true,
					content: "未查询到此包装码",
				})
			}
		} catch (err) {
			console.log(err)
		}

	}
	// 检验单
	const getCheckItemList = async () => {
		const res = await getCheckItemListApi({
			lineDetailId: form.value.lineDetailId,
			productCode: form.value.productCode,
		})
		checkRecords.value = res.data.map((item : Obj) => {
			return {
				...item,
				images: [], // 上传的图片
				result: "", // 检验结果
				reason: "", // 不合格理由
				failureModSelected: [], // 失效模式选择数组
				processId: form.value.processId, // 工序id
			}
		})
	}
	// 检验单选择完条码后，要设置最终的失效模式
	const setFailureMod = () => {
		const arr = checkRecords.value
			.filter((item) => item.failureModeId)
			.map((item) => {
				return {
					id: item.failureModeId,
					failureModeName: item.failureModeName,
				}
			})
		// 去重
		failureModSelected.value = useRmRepeat(arr)({
			condition: (item) => item.id,
		})
	}
	// 检验单结果出来后，设置最终的结果
	const setFormResult = () => {
		if (checkRecords.value.length === 0 || checkRecords.value.filter((item) => !item.result).length > 0) {
			form.value.result = "1"
		} else if (checkRecords.value.filter((item) => item.result === "0").length > 0) {
			form.value.result = "0"
		} else {
			form.value.result = "1"
		}
	}
	// 失效模式
	const failuerModSelect = () => {
		if (failureModSelected.value.length > 0) {
			form.value.failureModeIds = failureModSelected.value.map((item) => item.id).join(",")
			form.value.failureModeNames = failureModSelected.value.map((item) => item.failureModeName).join(",")
		} else {
			form.value.failureModeIds = ""
			form.value.failureModeNames = ""
		}
	}
	// 工装模具
	const toolingScanSuccess = (res : string) => {
		form.value.toolingCode = res
	}
	// 重置条码
	const resetBarCode1A2 = () => {
		form.value.barcode1 = ""
		form.value.barcode2 = ""
		form.value.thisNum = 1
		form.value.packageNum = 0
		// 条码自配的重置所有条码
		if ([P.条码自配, P.打包, P.终检].includes(form.value.procedureCode)) {
			const bzCode = codeRules.value[1]?.barCode
			getCodeRules(true)
			// 如果工序需要重置设备
			if (form.value.resetPlc) {
				traceResetPlc({
					equipmentCode: form.value.equipmentCode,
				})
			}
			// 打包不重置包装码
			if ([P.打包].includes(form.value.procedureCode)) {
				codeRules.value[1].barCode = bzCode
			}
			resetTwoEquipmentData()
		}
	}
	const resetBarCode1 = () => {
		form.value.barcode1 = ""
		equipmentLoading.value = false
	}
	// 提交前校验
	const preSubmit = (type : P) => {
		if (!form.value.planId) {
			setCustomModal({
				visiable: true,
				content: "请先填写计划id",
			})
			return false
		}
		if ([P.条码自配, P.打包, P.终检].includes(type)) {
			for (const item of codeRules.value) {
				if (!item.barCode) {
					setCustomModal({
						visiable: true,
						content: "条码未填写完",
					})
					return false
				}
			}

			// if ([P.终检].includes(type) && (form.value.result1 != '1' || form.value.result2 != '1')) {
			// 	uni.showModal({
			// 		title: "提示",
			// 		content: "设备结果存在不合格",
			// 	})
			// 	return false
			// }

			if ([P.打包].includes(type) && form.value.checked == "1") {
				for (const key in processList.value) {
					const item = processList.value[key]
					const length = processList.value.length
					if (item.result !== 1 && Number(key) !== length - 1) {
						setCustomModal({
							visiable: true,
							content: "前工序存在未提交或不合格，请确认",
						})
						return false
					}
				}
			}
		}
		if (type === P.定制流程3) {
			if (form.value.barcode1 != form.value.barcode2) {
				setCustomModal({
					visiable: true,
					content: "标签码不一致",
				})
				return false
			}
		}
		// 如果提交的数量大于计划数量并且不是返工的，则不能提交
		if (Number(form.value.realNum) + form.value.thisNum > Number(form.value.planNum) && form.value.submitType == "1") {
			setCustomModal({
				visiable: true,
				content: "不能超过计划数量",
			})
			return false
		}
		// 需要检验单
		if (form.value.checked == "1") {
			for (const item of checkRecords.value) {
				if (item.needSurvey == "1") {
					if (item.surveyValue === "" || item.surveyValue === undefined || item.surveyValue === null) {
						setCustomModal({
							visiable: true,
							content: "请填写测量值",
						})
						return false
					}
				}
				if (item.needPicture && item.images.length <= 0) {
					setCustomModal({
						visiable: true,
						content: "请上传检验单图片",
					})
					return false
				}
				if (!item.result) {
					setCustomModal({
						visiable: true,
						content: "请选择检验单是否合格",
					})
					return false
				}
				if (item.result === "0" && item.failureModSelected.length <= 0) {
					setCustomModal({
						visiable: true,
						content: "请选择检验单失效模式",
					})
					return false
				}
				if (item.result === "0" && !item.reason) {
					setCustomModal({
						visiable: true,
						content: "请填写不合格理由",
					})
					return false
				}
				if (item.result === "0" && form.value.result === "1") {
					setCustomModal({
						visiable: true,
						content: "检测项目存在不合格，最终结果不能为合格",
					})
					return false
				}
				if (form.value.result == "0" && failureModSelected.value.length < 0) {
					setCustomModal({
						visiable: true,
						content: "请选择失效模式",
					})
					return false
				}
			}
		}
		return true
	}
	// 首末件校验
	const headTailCheck = async () => {
		// 如果开启了首末件检查
		if (form.value.checkFirstFinal) {
			// 如果没设置首末件数量，则提示
			if (!form.value.firstNum || !form.value.finalNum) {
				setCustomModal({
					visiable: true,
					content: "请先进行首末件检查设置",
				})
				return false
			}
			// 如果达到了要求，则先进行检查
			else if (Number(form.value.realNum) >= form.value.firstNum) {
				let checkTypeCode = 1
				if (Number(form.value.realNum) >= form.value.finalNum) {
					checkTypeCode = 2
				}
				await checkHeadTail({
					planCode: form.value.planCode,
					checkTypeCode,
				})
				return true
			}
			// 如果未达到要求，则不校验
			else {
				return true
			}
		}
		// 如果此计划未开启首末件检查
		else {
			// 否则直接返回
			return true
		}
	}
	// 条码校验相关
	const codeCheckInfoHandler = async () => {
		try {
			uni.showLoading({
				mask: true,
				title: "条码校验中",
			})
			const res = await codeCheckInfoApi({
				...form.value,
				barcodeList: codeRules.value,
			})
			codeCheckInfo.value = res.data || oriCodeCheckInfo()
			if (res.data && res.data.canSave === 1) {
				return true
			} else {
				let message = ""
				// 如果有返回消息则显示消息
				if (res.data.checkCodeMsg) {
					message = res.data.checkCodeMsg
				}
				// 没有返回消息，都是上道工序检查未通过
				else if (res.data.prevCheck && !res.data.prevResult) {
					message = "上道工序检查未通过"
				}
				// 提示消息
				setCustomModal({
					visiable: true,
					content: message,
				})
				return false
			}
		} catch (err) {
			console.log(err)
			return false
		} finally {
			uni.hideLoading()
		}
	}
	// 返工提交
	const rework = useThrottle(async () => {
		form.value.submitType = "2"
		submit()
	})
	// 提交
	const submit = useThrottle(async () => {
		const ret = preSubmit(form.value.procedureCode)
		if (!ret) return
		const res = await headTailCheck()
		if (!res) return
		const ree = await codeCheckInfoHandler()
		if (!ree) return
		try {
			uni.showLoading({
				mask: true,
				title: "提交中",
			})
			// 构造提交参数
			const params : Obj = Object.assign({}, form.value)
			// 构造附件提交参数
			params.fileUrl = params.images.map((item : Obj) => item.url).join(",")
			params.fileName = params.images.map((item : Obj) => item.name).join(",")
			// 构造检验单提交参数
			if (form.value.checked == "1") {
				params.checkList = checkRecords.value.map((item) => {
					return {
						...item,
						imagesUrl: item.images.map((i : Obj) => i.url).join(","),
					}
				})
			}
			// 条码自配需要处理的参数
			if ([P.条码自配, P.打包, P.终检].includes(form.value.procedureCode)) {
				// 把点位数据映射成后端需要的格式
				params.barcodeList = codeRules.value
				// 条码自配因为之前没有赋值barcode1和barcode2，所以手动赋值
				params.barcode1 = params.barcodeList[0]?.barCode
				params.barcode2 = params.barcodeList[1]?.barCode
			}
			// 提交
			await productJobSubmit(params)
			uni.showToast({
				icon: "none",
				title: "提交成功",
			})
			//
			if ([P.打包].includes(form.value.procedureCode)) {
				await getPackageNum(params.barcodeList[1]?.barCode)
			}
			// 提交完重新获取计划
			await getPlanInfo(form.value.planCode)
			// 重置数据
			form.value.thisNum = 1
			form.value.remark = ""
			form.value.toolingCode = ""
			form.value.images = []
			form.value.submitType = "1"
			failureModSelected.value = []
			// 如果是气密
			if (form.value.procedureKindCode == PK.数据采集) {
				equipmentLoading.value = true
			}
			// 如果不是气密
			else {
				form.value.barcode1 = ""
				if (form.value.procedureCode != P.条码关联返工) {
					form.value.barcode2 = ""
				}
				form.value.barcode3 = ""
				form.value.barcode4 = ""
				form.value.barcode5 = ""
				form.value.barcode6 = ""
				// // 如果选择了确认打印，则跳到打印界面
				// if (printTypeCheck.value === 0) {
				// 	uni.navigateTo({
				// 		url: `${routes.ProductJobPrinter.path}?id=${res.data}`,
				// 	})
				// }
			}
			// 如果是终检，重置两个设备的数据
			if ([P.终检].includes(form.value.procedureCode)) {
				resetTwoEquipmentData()
			}
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	})
	// 条码解绑
	const submitDel = async () => {
		try {
			uni.showLoading({
				mask: true,
				title: "解绑中",
			})
			await productJobDel(form.value)
			uni.showToast({
				icon: "none",
				title: "解绑成功",
			})
			// 提交完重新获取计划
			await getPlanInfo(form.value.planCode)
			// 重置数据
			form.value.thisNum = 1
			form.value.remark = ""
			form.value.toolingCode = ""
			failureModSelected.value = []
			form.value.barcode1 = ""
			form.value.barcode2 = ""
		} catch (err) {
			console.log(err)
		} finally {
			uni.hideLoading()
		}
	}
</script>

<style scoped lang="scss">
	.grid-title {
		padding: 20rpx 0;
	}

	.print-btn-box {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
	}

	.btn-box {
		display: flex;
		justify-content: space-between;
		margin: 10px 0;

		.btn+.btn {
			margin-left: 5px;
		}
	}

	.radio-group {
		justify-content: space-around;
	}
</style>