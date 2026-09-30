<template>
  <up-steps :current="form.activeNum" style="margin-top: 10px; overflow-x: scroll" v-if="processList && processList.length">
    <up-steps-item v-for="(item, key) in processList" :key="key" :title="item.procedureName" :error="item.result != 1 && key != form.activeNum"></up-steps-item>
  </up-steps>

  <up-form class="common-form" labelPosition="left">
    <up-form-item class="common-form-item" label="计划单号:" borderBottom labelWidth="80" style="padding: 0" required v-if="!isTrace">
      <up-input-scan v-model="form.planCode" placeholder="请输入计划单号" clearable class="input-item" @scanSuccess="getPlanInfo"></up-input-scan>
    </up-form-item>

    <up-form-item class="common-form-item" label="产品编码:" borderBottom labelWidth="80" style="padding: 0">
      <TraceProductPicker v-if="isTrace" v-model:selected="productSelected" @select="productSelect"></TraceProductPicker>
      <up-input v-else v-model="form.productCode" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="客户件号:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.cusProductCode" :placeholder="isTrace ? '选择产品自动带出' : '计划单号自动带出'" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="计划数量:" borderBottom labelWidth="80" style="padding: 0" v-if="!isTrace">
      <up-input v-model="form.planNum" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="实际数量:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.realNum" :placeholder="isTrace ? '选择产品自动带出' : '计划单号自动带出'" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>
  </up-form>

  <!-- 自定义条码：单独一块 -->
  <up-form class="common-form common-form-next" labelPosition="left" v-if="codeRules && codeRules.length">
    <up-form-item class="common-form-item" :label="`${item.codeName}:`" borderBottom labelWidth="80" style="padding: 0" required v-for="(item, key) in codeRules" :key="key">
      <up-input-scan
        :focus="item.inputFocus"
        v-model="item.barCode"
        placeholder="请输入条码"
        clearable
        class="input-item"
        @focus="customInputFocus"
        @scanSuccess="(str: string) => codeRuleScanSuccess(str, item, key)"
        @blur="item.inputFocus = false"
      ></up-input-scan>
    </up-form-item>
  </up-form>

  <!-- 数量：单独一块 -->
  <up-form class="common-form common-form-next" labelPosition="left">
    <up-form-item class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.thisNum" placeholder="请输入数量" clearable class="input-item" type="number"></up-input>
    </up-form-item>
  </up-form>

  <!-- 检验单: 主页面只留一行入口, 明细收在右侧弹出栏里点开填写 -->
  <up-form class="common-form common-form-next" labelPosition="left" v-if="checkRecords && checkRecords.length">
    <up-form-item class="common-form-item" label="检验单:" borderBottom labelWidth="80" style="padding: 0">
      <view class="check-entry" @click="checkDrawerVisible = true">
        <text class="check-entry__sum">共 {{ checkRecords.length }} 项，已填 {{ filledCheckCount }} 项</text>
        <view class="check-entry__btn">
          <text class="check-entry__btn-text">去填写</text>
          <uni-icons type="right" :color="globalColor.primary" size="12"></uni-icons>
        </view>
      </view>
    </up-form-item>
  </up-form>

  <up-popup :show="checkDrawerVisible" mode="right" :customStyle="checkDrawerStyle" @close="checkDrawerVisible = false">
    <view class="check-drawer">
      <view class="check-drawer__head">
        <view class="check-drawer__bar">
          <view class="check-drawer__bar-text">
            <text class="check-drawer__title">检验单</text>
            <text class="check-drawer__sub">共 {{ checkRecords.length }} 项，已填 {{ filledCheckCount }} 项</text>
          </view>
          <view class="check-drawer__close" @click="checkDrawerVisible = false">
            <uni-icons type="closeempty" color="#ffffff" size="18"></uni-icons>
          </view>
        </view>
        <view class="check-drawer__progress">
          <view class="check-drawer__progress-inner" :style="{ width: checkProgress + '%' }"></view>
        </view>
      </view>
      <scroll-view class="check-drawer__body" scroll-y>
        <view class="check-drawer__list">
          <CheckRecord :checkItems="checkRecords" :form="form" @setFormResult="setFormResult" @setFailureMod="setFailureMod"></CheckRecord>
          <view class="check-drawer__tip">填完点「完成」收起；返回主页面后别忘了提交报工</view>
        </view>
      </scroll-view>
      <view class="check-drawer__foot">
        <up-button type="primary" :color="globalColor.primary" text="完成" shape="circle" @click="checkDrawerVisible = false"></up-button>
      </view>
    </view>
  </up-popup>

  <!-- 文档: 本工序+本产品在 web「文档管理」里维护的文档, 入口样式与上面的检验单一致。
       图片/PDF 点开直接看, 其余格式点开即下载, 见 TraceFileEntry -->
  <TraceFileEntry :files="traceFiles"></TraceFileEntry>

  <!-- 附件: 工序开了「是否上传附件」(ld_line_detail.upload_file=1) 才出现, 见 TraceAttachUpload。
       附件选传 —— 不选也能提交(所以没有块级 v-if 的空卡片问题: 这个开关一关整块都不渲染) -->
  <TraceAttachUpload :modelValue="form.images" v-if="form.uploadFile == '1'"></TraceAttachUpload>

  <!-- 块级 v-if 与下面各项的条件保持一致：各项都不渲染时别留一张只有 2px 边框的空卡片（追溯入口就是这种情形） -->
  <up-form class="common-form common-form-next" labelPosition="left" v-if="form.statistics == '1' || form.result === '0'">
    <up-form-item class="common-form-item" label="是否合格:" borderBottom labelWidth="80" style="padding: 0" required v-if="form.statistics == '1'">
      <u-radio-group placement="row" class="radio-group" v-model="form.result">
        <u-radio :name="'1'" label="是"></u-radio>
        <u-radio :name="'0'" label="否" style="margin-left: 10px"></u-radio>
      </u-radio-group>
    </up-form-item>
    <up-form-item class="common-form-item" label="失效模式:" borderBottom labelWidth="80" style="padding: 0" required v-if="form.result === '0'">
      <TraceFailureModPicker
        v-model:selected="failureModSelected"
        @select="failuerModSelect"
        :processId="form.processId"
        :orgIds="form.orgIds"
        readonly
        border="none"
        placeholder="请选择失效模式"
        :multiple="true"
      ></TraceFailureModPicker>
    </up-form-item>
  </up-form>

  <!-- 是否返工: 产线明细开了「是否显示返工按钮」(ld_line_detail.reworked=1) 才出现。
       选「是」提交时 submitType=2(返工提交): 后端按该条码把本条产线明细的原有报工置为历史(del=1)后再补新记录,
       并跳过条码重复校验与超计划数量校验(数量守恒) -->
  <up-form class="common-form common-form-next" v-if="form.reworked == 1">
    <up-form-item class="common-form-item" label="是否返工:" borderBottom labelWidth="80" style="padding: 0" v-if="form.reworked == 1">
      <u-radio-group placement="row" class="radio-group" v-model="form.submitType">
        <u-radio :name="'2'" label="是"></u-radio>
        <u-radio :name="'1'" label="否" style="margin-left: 10px"></u-radio>
      </u-radio-group>
    </up-form-item>
  </up-form>

  <up-form class="common-form common-form-next" v-if="equipments && equipments.length > 0">
    <up-form-item class="common-form-item" label="设备编码:" borderBottom labelWidth="80" style="padding: 0" v-if="equipments && equipments.length > 0">
      <up-input v-model="form.equipmentCode" @change="equipmentCodeChange" placeholder="请选择设备" class="input-item" clearable>
        <template #suffix>
          <uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary" @click="openEquipmentPicker"></uni-icons>
          <up-picker :show="showEquipmentPicker" :columns="equipments" @confirm="equipmentSelect" @cancel="showEquipmentPicker = false" keyName="equipmentName"></up-picker>
        </template>
      </up-input>
    </up-form-item>
    <up-form-item class="common-form-item" label="设备名称:" borderBottom labelWidth="80" style="padding: 0" v-if="equipments && equipments.length > 0">
      <up-input v-model="form.equipmentName" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
    </up-form-item>
    <!-- <up-form-item class="common-form-item" label="设备数据:" borderBottom labelWidth="80" style="padding: 0" v-if="equipments && equipments.length > 0">
      <up-textarea v-model="form.equipmentContent" placeholder="自动带出" class="input-item" disabled></up-textarea>
    </up-form-item>
    <up-form-item class="common-form-item" label="结果:" borderBottom labelWidth="80" style="padding: 0" v-if="equipments && equipments.length > 0">
      <up-input :modelValue="ResultMap[form.result]" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
    </up-form-item> -->
  </up-form>

  <view class="btn-box">
    <up-button type="primary" class="btn" shape="circle" @click="submit">确 认</up-button>
    <up-button type="primary" class="btn" shape="circle" @click="resetBarCode1A2">重 置</up-button>
  </view>

  <TraceTablePK5 ref="traceTableRef" :form="form" :codeRules="codeRules" style="margin-top: 10px"> </TraceTablePK5>

  <CustomModal>
    <up-input v-model="unlockCode" placeholder="请输入验证码" class="input-item"></up-input>
  </CustomModal>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue"
import type { UploadMedia } from "@/type/file"
import TraceTablePK5 from "./components/TraceTablePK5.vue"
import CheckRecord from "./components/CheckRecord.vue"
import TraceFileEntry from "./components/TraceFileEntry.vue"
import TraceAttachUpload from "./components/TraceAttachUpload.vue"
import UpInputScan from "@/components/UpInputScanNew.vue"
import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"
import TraceProductPicker from "@/components/TraceProductPicker.vue"
import { globalColor } from "@/store/theme"
import { Platform } from "@/util/env"
import { genFilePath } from "@/util/common"
import { useThrottle, useDebounce, useRmRepeat } from "@ultra-man/noa"
import mqtt from "mqtt/dist/mqtt.js"
import { getEquipmentByLineDetailId, getCheckItemListApi, getTraceFilesListApi, productJobSubmit, codeCheckInfoApi, getTraceLineDetail, getTraceRealNum } from "@/api/trace"
import { getWorkPlan } from "@/api/workPlan"
import { getProductByCode } from "@/api/product"
import { P, PK, BarcodeNames, ResultMap } from "./enum"
import { setCustomModal } from "@/store/customModal"

const props = defineProps<{
  lineDetailData?: Obj
  lineDetailId?: string
  procedureName?: string
  planCode?: string
  // 追溯入口跳转时带 noPlan=1: 报工页不展示计划相关信息与逻辑(页面 query 参数均为字符串)
  noPlan?: string
}>()

const oriForm = () => ({
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
  thisNum: 1,
  checked: "",
  barcode1: "",
  barcodeName1: "",
  barcode2: "",
  barcodeName2: "",
  barcode3: "",
  barcode4: "",
  barcode5: "",
  barcode6: "",
  scanCode: 0,
  relation1: "",
  relation2: "",
  unbind: 0,
  images: [] as UploadMedia[],
  fileUrl: "",
  fileName: "",
  toolingCode: "",
  remark: "",
  equipmentCode: "",
  equipmentMac: "",
  equipmentName: "",
  equipmentContent: "",
  equipmentCode1: "",
  equipmentMac1: "",
  equipmentName1: "",
  equipmentContent1: "",
  equipmentCode2: "",
  equipmentMac2: "",
  equipmentName2: "",
  equipmentContent2: "",
  submitType: "1",
  statistics: "",
  result: "1" as keyof typeof ResultMap,
  result1: "1" as keyof typeof ResultMap,
  result2: "2" as keyof typeof ResultMap,
  failureModeIds: "",
  failureModeNames: "",
  procedureCode: "" as P,
  procedureKindCode: 0 as PK,
  codeRules: [] as Objs,
  reworked: 0,
  // 工序是否允许上传附件(ld_line_detail.upload_file, 字符串口径与 checked 一致): 只管附件入口显不显示
  uploadFile: "",
  activeNum: null as Num,
})
const oriCodeCheckInfo = () => ({ canSave: 0 })

const form = ref(oriForm())
const codeRules = ref<Objs>([])
const equipments = ref<Objs[]>([])
const checkRecords = ref<Objs>([])
// 「文档管理」里本工序+本产品关联的文档, 与检验单并列的入口(见 TraceFileEntry)
const traceFiles = ref<Objs>([])
// 检验单明细收在右侧弹出栏里, 主页面只留入口(见模板里的 .check-entry)
const checkDrawerVisible = ref(false)
// 弹出栏宽度: 宽屏(PC 浏览器)按视口 70% 且不超过 720px, 窄屏(手机)占 85%
const checkDrawerStyle = (() => {
  const w = uni.getSystemInfoSync().windowWidth || 375
  return { width: (w >= 768 ? Math.min(720, Math.round(w * 0.7)) : Math.round(w * 0.85)) + "px", height: "100%" }
})()
// 单条「填完了」的判据与 preSubmit 里的校验项逐条对齐: 必填项齐了才算, 免得入口显示"已填"、提交却被拦
const isCheckItemFilled = (item: Obj) =>
  (item.needSurvey != "1" || (item.surveyValue !== "" && item.surveyValue !== undefined && item.surveyValue !== null)) &&
  (!item.needPicture || item.images.length > 0) &&
  !!item.result &&
  (item.result !== "0" || (item.failureModSelected.length > 0 && !!item.reason))
const filledCheckCount = computed(() => checkRecords.value.filter(isCheckItemFilled).length)
// 弹出栏顶部那条进度: 已填项数占比, 纯展示
const checkProgress = computed(() =>
  checkRecords.value.length ? Math.round((filledCheckCount.value / checkRecords.value.length) * 100) : 0
)
const failureModSelected = ref<Objs>([])
const codeCheckInfo = ref<Obj>(oriCodeCheckInfo())
const traceTableRef = ref<Obj | null>(null)
const processList = ref<Objs>([])
const showEquipmentPicker = ref(false)
const unlockCode = ref()
// 追溯入口(从追溯报工进入)不依赖工作计划(页面 query 参数均为字符串)
const isTrace = computed(() => props.noPlan == "1")
const productSelected = ref<Objs>([])
let mqttClient: mqtt.MqttClient | null = null

const customInputFocus = () => {
  if (Platform.isApp()) uni.hideKeyboard()
}

onMounted(async () => {
  try {
    if (!props.lineDetailData) return
    const d = props.lineDetailData
    form.value.processId = d.processId
    form.value.lineId = d.lineId
    form.value.orgIds = d.factoryId
    form.value.procedureCode = d.procedureCode
    form.value.procedureKindCode = d.procedureKindCode
    form.value.submitType = String(d.submitType || "1")
    form.value.statistics = d.statistics
    form.value.barcodeName1 = BarcodeNames[d.relation1] || ""
    form.value.barcodeName2 = BarcodeNames[d.relation2] || ""
    form.value.unbind = d.unbind
    form.value.scanCode = d.scanCode
    form.value.codeRules = d.codeRules ? JSON.parse(d.codeRules) : []
    form.value.reworked = d.reworked
    form.value.checked = d.checked || ""
    form.value.uploadFile = d.uploadFile || ""
    if (form.value.planCode) {
      getPlanInfo()
    }
    // 追溯入口: 默认带出上次选的产品(须在产线条码规则解析之后)
    if (isTrace.value) applyCachedProduct()
    getEquipment()
    // pda端不需要实时采集设备数据了
    // initWebSocket()
  } catch (e) {
    console.error(e)
  }
})

onBeforeUnmount(() => {
  if (mqttClient) {
    mqttClient.end()
    mqttClient = null
  }
})

const refreshTraceTable = () => {
  if (traceTableRef.value) {
    traceTableRef.value.searchList({ lineDetailId: form.value.lineDetailId, planId: form.value.planId })
  }
}

const getPlanInfo = async () => {
  if (!form.value.planCode) {
    initFormPlan()
    return
  }
  uni.showLoading({ mask: true, title: "计划详情获取中" })
  try {
    const r = await getWorkPlan({ planCode: form.value.planCode, lineDetailId: form.value.lineDetailId })
    const { planId, productCode, planNum, realNum } = r.data
    form.value.planId = planId
    form.value.productCode = productCode
    form.value.planNum = planNum
    form.value.realNum = realNum
    const re = await getProductByCode({ productCode })
    if (re && re.data) form.value.cusProductCode = re.data.cusProductCode
    refreshTraceTable()
    if (form.value.checked == "1") await getCheckItemList()
    await getTraceFiles()
    getCodeRules()
    form.value.result = "1"
  } catch (e) {
    console.error(e)
  } finally {
    uni.hideLoading()
  }
}

const initFormPlan = () => {
  form.value.planCode = ""
  form.value.productCode = ""
  form.value.planNum = 0
  form.value.realNum = 0
  form.value.checked = ""
  // 计划/产品已清空, 关联文档一并清掉(否则会留着上一单的文档)
  traceFiles.value = []
}

// 追溯入口: 取「实际数量」= 当天 + 选定产品 + 当前产线明细的报工数量之和(不限计划)
// 报工提交成功、切换产品后都要重取(见 refreshAfterSubmit / productSelect)
const refreshRealNum = async () => {
  if (!isTrace.value) return
  if (!form.value.productCode || !form.value.lineDetailId) {
    form.value.realNum = 0
    return
  }
  try {
    const r = await getTraceRealNum({ lineDetailId: form.value.lineDetailId, productCode: form.value.productCode })
    form.value.realNum = r.data == null ? 0 : r.data
  } catch (e) {
    console.error(e)
  }
}

// 追溯入口: 产品弹窗单选回调(换产品必须把上一产品的条码与检测状态全部重来)
const productSelect = async (res: Objs) => {
  if (res.length <= 0) return
  const item = res[0]
  // 回显赋值会触发组件 watch 再 emit 一次, 同产品直接返回防重入
  if (item.productCode == form.value.productCode) return
  form.value.productCode = item.productCode
  form.value.cusProductCode = item.cusProductCode || ""
  form.value.barcode1 = ""
  form.value.barcode2 = ""
  form.value.thisNum = 1
  form.value.equipmentContent = ""
  form.value.result = "1"
  form.value.failureModeIds = ""
  form.value.failureModeNames = ""
  failureModSelected.value = []
  checkRecords.value = []
  // complete=true: 不继承上一产品的「批次」条码
  getCodeRules(true)
  if (codeRules.value.length > 0) {
    // 只缓存本工序确实配了条码规则的产品, 避免把不可用的选择记下来
    uni.setStorageSync(
      "traceProduct",
      JSON.stringify({
        productCode: item.productCode,
        productName: item.productName,
        cusProductCode: item.cusProductCode,
      }),
    )
  } else {
    setCustomModal({ visiable: true, content: "该产品在当前工序未配置条码规则，无法报工" })
  }
  if (form.value.checked == "1") await getCheckItemList()
  await getTraceFiles()
  refreshTraceTable()
  await refreshRealNum()
}

// 追溯入口: 进页面默认带出上次选的产品(仅当本工序确实配了该产品的条码规则)
const applyCachedProduct = () => {
  let cached: Obj = {}
  try {
    cached = JSON.parse(uni.getStorageSync("traceProduct") || "{}")
  } catch (e) {
    console.error(e)
    uni.removeStorageSync("traceProduct")
    return
  }
  if (!cached.productCode) return
  if (!form.value.codeRules.some((r: Obj) => r.productCode == cached.productCode)) return
  productSelected.value = [{ productCode: cached.productCode, productName: cached.productName, cusProductCode: cached.cusProductCode }]
  productSelect(productSelected.value)
}

// 提交成功后的刷新: 追溯入口没有计划单号, 走 getPlanInfo 会被 initFormPlan 清掉已选产品
const refreshAfterSubmit = async () => {
  if (!isTrace.value) {
    await getPlanInfo()
    return
  }
  getCodeRules()
  if (form.value.checked == "1") await getCheckItemList()
  await getTraceFiles()
  form.value.result = "1"
  refreshTraceTable()
  // 报工完成: 实际数量要重新获取(本次提交已落库)
  await refreshRealNum()
}

const getCodeRules = (complete?: boolean) => {
  for (const item of form.value.codeRules) {
    if (item.productCode === form.value.productCode) {
      const ori = codeRules.value
      codeRules.value = item.ruleList.map((r: Obj) => ({
        ...r,
        inputFocus: false,
        barCode: "",
      }))
      if (!complete && ori.length > 0) {
        for (const cr of codeRules.value) {
          if (cr.repeat === "批次") {
            for (const o of ori) {
              if (cr.codeRuleId === o.codeRuleId) {
                cr.barCode = o.barCode
                break
              }
            }
          }
        }
      }
      nextTick(() => {
        if (codeRules.value[0]) codeRules.value[0].inputFocus = true
      })
      return
    }
  }
  codeRules.value = []
}

const initWebSocket = () => {
  mqttClient = mqtt.connect(import.meta.env.VITE_BASE_API_URL_WEB_WEBSOCKET, {
    username: "admin",
    password: "admin123",
    clientId: "client_yin_shen_app_" + Date.now(),
  })
  mqttClient.on("message", (topic: Obj, message: string) => {
    const payload = JSON.parse(message.toString()).payload
    // 如果收到的mqtt消息和当前选中的设备匹配，才处理
    if (form.value.equipmentCode == payload.deviceSn) {
      const equipmentData = payload.properties
      form.value.equipmentContent = JSON.stringify(equipmentData)
      if (!equipmentData.result || equipmentData.result === "OK") {
        form.value.result = "1"
      } else if (equipmentData.result === "NG") {
        form.value.result = "0"
      }
    }
  })
  mqttClient.subscribe("lab_data_hub/get_device_data", { qos: 0 }, (err: string) => {
    if (err) {
      setCustomModal({
        visiable: true,
        content: "mqtt订阅失败：" + err,
      })
    }
  })
}

const getEquipment = async () => {
  const res = await getEquipmentByLineDetailId({
    lineDetailId: props.lineDetailId,
  })
  if (res.data && res.data.length > 0) {
    equipments.value[0] = res.data.map((item: Obj) => ({
      equipmentCode: item.equipmentCode,
      equipmentName: item.equipmentName,
    }))
    const equipment = JSON.parse(uni.getStorageSync("traceEquipment") || "{}")
    form.value.equipmentCode = equipment.equipmentCode
    form.value.equipmentName = equipment.equipmentName
  }
}

const openEquipmentPicker = () => {
  showEquipmentPicker.value = true
}

const equipmentCodeChange = useDebounce((res: string) => {
  equipmentSelect({
    value: [{ equipmentCode: res }],
  })
})

const equipmentSelect = useThrottle(async (res: { value: Objs }) => {
  form.value.equipmentContent = ""
  form.value.result = "1"
  let code = res.value[0].equipmentCode
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
        }),
      )
      return
    }
  }
  form.value.equipmentCode = ""
  form.value.equipmentName = ""
})

const codeRuleScanSuccess = async (res: string, item: Obj, index: number) => {
  item.barCode = res
  if (item.barCode) {
    for (const cr of codeRules.value) {
      if (!cr.barCode) {
        nextTick(() => {
          cr.inputFocus = true
        })
        return
      }
    }
    submit()
  }
}

const getCheckItemList = async () => {
  const r = await getCheckItemListApi({ lineDetailId: form.value.lineDetailId, productCode: form.value.productCode })
  checkRecords.value = r.data.map((item: Obj) => ({
    ...item,
    images: [],
    result: "",
    reason: "",
    failureModSelected: [],
    processId: form.value.processId,
  }))
}

// 取本工序+本产品在 web「文档管理」里维护的文档; 工序/产品没齐时清空(不查)
// 自带 try/catch: 文档是报工的附属信息, 查不到不该把报工流程带崩
const getTraceFiles = async () => {
  traceFiles.value = []
  if (!form.value.lineDetailId || !form.value.productCode) return
  try {
    const r = await getTraceFilesListApi({ lineDetailId: form.value.lineDetailId, productCode: form.value.productCode })
    traceFiles.value = r.data || []
  } catch (e) {
    console.error(e)
  }
}

const setFailureMod = () => {
  const arr = checkRecords.value.filter((item: Obj) => item.failureModeId).map((item: Obj) => ({ id: item.failureModeId, failureModeName: item.failureModeName }))
  failureModSelected.value = useRmRepeat(arr)({ condition: (item: Obj) => item.id })
}

const setFormResult = () => {
  if (checkRecords.value.length === 0 || checkRecords.value.filter((item: Obj) => !item.result).length > 0) {
    form.value.result = "1"
  } else if (checkRecords.value.filter((item: Obj) => item.result === "0").length > 0) {
    form.value.result = "0"
  } else {
    form.value.result = "1"
  }
}

const failuerModSelect = () => {
  if (failureModSelected.value.length > 0) {
    form.value.failureModeIds = failureModSelected.value.map((item: Obj) => item.id).join(",")
    form.value.failureModeNames = failureModSelected.value.map((item: Obj) => item.failureModeName).join(",")
  } else {
    form.value.failureModeIds = ""
    form.value.failureModeNames = ""
  }
}

const resetBarCode1A2 = () => {
  form.value.barcode1 = ""
  form.value.barcode2 = ""
  form.value.thisNum = 1
  form.value.packageNum = 0
  getCodeRules(true)
  form.value.equipmentContent = ""
  form.value.result = "1"
}

const preSubmit = () => {
  // 追溯入口没有计划: 计划id与计划数量都不校验
  if (!isTrace.value && !form.value.planId) {
    setCustomModal({ visiable: true, content: "请先填写计划id" })
    return false
  }
  if (isTrace.value && !form.value.productCode) {
    setCustomModal({ visiable: true, content: "请先选择产品编码" })
    return false
  }
  if (isTrace.value && codeRules.value.length == 0) {
    setCustomModal({ visiable: true, content: "该产品在当前工序未配置条码规则，无法报工" })
    return false
  }
  for (const item of codeRules.value) {
    if (!item.barCode) {
      setCustomModal({ visiable: true, content: "条码未填写完" })
      return false
    }
  }
  if (!isTrace.value && Number(form.value.realNum) + form.value.thisNum > Number(form.value.planNum) && form.value.submitType == "1") {
    setCustomModal({ visiable: true, content: "不能超过计划数量" })
    return false
  }
  // 附件选传(不选也能提交), 但选了就必须传完 —— 否则会把本地临时路径当成附件路径提交上去
  if (form.value.uploadFile == "1" && form.value.images.some((i: Obj) => i.status != "success")) {
    setCustomModal({ visiable: true, content: "附件还没上传完，请稍候或删除上传失败的附件" })
    return false
  }
  if (form.value.checked == "1") {
    for (const item of checkRecords.value) {
      if (item.needSurvey == "1" && (item.surveyValue === "" || item.surveyValue === undefined || item.surveyValue === null)) {
        setCustomModal({ visiable: true, content: "请填写测量值" })
        return false
      }
      if (item.needPicture && item.images.length <= 0) {
        setCustomModal({ visiable: true, content: "请上传检验单图片" })
        return false
      }
      if (!item.result) {
        setCustomModal({ visiable: true, content: "请选择检验单是否合格" })
        return false
      }
      if (item.result === "0" && item.failureModSelected.length <= 0) {
        setCustomModal({ visiable: true, content: "请选择检验单失效模式" })
        return false
      }
      if (item.result === "0" && !item.reason) {
        setCustomModal({ visiable: true, content: "请填写不合格理由" })
        return false
      }
      if (item.result === "0" && form.value.result === "1") {
        setCustomModal({ visiable: true, content: "检测项目存在不合格，最终结果不能为合格" })
        return false
      }
    }
  }
  return true
}

const codeCheckInfoHandler = async () => {
  uni.showLoading({ mask: true, title: "条码校验中" })
  try {
    const r = await codeCheckInfoApi({ ...form.value, barcodeList: codeRules.value })
    codeCheckInfo.value = r.data || oriCodeCheckInfo()
    if (r.data && r.data.canSave === 1) return true
    setCustomModal({
      visiable: true,
      content: r.data.checkCodeMsg || (r.data.prevCheck && !r.data.prevResult ? "上道工序检查未通过" : ""),
      showSlot: true,
      success: () => {
        return true
        // if (unlockCode.value == "123") {
        // 	unlockCode.value = null
        // 	return true
        // } else {
        // 	return false
        // }
      },
      cancel: () => true,
    })
    return false
  } catch (e) {
    console.error(e)
    return false
  } finally {
    uni.hideLoading()
  }
}

// 报工携带的检验单明细: 后端 TraceService#saveTraceCheck 会把它落进
// ld_trace_check_main + ld_trace_check_item —— 与 web「检验单管理」同一个入库位置
// 工序没开「是否需要检验」时 checkRecords 为空, 传空数组, 后端不产生记录
const buildCheckList = () =>
  checkRecords.value.map((item: Obj) => ({
    checkItemId: item.checkItemId,
    checkItemCode: item.checkItemCode,
    checkItemName: item.checkItemName,
    checkTypeName: item.checkTypeName,
    checkRateName: item.checkRateName,
    checkWayName: item.checkWayName,
    checkContent: item.checkContent,
    importantItem: item.importantItem,
    result: item.result ? Number(item.result) : null,
    reason: item.reason,
    failureModeId: item.failureModeId || null,
    failureModeName: item.failureModeName,
    surveyValue: item.surveyValue,
    // 检验单图片: 上传组件列表里存的是拼好 base 的展示地址(缩略图要直接用), 入库前还原成相对路径
    imagesUrl: (item.images || []).map((i: Obj) => genFilePath(i.url)).join(","),
  }))

const submit = useThrottle(async () => {
  if (!preSubmit()) return
  if (!(await codeCheckInfoHandler())) return
  uni.showLoading({ mask: true, title: "提交中" })
  try {
    const params: Obj = Object.assign({}, form.value)
    params.fileUrl = params.images.map((item: Obj) => item.url).join(",")
    params.fileName = params.images.map((item: Obj) => item.name).join(",")
    params.barcodeList = codeRules.value
    params.barcode1 = params.barcodeList[0]?.barCode
    params.barcode2 = params.barcodeList[1]?.barCode
    params.checkList = buildCheckList()
    await productJobSubmit(params)
    uni.showToast({ icon: "none", title: "提交成功" })
    await refreshAfterSubmit()
    form.value.thisNum = 1
    form.value.remark = ""
    form.value.toolingCode = ""
    form.value.images = []
    form.value.submitType = "1"
    failureModSelected.value = []
  } catch (e) {
    console.error(e)
  } finally {
    uni.hideLoading()
  }
})
</script>

<style scoped lang="scss">
.check-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;

  &__sum {
    color: #606266;
  }
  &__btn {
    display: flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: 20px;
    background-color: rgba(84, 157, 248, 0.1);
  }
  &__btn-text {
    margin-right: 2px;
    font-size: 13px;
    color: v-bind("globalColor.primary");
  }
}
.check-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__head {
    padding: 14px 15px 12px;
    background-color: v-bind("globalColor.primary");
  }
  &__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__bar-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  &__title {
    font-size: 16px;
    font-weight: bold;
    color: #ffffff;
  }
  &__sub {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
  }
  &__close {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.22);
  }
  &__progress {
    height: 4px;
    margin-top: 10px;
    border-radius: 2px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.3);
  }
  &__progress-inner {
    height: 100%;
    border-radius: 2px;
    background-color: #ffffff;
    transition: width 0.3s ease;
  }
  &__body {
    flex: 1;
    min-height: 0;
    background-color: #f5f6f8;
  }
  &__list {
    padding: 10px 10px 20px;
  }
  &__tip {
    padding: 6px 2px 0;
    font-size: 12px;
    color: #909399;
    text-align: center;
  }
  &__foot {
    padding: 10px 15px;
    background-color: #ffffff;
    border-top: 1px solid #ebeef5;
  }
}
.btn-box {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  .btn + .btn {
    margin-left: 5px;
  }
}
.radio-group {
  justify-content: space-around;
}
</style>
