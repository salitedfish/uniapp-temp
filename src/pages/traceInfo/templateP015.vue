<template>
  <AutoConnectBlueTooth ref="autoConnectBlueTooth" v-if="form.printed == 1"> </AutoConnectBlueTooth>

  <up-steps :current="traced ? form.activeNum : -1" style="margin-top: 10px; overflow-x: scroll" v-if="processList.length > 0">
    <up-steps-item v-for="(item, key) in processList" :key="key" :title="item.procedureName" :error="traced && item.result != 1 && key != form.activeNum"></up-steps-item>
  </up-steps>

  <up-form class="common-form" :class="{ 'common-form-next': Platform.isApp() }" labelPosition="left">
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

    <up-form-item class="common-form-item" label="实际数量:" borderBottom labelWidth="80" style="padding: 0" v-if="!isTrace">
      <up-input v-model="form.realNum" placeholder="计划单号自动带出" clearable class="input-item" readonly border="none"></up-input>
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

    <up-form-item class="common-form-item" label="装箱数量:" borderBottom labelWidth="80" style="padding: 0">
      <up-input v-model="form.packageNum" placeholder="自动带出" clearable class="input-item" readonly border="none"></up-input>
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
  </up-form>

  <view class="btn-box">
    <up-button type="primary" class="btn" shape="circle" @click="submit">确 认</up-button>
    <up-button type="primary" class="btn" shape="circle" @click="resetBarCode1A2">重 置</up-button>
  </view>

  <view class="btn-box">
    <BoxBarcodePrinter :productCode="form.productCode" :cusProductCode="form.cusProductCode" :codeRule="codeRules[1]" v-if="codeRules[1]" @genSuccess="boxBarcodeGenSuccess"> </BoxBarcodePrinter>
    <BoxBarcodeRePrinter style="margin-left: 5px"> </BoxBarcodeRePrinter>
  </view>
  <view class="btn-box" v-if="form.printed == 1">
    <BoxBarcodePrinter1 :productCode="form.productCode" :cusProductCode="form.cusProductCode" :codeRule="codeRules[1]" v-if="codeRules[1]" @genSuccess="boxBarcodeGenSuccess"> </BoxBarcodePrinter1>
    <BoxBarcodeRePrinter1 style="margin-left: 5px"> </BoxBarcodeRePrinter1>
  </view>

  <TraceTablePK5 ref="traceTableRef" :form="form" :codeRules="codeRules" style="margin-top: 10px"> </TraceTablePK5>

  <CustomModal>
    <up-input v-model="unlockCode" placeholder="请输入验证码" class="input-item"></up-input>
  </CustomModal>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick } from "vue"
import type { UploadMedia } from "@/type/file"
import TraceTablePK5 from "./components/TraceTablePK5.vue"
import CheckRecord from "./components/CheckRecord.vue"
import UpInputScan from "@/components/UpInputScanNew.vue"
import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"
import TraceProductPicker from "@/components/TraceProductPicker.vue"
import AutoConnectBlueTooth from "@/components/AutoConnectBlueTooth.vue"
import BoxBarcodePrinter from "./components/BoxBarcodePrinter.vue"
import BoxBarcodePrinter1 from "./components/BoxBarcodePrinter1.vue"
import BoxBarcodeRePrinter from "./components/BoxBarcodeRePrinter.vue"
import BoxBarcodeRePrinter1 from "./components/BoxBarcodeRePrinter1.vue"
import { Platform } from "@/util/env"
import { useThrottle, useRmRepeat } from "@ultra-man/noa"
import { printBoxBarcode } from "./util"
import { getPackageNumApi, getCheckItemListApi, productJobSubmit, checkHeadTail, codeCheckInfoApi, findCardByUrl, getTraceList2, getTraceLineDetail, traceResetPlc } from "@/api/trace"
import { getWorkPlan } from "@/api/workPlan"
import { getProductByCode } from "@/api/product"
import { getBarcodeList } from "@/api/codeRule"
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
  activeNum: null as Num,
  resetPlc: 0,
  printed: 0,
})
const oriCodeCheckInfo = () => ({ canSave: 0 })

const form = ref(oriForm())
const codeRules = ref<Objs>([])
const checkRecords = ref<Objs>([])
const failureModSelected = ref<Objs>([])
const codeCheckInfo = ref<Obj>(oriCodeCheckInfo())
const traceTableRef = ref<Obj | null>(null)
const processList = ref<Objs>([])
// 是否已按条码查到工序报工结果: 未查之前不判断工序状态(否则会显示假的红叉/已完成)
const traced = ref(false)
const unlockCode = ref()
const autoConnectBlueTooth = ref<Obj | undefined>()
// 追溯入口(从追溯报工进入)不依赖工作计划(页面 query 参数均为字符串)
const isTrace = computed(() => props.noPlan == "1")
const productSelected = ref<Objs>([])

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
    // 追溯入口: 默认带出上次选的产品(须在产线条码规则解析之后)
    if (isTrace.value) applyCachedProduct()
    if (autoConnectBlueTooth.value) {
      autoConnectBlueTooth.value.checkBlueTooth()
    }
    const ree = await getTraceLineDetail({ lineId: form.value.lineId })
    if (ree.data && ree.data.list) {
      ree.data.list.forEach((row: Obj, index: number) => {
        if (row.lineDetailId == form.value.lineDetailId) {
          form.value.activeNum = index
        }
      })
      processList.value = ree.data.list
    }
  } catch (err) {
    console.log(err)
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
  try {
    uni.showLoading({ mask: true, title: "计划详情获取中" })
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
    refreshTraceTable()
    if (form.value.checked == "1") await getCheckItemList()
    getCodeRules()
    form.value.result = "1"
  } catch (err) {
    initFormPlan()
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
  form.value.packageNum = null
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
  refreshTraceTable()
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
  // 提交后条码被清空, 工序状态回到未查状态
  traced.value = false
  getCodeRules()
  if (form.value.checked == "1") await getCheckItemList()
  form.value.result = "1"
  refreshTraceTable()
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

const codeRuleScanSuccess = async (res: string, item: Obj, index: number) => {
  if (res && res.indexOf("http") !== -1) {
    try {
      uni.showLoading({ mask: true, title: "工装获取中" })
      let ree = await findCardByUrl({ url: res })
      if (ree.data) ree = ree.data.split(",")[0]
      item.barCode = ree
    } catch (err) {
      console.log(err)
    } finally {
      uni.hideLoading()
    }
  } else {
    item.barCode = res
  }
  if (res) {
    if (index == 0) await traceSearch(res)
    if (index == 1) await getPackageNum(res)
  } else if (index == 0) {
    // 条码清空后工序状态无从判断, 回到未查状态
    traced.value = false
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

const boxBarcodeGenSuccess = (res: string) => {
  const item = codeRules.value[1]
  if (item) {
    item.barCode = res
    codeRuleScanSuccess(res, item, 1)
  }
}

const traceSearch = async (barcode: string) => {
  try {
    const res = await getTraceList2({ lineId: form.value.lineId, barcode })
    // 工序状态一律用后端返回的真实结果(result: 1 合格 / 0 不合格 / null 该工序无报工记录)
    if (res.data && res.data.length > 0) {
      processList.value = res.data
      traced.value = true
    } else {
      processList.value = []
      traced.value = false
      setCustomModal({
        visiable: true,
        content: "未查询到此条码报工记录",
      })
    }
  } catch (err) {
    console.log(err)
  }
}

const getPackageNum = async (barcode: string) => {
  try {
    const res = await getPackageNumApi({ barcode, lineDetailId: form.value.lineDetailId })
    if (res) {
      form.value.packageNum = res.data
      await checkPackageFull(barcode, res.data)
    }
  } catch (err) {
    console.log(err)
  }
}

const checkPackageFull = async (barcode: string, packageNum: number) => {
  try {
    const res = await getBarcodeList({ pageSize: 1, currentPage: 1, barcode })
    if (res && res.data.list.length > 0) {
      const codeInfo = res.data.list[0]
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
  const bzCode = codeRules.value[1]?.barCode
  getCodeRules(true)
  if (form.value.resetPlc) {
    traceResetPlc({ equipmentCode: form.value.equipmentCode })
  }
  if (codeRules.value[1]) {
    codeRules.value[1].barCode = bzCode
  }
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
  if (form.value.checked == "1") {
    for (const key in processList.value) {
      const item = processList.value[key]
      // 要跳过的是当前报工的工序(不是最后一道), 其余工序必须已合格
      if (item.result != 1 && Number(key) != Number(form.value.activeNum)) {
        setCustomModal({ visiable: true, content: "前工序存在未提交或不合格，请确认" })
        return false
      }
    }
  }
  if (!isTrace.value && Number(form.value.realNum) + form.value.thisNum > Number(form.value.planNum) && form.value.submitType == "1") {
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
  // 追溯入口没有计划: 首末检依赖计划带出的 firstNum/finalNum, 直接跳过
  if (isTrace.value) return true
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
  try {
    uni.showLoading({ mask: true, title: "条码校验中" })
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
  } catch (err) {
    console.log(err)
    return false
  } finally {
    uni.hideLoading()
  }
}

const submit = useThrottle(async () => {
  if (!preSubmit()) return
  if (!(await headTailCheck())) return
  if (!(await codeCheckInfoHandler())) return
  try {
    uni.showLoading({ mask: true, title: "提交中" })
    const params: Obj = Object.assign({}, form.value)
    params.fileUrl = params.images.map((item: Obj) => item.url).join(",")
    params.fileName = params.images.map((item: Obj) => item.name).join(",")
    params.barcodeList = codeRules.value
    params.barcode1 = params.barcodeList[0]?.barCode
    params.barcode2 = params.barcodeList[1]?.barCode
    await productJobSubmit(params)
    uni.showToast({ icon: "none", title: "提交成功" })
    await getPackageNum(params.barcodeList[1]?.barCode)
    await refreshAfterSubmit()
    form.value.thisNum = 1
    form.value.remark = ""
    form.value.toolingCode = ""
    form.value.images = []
    form.value.submitType = "1"
    failureModSelected.value = []
  } catch (err) {
    console.log(err)
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
