<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import { globalColor } from "@/store/theme"
import { getPrinterList } from "@/api/common"

const props = defineProps<{
  selected?: string[]
}>()
const emit = defineEmits<{
  (event: "select", result: string[]): void
  (event: "update:selected", result: string[]): void
}>()

onMounted(() => {
  initData()
  if (props.selected) {
    emit("select", props.selected)
    inputText.value = props.selected.join(", ")
  }
})
watch(
  () => props.selected,
  () => {
    if (props.selected) {
      emit("select", props.selected)
      inputText.value = props.selected.join(", ")
    }
  },
)

const initData = async () => {
  const res = await getPrinterList()
  columns.value[0] = res.data
}

// input显示的字符串
const inputText = ref("")
const show = ref(false)
const columns = ref<string[][]>([])

const open = () => {
  show.value = true
}
const select = (res: { value: string[] }) => {
  inputText.value = res.value[0] || ""
  show.value = false
  emit("update:selected", res.value)
  emit("select", res.value)
}
</script>

<template>
  <up-input v-model="inputText" placeholder="请选择打印机" class="input-item" readonly border="none">
    <template #suffix>
      <uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="20" :color="globalColor.primary" @click="open"></uni-icons>
      <up-picker :show="show" :columns="columns" @confirm="select" @cancel="show = false" keyName="name"></up-picker>
    </template>
  </up-input>
</template>

<style scoped lang="less"></style>
