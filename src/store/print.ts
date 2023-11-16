import { reactive } from "vue"

const blueToothParams = reactive({
  hasBlueTooth: false,

  startFound: false,

  devices: [] as any,
  deviceId: "",

  serverList: [] as any,
  serviceId: "",

  characteristics: [] as any,
  characteristic: {} as any,
  characteristicId: "",
})

export const getBlueToothParams = () => {
  return blueToothParams
}

export const printPage = reactive({
  width: null,
  height: null,
  gap: null,
  QRCodeLevel: null,
  QRCodeLeftOffset: null,
  QRCodeTopOffset: null,
  textLeftOffset: null,
  textTopOffset: null,
})
