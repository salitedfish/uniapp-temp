export enum P {
  "银和晶科条码自配" = "DZ015",
  "银和晶科打包" = "DZ016",
}

export enum PK {
  "条码关联" = 1,
  "数据采集",
  "扫码登记",
  "定制流程",
}

export const BarcodeNames: Obj = {
  1: "壳体条码",
  2: "中间条码",
  3: "临时条码",
  4: "客供条码",
}

export const ResultMap: Obj = {
  "-1": "",
  "0": "不合格",
  "1": "合格",
  "2": "待检测",
}
