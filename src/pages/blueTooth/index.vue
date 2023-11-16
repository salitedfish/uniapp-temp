<template>
  <view class="print">
    <up-button
      class="btn-item"
      @click="show = true"
      type="primary"
      text="蓝牙连接"
    ></up-button>

    <u-popup :show="show" mode="right" @close="show = false">
      <view class="print-option">
        <view class="btn-box">
          <up-button
            class="search-btn"
            @click="searchClick"
            type="primary"
            :text="searching ? '停止搜索' : '开始搜索'"
            shape="circle"
          ></up-button>
          <up-button
            class="search-btn"
            @click="reConnect"
            type="primary"
            text="重新连接"
            shape="circle"
          ></up-button>
        </view>

        <u-subsection
          :list="subList"
          :current="subSelect"
          @change="subChange"
          mode="subsection"
        ></u-subsection>

        <view class="options-box">
          <up-text
            class="title"
            text="设备列表:"
            type="info"
            v-show="subSelect === 0"
          ></up-text>
          <radio-group @change="radioChange" v-show="subSelect === 0">
            <label
              class="uni-list-cell uni-list-cell-pd"
              v-for="(item, index) in blueToothParams.devices"
              :key="index"
            >
              <view>
                <radio :value="item.deviceId" />{{
                  item.name ? `${item.deviceId}(${item.name})` : item.deviceId
                }}
              </view>
            </label>
          </radio-group>

          <up-text
            class="title"
            text="服务列表:"
            type="info"
            v-show="subSelect === 1"
          ></up-text>
          <radio-group @change="radioChange2" v-show="subSelect === 1">
            <label
              class="uni-list-cell uni-list-cell-pd"
              v-for="(item, index) in blueToothParams.serverList"
              :key="index"
            >
              <view> <radio :value="item.uuid" />{{ item.uuid }} </view>
            </label>
          </radio-group>

          <up-text
            class="title"
            text="特征列表:"
            type="info"
            v-show="subSelect === 2"
          ></up-text>
          <radio-group @change="radioChange3" v-show="subSelect === 2">
            <label
              class="uni-list-cell uni-list-cell-pd"
              v-for="(item, index) in blueToothParams.characteristics"
              :key="index"
            >
              <view>
                <radio :value="item.uuid" />{{ item.uuid }}
                (
                {{ item.properties.write ? "可写" : "不可写" }}
                )
              </view>
            </label>
          </radio-group>
        </view>
      </view>
    </u-popup>

    <view class="uni-common-mt">
      <view class="uni-form-item uni-column">
        <view class="title">
          <up-text text="打印纸宽度(mm)" type="info"></up-text>
        </view>
        <up-input
          border="surround"
          v-model="printPage.width"
          placeholder="输入打印纸宽度"
          clearable
          type="number"
        ></up-input>
      </view>

      <view class="uni-form-item uni-column">
        <view class="title">
          <up-text class="title" text="打印纸高度(mm)" type="info"></up-text>
        </view>
        <up-input
          border="surround"
          v-model="printPage.height"
          placeholder="输入打印纸高度"
          clearable
          type="number"
        ></up-input>
      </view>

      <view class="uni-form-item uni-column">
        <view class="title">
          <up-text class="title" text="打印纸间隙(mm)" type="info"></up-text>
        </view>

        <up-input
          border="surround"
          v-model="printPage.gap"
          placeholder="输入打印纸间隙"
          clearable
          type="number"
        ></up-input>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { BlueTooth } from "../../components/blueTooth"
import { getBlueToothParams, printPage } from "../../store/print"

const show = ref(false)
const searching = ref(false)
const blueToothParams = getBlueToothParams()
const blueTooth = new BlueTooth()

// 分段器数据
const subList = ["设备", "服务", "特征"]
const subSelect = ref(0)
const subChange = (index: number) => {
  subSelect.value = index
}

// 搜索按钮点击
const searchClick = () => {
  if (searching.value) {
    blueTooth.stopDiscoveryPrinter()
	searching.value = false
  } else {
    blueTooth.discoveryPrinter()
	searching.value = true
  }
}

// 重新连接
const reConnect = () => {
	blueTooth.reConnect()
}
// 设备列表选择改变
const radioChange = (e: any) => {
  // 改变设备选择时先断开原先的设备
  if (blueToothParams.deviceId) {
    uni.closeBLEConnection({
      deviceId: blueToothParams.deviceId,
    })
  }
  // 选择设备后关闭搜索
  blueTooth.stopDiscoveryPrinter()
  searching.value = false
  blueToothParams.deviceId = e.detail.value
  blueToothParams.serviceId = ""
  blueToothParams.serverList = []
  blueToothParams.characteristics = []
  blueToothParams.characteristicId = ""
  //连接蓝牙
  blueTooth.connect()
}
// 设备服务列表选择改变
const radioChange2 = (e: any) => {
  blueToothParams.serviceId = e.detail.value
  blueToothParams.characteristics = []
  blueToothParams.characteristicId = ""
  // 获取蓝牙特征值
  blueTooth.getBLEDeviceCharacteristics()
}
// 特征值选择改变
const radioChange3 = (e: any) => {
  blueToothParams.characteristicId = e.detail.value
  for (let item of blueToothParams.characteristics) {
    if (e.detail.value === item.uuid) {
      blueToothParams.characteristic = item
      break
    }
  }
}

// 初始化获取蓝牙模块
onMounted(() => {
  // 初始化蓝牙模块
  //@ts-ignore
  if (uni.openBluetoothAdapter) {
    blueToothParams.hasBlueTooth = true
    blueTooth.openBluetoothAdapter()
  } else {
    blueToothParams.hasBlueTooth = false
    uni.showToast({
      icon: "none",
      title: "未找到蓝牙模块",
    })
  }
})
</script>

<style scoped lang="scss">
.print {
  width: 100%;
  .print-option {
    position: relative;
    width: 80vw;
    height: 100vh;

    .btn-box {
      position: absolute;
      left: 50%;
      bottom: 108rpx;
      transform: translateX(-50%);
      width: 160rpx;

      .search-btn {
        margin-top: 12rpx;
        border-radius: 60rpx;
      }
    }
    .options-box {
      height: 90vh;
      overflow-y: scroll;
      padding: 0 24rpx 24rpx;
      .title {
        margin-bottom: 16rpx;
      }
    }
  }
  .uni-common-mt {
    padding: 0rpx 24rpx 0;
    .uni-form-item {
      margin-top: 24rpx;
      .title {
        margin-bottom: 16rpx;
      }
    }
  }
}
</style>
