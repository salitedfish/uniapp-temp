<template>
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
</template>

<script lang="ts" setup>
import { printPage } from "../../store/print"
</script>

<style lang="less">
.uni-common-mt {
  padding: 0 24rpx 0;
  .uni-form-item {
    margin-top: 24rpx;
    .title {
      margin-bottom: 16rpx;
    }
  }
}
</style>
