<template>
  <up-steps :current="form.activeNum" style="margin-top: 10px; overflow-x: scroll" v-if="processList && processList.length">
    <up-steps-item v-for="(item, key) in processList" :key="key" :title="item.procedureName" :error="item.result != 1 && key != form.activeNum"></up-steps-item>
  </up-steps>

  <up-form class="common-form" labelPosition="left">
    <up-form-item class="common-form-item" label="计划单号:" borderBottom labelWidth="80" style="padding: 0" required>
      <up-input-scan v-model="form.planCode" placeholder="请输入计划单号" clearable class="input-item" @scanSuccess="getPlanInfo"></up-input-scan>
    </up-form-item>

    <up-form-item class="common-form-item" label="产品编码:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.productCode" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="客户件号:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.cusProductCode" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="计划数量:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.planNum" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="实际数量:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.realNum" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>

    <up-form-item class="common-form-item" label="装箱数量:" borderBottom labelWidth="80" style="padding: 0" v-if="[P.打包].includes(form.procedureCode)">
      <up-input v-model="form.packageNum" placeholder="自动带出" clearable class="input-item" readonly border="none"></up-input>
    </up-form-item>
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

    <up-form-item class="common-form-item" label="数量:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.thisNum" placeholder="请输入数量" clearable class="input-item" type="number"></up-input>
    </up-form-item>
  </up-form>

  <up-text text="检验单明细:" class="grid-title" bold v-if="checkRecords && checkRecords.length"></up-text>
  <CheckRecord :checkItems="checkRecords" :form="form" @setFormResult="setFormResult" @setFailureMod="setFailureMod" v-if="checkRecords && checkRecords.length"> </CheckRecord>

  <up-form class="common-form common-form-next" labelPosition="left">
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
    <up-form-item class="common-form-item" label="设备数据:" borderBottom labelWidth="80" style="padding: 0" v-if="equipments && equipments.length > 0">
      <up-textarea v-model="form.equipmentContent" placeholder="自动带出" class="input-item" disabled></up-textarea>
    </up-form-item>
    <up-form-item class="common-form-item" label="结果:" borderBottom labelWidth="80" style="padding: 0" v-if="equipments && equipments.length > 0">
      <up-input :modelValue="ResultMap[form.result]" placeholder="自动带出" readonly class="input-item" border="none"></up-input>
    </up-form-item>
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
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"
import type { UploadMedia } from "@/type/file"
import TraceTablePK5 from "./components/TraceTablePK5.vue"
import CheckRecord from "./components/CheckRecord.vue"
import UpInputScan from "@/components/UpInputScanNew.vue"
import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"
import { globalColor } from "@/store/theme"
import { Platform } from "@/util/env"
import { useThrottle, useDebounce, useRmRepeat } from "@ultra-man/noa"
import mqtt from "mqtt/dist/mqtt.js"
import { getEquipmentByLineDetailId, getCheckItemListApi, productJobSubmit, checkHeadTail, codeCheckInfoApi, findCardByUrl, traceResetPlc, getTraceLineDetail } from "@/api/trace"
import { getWorkPlan } from "@/api/workPlan"
import { getProductByCode } from "@/api/product"
import { P, PK, BarcodeNames, ResultMap } from "./enum"
import { setCustomModal } from "@/store/customModal"

const props = defineProps<{
  lineDetailData?: Obj
  lineDetailId?: string
  procedureName?: string
  planCode?: string
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
  checkFirstFinal: 0,
  firstNum: 0,
  finalNum: 0,
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
  resetPlc: 0,
  printed: 0,
  activeNum: null as Num,
})
const oriCodeCheckInfo = () => ({ canSave: 0 })

const form = ref(oriForm())
const codeRules = ref<Objs>([])
const equipments = ref<Objs[]>([])
const checkRecords = ref<Objs>([])
const failureModSelected = ref<Objs>([])
const codeCheckInfo = ref<Obj>(oriCodeCheckInfo())
const traceTableRef = ref<Obj | null>(null)
const processList = ref<Objs>([])
const showEquipmentPicker = ref(false)
const unlockCode = ref()
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
    form.value.checkFirstFinal = d.checkFirstFinal
    form.value.codeRules = d.codeRules ? JSON.parse(d.codeRules) : []
    form.value.reworked = d.reworked
    form.value.checked = d.checked || ""
    form.value.resetPlc = d.resetPlc
    form.value.printed = d.printed
    if (form.value.planCode) {
      getPlanInfo()
    }
    getEquipment()
    initWebSocket()
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

const getPlanInfo = async () => {
  if (!form.value.planCode) {
    initFormPlan()
    return
  }
  uni.showLoading({ mask: true, title: "计划详情获取中" })
  try {
    const r = await getWorkPlan({ planCode: form.value.planCode, lineDetailId: form.value.lineDetailId })
    const { planId, productCode, planNum, realNum, firstNum, finalNum } = r.data
    form.value.planId = planId
    form.value.productCode = productCode
    form.value.planNum = planNum
    form.value.realNum = realNum
    form.value.firstNum = firstNum
    form.value.finalNum = finalNum
    const re = await getProductByCode({ productCode })
    if (re && re.data) form.value.cusProductCode = re.data.cusProductCode
    if (traceTableRef.value) {
      traceTableRef.value.searchList({ lineDetailId: form.value.lineDetailId, planId: form.value.planId })
    }
    if (form.value.checked == "1") await getCheckItemList()
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
    const servies = JSON.parse(message.toString()).body.things
    let equipmentData: Obj | null = null
    for (const item of servies) {
      if (form.value.equipmentCode == item.id && item.items[0]) {
        equipmentData = item.items[0].properties
        break
      }
    }
    if (equipmentData) {
      form.value.equipmentContent = equipmentData.equipment_parameters
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
      equipmentCode: item.moldCode,
      equipmentName: item.moldName,
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
  if (code.indexOf("http") !== -1) {
    uni.showLoading({ mask: true, title: "设备获取中" })
    const ree = await findCardByUrl({ url: code })
    if (ree.data) code = ree.data.split(",")[0]
    form.value.equipmentCode = code
    uni.hideLoading()
  }
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
  if (res && res.indexOf("http") !== -1) {
    uni.showLoading({ mask: true, title: "工装获取中" })
    let ree = await findCardByUrl({ url: res })
    if (ree.data) ree = ree.data.split(",")[0]
    item.barCode = ree
    uni.hideLoading()
  } else {
    item.barCode = res
  }
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
  if (form.value.resetPlc) {
    traceResetPlc({ equipmentCode: form.value.equipmentCode })
  }
  form.value.equipmentContent = ""
  form.value.result = "1"
}

const preSubmit = () => {
  if (!form.value.planId) {
    setCustomModal({ visiable: true, content: "请先填写计划id" })
    return false
  }
  for (const item of codeRules.value) {
    if (!item.barCode) {
      setCustomModal({ visiable: true, content: "条码未填写完" })
      return false
    }
  }
  if (Number(form.value.realNum) + form.value.thisNum > Number(form.value.planNum) && form.value.submitType == "1") {
    setCustomModal({ visiable: true, content: "不能超过计划数量" })
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

const headTailCheck = async () => {
  if (form.value.checkFirstFinal && form.value.firstNum && form.value.finalNum) {
    if (Number(form.value.realNum) >= form.value.firstNum) {
      await checkHeadTail({
        planCode: form.value.planCode,
        checkTypeCode: Number(form.value.realNum) >= form.value.finalNum ? 2 : 1,
      })
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

const submit = useThrottle(async () => {
  if (!preSubmit()) return
  if (!(await headTailCheck())) return
  if (!(await codeCheckInfoHandler())) return
  uni.showLoading({ mask: true, title: "提交中" })
  try {
    const params: Obj = Object.assign({}, form.value)
    params.fileUrl = params.images.map((item: Obj) => item.url).join(",")
    params.fileName = params.images.map((item: Obj) => item.name).join(",")
    if (form.value.checked == "1") {
      params.checkList = checkRecords.value.map((item: Obj) => ({
        ...item,
        imagesUrl: item.images.map((i: Obj) => i.url).join(","),
      }))
    }
    params.barcodeList = codeRules.value
    params.barcode1 = params.barcodeList[0]?.barCode
    params.barcode2 = params.barcodeList[1]?.barCode
    await productJobSubmit(params)
    uni.showToast({ icon: "none", title: "提交成功" })
    await getPlanInfo()
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
.grid-title {
  padding: 20rpx 0;
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
