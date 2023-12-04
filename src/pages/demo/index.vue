<script lang="ts" setup>
	import { ref, watch } from "vue";
	import { onLoad, onShow, onUnload, onHide } from "@dcloudio/uni-app"
	import ScanCode from "@/components/ScanCode.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import ChooseImage from "@/components/ChooseImage.vue"
	import MediaUpload from "@/components/MediaUpload.vue"
	import FileUpload from "@/components/FileUpload.vue"
	import { routes } from "@/store/route"
	import { useLogout } from "@/hook/useLogout"
	import LoadMore from "@/components/LoadMore.vue"
	import type { UploadMedia, UploadFile } from "@/type/file"
	import { onReachBottom, onPullDownRefresh } from "@dcloudio/uni-app";


	onLoad(() => { console.log("demo 页面 onLoad") })
	onShow(() => { console.log("demo 页面 onShow") })
	onUnload(() => { console.log("demo 页面 onUnload") })
	onHide(() => { console.log("demo 页面 onHide") })

	const modelValue = ref("")

	const goNav = () => {
		uni.navigateTo({
			url: `${routes.demoInside.path}?id=abc`,
		})
	}

	onPullDownRefresh(() => {
		console.log("demo 下拉刷新")
		setTimeout(() => {
			uni.stopPullDownRefresh()
		}, 2000)
	})

	const chooseImage = (tempFiles : UniApp.ChooseImageSuccessCallbackResult["tempFiles"]) => {
		console.log(tempFiles)
	}

	const goLogin = () => {
		uni.navigateTo({
			url: routes.login.path
		})
	}
	const goLogout = async () => {
		uni.redirectTo({
			url: routes.login.path
		})
	}
	const clearLogin = () => {
		uni.removeStorageSync("token")
		uni.removeStorageSync("userInfo")
	}

	const scanSuccess = (result : string) => {
		uni.showToast({
			icon: "none",
			title: result
		})
	}

	const show = ref(false)
	const showPopup = () => {
		show.value = true
	}
	const close = () => {
		show.value = false
	}
	const open = () => { }
	const del = () => {
		uni.showModal({
			content: "确定要删除吗？",
			showCancel: true,
			success(res) {
				if (res.confirm) {
					uni.showToast({
						icon: "none",
						title: "删除成功"
					})
				}
			}
		})
	}

	const list = ref([{
		name: "Jeson",
		date: "2020",
		address: "海定",
		info: "信息",
		options: "操作"
	}, {
		name: "Jeson",
		date: "2020",
		address: "海定",
		info: "信息",
		options: "操作"
	}])

	const status = ref("loadmore")
	onReachBottom(() => {
		console.log("触底加载更多")
		status.value = "loading"
		setTimeout(() => {
			list.value.push({
				name: "Jeson",
				date: "2020",
				address: "海定",
				info: "信息",
				options: "操作"
			})
			status.value = "loadmore"
		}, 2000)
	})
	const loadmore = () => {
		console.log("点击加载全部")
		status.value = "loading"
		setTimeout(() => {
			list.value.push({
				name: "Jeson",
				date: "2020",
				address: "海定",
				info: "信息",
				options: "操作"
			})
			status.value = "nomore"
		}, 2000)
	}

	const medias = ref<UploadMedia[]>([{
		name: "atqi0-ymtgk.png",
		status: "fail",
		type: "image",
		url: "https://img95.699pic.com/photo/40005/0347.jpg_wh860.jpg",
	}])
	const files = ref<UploadFile[]>([{ name: "atqi0-ymtgk.png", path: "https://img95.699pic.com/photo/40005/0347.jpg_wh860.jpg" }, { name: "README.md", path: "https://gitee.com/yinlunxx/pre-litigation-adjustment-web/blob/main_new/README.md" }])
</script>

<template>
	<view class="uni-common-mt">
		<up-button @click="goNav" type="primary">跳转</up-button>
		<up-button @click="goLogin" type="primary">登录</up-button>
		<up-button @click="goLogout" type="primary">退出</up-button>
		<up-button @click="clearLogin" type="primary">清空登录信息</up-button>
		<up-button @click="showPopup" type="primary">居中显示弹出框</up-button>
		<ChooseImage @success="chooseImage"></ChooseImage>
		<ScanCode @scanSuccess="scanSuccess" label="扫描"></ScanCode>
		<file-upload v-model="files"></file-upload>
		<file-upload v-model="files"></file-upload>
		<media-upload v-model="medias" accept="image"></media-upload>
		<media-upload v-model="medias" accept="video"></media-upload>

		<view class="common-section-title">
			基本信息
		</view>
		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="扫描:" borderBottom labelWidth="50" style="padding: 0">
				<up-input-scan v-model="modelValue" border="none" placeholder="请输入扫码" clearable
					class="input-item"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="账号:" borderBottom labelWidth="50" style="padding: 0">
				<up-input-scan v-model="modelValue" border="none" placeholder="请输入扫码" clearable
					class="input-item"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="账号:" borderBottom labelWidth="50" style="padding: 0">
				<up-input-scan v-model="modelValue" border="none" placeholder="请输入扫码" clearable
					class="input-item"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="账号:" borderBottom labelWidth="50" style="padding: 0">
				<up-input border="none" placeholder="请输入账号" clearable class="input-item">
				</up-input>
			</up-form-item>
		</up-form>

		<view class="common-section-title">
			基本信息
		</view>
		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="账号:" borderBottom labelWidth="50" style="padding: 0">
				<up-input-scan v-model="modelValue" border="none" placeholder="请输入扫码" clearable
					class="input-item"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="账号:" borderBottom labelWidth="50" style="padding: 0">
				<up-input-scan v-model="modelValue" border="none" placeholder="请输入扫码" clearable
					class="input-item"></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="账号:" borderBottom labelWidth="50" style="padding: 0">
				<up-input border="none" placeholder="请输入账号" clearable class="input-item">
				</up-input>
			</up-form-item>
		</up-form>

		<u-popup :show="show" mode="center" @close="close" @open="open" :round="5">
			<view class="popup-content">
				<text>人生若只如初见，何事秋风悲画扇</text>
				<text>人生若只如初见，何事秋风悲画扇</text>
				<text>人生若只如初见，何事秋风悲画扇</text>
				<text>人生若只如初见，何事秋风悲画扇</text>
				<text>人生若只如初见，何事秋风悲画扇</text>
				<text>人生若只如初见，何事秋风悲画扇</text>
				<text>人生若只如初见，何事秋风悲画扇</text>
			</view>
		</u-popup>
		<view class="common-section-title">
			表格数据
		</view>
		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" type="selection">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th align="left" width="100rpx">日期</uni-th>
					<uni-th align="left" width="100rpx">姓名</uni-th>
					<uni-th align="left" width="100rpx">地址</uni-th>
					<uni-th align="left" width="100rpx">信息</uni-th>
					<uni-th align="left" width="100rpx">操作</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in list" :key="key">
					<uni-td>{{ item.date }}</uni-td>
					<uni-td>{{ item.name }}</uni-td>
					<uni-td>{{ item.address }}</uni-td>
					<uni-td class="primary" @click="showPopup">{{ item.info }}</uni-td>
					<uni-td class="warning" @click="del">{{ item.options }}</uni-td>
				</uni-tr>

			</uni-table>
			<LoadMore :status="status" @loadmore="loadmore"></LoadMore>
			<uni-pagination title="分页" show-icon="true" :total="50" :current="1" :pageSize="10"></uni-pagination>
		</view>

	</view>
</template>

<style lang="scss" scoped>
	.uni-common-mt {
		padding: 0 24rpx 0;

		.demo-box {}
	}

	.popup-content {
		width: 80vw;
		padding: 20rpx;
	}
</style>