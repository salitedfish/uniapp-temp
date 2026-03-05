<template>
  <view v-if="detailData.equipmentContent">
    <!-- 不同种类设备，后端返回的格式不一样，通过不同方式展示 -->

    <!-- 拉铆设备数据 -->
    <view v-if="detailData.equipmentContent.boltRivetingDepthList">
      <uni-table border stripe emptyText="暂无更多数据">
        <uni-tr>
          <uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">序列号</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">最大拉力值</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">最大拉力值位移</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">拉力设定</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">行程设定</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">最小拉力</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">最大拉力</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">最小行程</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">最大行程</uni-th>
          <uni-th class="nowrap" align="left" width="80rpx">质量状态</uni-th>
        </uni-tr>
        <uni-tr v-for="(item, key) in detailData.equipmentContent.boltRivetingDepthList" :key="key">
          <uni-td class="nowrap">{{ Number(key) + 1 }}</uni-td>
          <uni-td class="nowrap">{{ item.serialNumber }}</uni-td>
          <uni-td class="nowrap">{{ item.fout }}</uni-td>
          <uni-td class="nowrap">{{ item.soutCopy }}</uni-td>
          <uni-td class="nowrap">{{ item.f }}</uni-td>
          <uni-td class="nowrap">{{ item.s }}</uni-td>
          <uni-td class="nowrap">{{ item.fmin }}</uni-td>
          <uni-td class="nowrap">{{ item.fmax }}</uni-td>
          <uni-td class="nowrap">{{ item.smin }}</uni-td>
          <uni-td class="nowrap">{{ item.smax }}</uni-td>
          <uni-td class="nowrap">{{ item.qty }}</uni-td>
        </uni-tr>
      </uni-table>
    </view>

    <!-- 其他设备数据 -->
    <view v-if="detailData.equipmentContent.pressureValue">压力值: {{ detailData.equipmentContent.pressureValue }}</view>
    <view v-if="detailData.equipmentContent.leakValue">泄漏值: {{ detailData.equipmentContent.leakValue }}</view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  detailData: Obj
}>()
</script>

<style scoped lang="less"></style>
