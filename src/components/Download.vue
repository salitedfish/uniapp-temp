<template>
	<!-- #ifdef APP -->
	<view @click="initAppDownload(info.path)">
		{{ info.name }}
	</view>
	<!-- #endif -->
	<!-- #ifdef H5 -->
	<view @click='initH5Download(info)'> {{ info.name }} </view>
	<!-- #endif -->

</template>

<script>
	import {
		useDownloadByURL
	} from "@ultra-man/noa"
	export default {
		props: {
			info: {
				required: true
			}
		},
		data() {
			return {
				loadProgress: 0, //加载index
				dltDownLvNew: "", //已下载
				dltDownLvAll: "", //总长度
				dltDownLvWc: "", //完成率
				downloadUlr: "", //下载地址
				suffix: "", //文件后缀
			}
		},
		methods: {
			initH5Download(info) {
				useDownloadByURL(info.path, info.name)
			},
			initAppDownload(url) {
				this.downloadUlr = url;
				//获取地址后缀
				this.suffix = url.split(".")[url.split(".").length - 1];
				if (url.substring(url.length - 3) == "MP4" || url.substring(url.length - 3) == "mp4" || url.substring(url
						.length - 3) ==
					"jpg" || url.substring(url.length - 3) == "png") {
					const downloadTask = uni.downloadFile({
						url: url,
						success: res => {
							if (res.statusCode === 200) {
								if (res.tempFilePath.substring(res.tempFilePath.length - 3) == "mp4" || res.tempFilePath.substring(
										res.tempFilePath.length - 3) == "MP4") {
									//保存视频到相册
									uni.saveVideoToPhotosAlbum({
										filePath: res.tempFilePath,
										success: function() {
											uni.showToast({
												title: '保存成功',
												icon: 'none',
											});
										},
										fail: function() {
											this.loadProgress = 0;
											uni.showToast({
												title: '保存失败',
												icon: 'none'
											});
										}
									});
								} else {
									// 图片保存到手机相册
									uni.saveImageToPhotosAlbum({
										filePath: res.tempFilePath,
										success: function() {
											uni.showToast({
												title: '保存成功',
												icon: 'none',
											});
										},
										fail: function() {
											this.loadProgress = 0;
											uni.showToast({
												title: '保存失败',
												icon: 'none'
											});
										}
									});
								}
							} else {
								uni.showToast({
									title: '下载失败',
									icon: "none"
								})
							}
						},
						fail: (err) => {
							this.loadProgress = 0;
							uni.showToast({
								icon: "none",
								mask: true,
								title: '下载失败'
							})
						}
					});
					downloadTask.onProgressUpdate(this.progressUpdate);
				} else {
					//下载文件为非图片和视频的文件
					let _this = this;
					const downloadTaskt = uni.downloadFile({
						url, //下载地址接口返回
						success: (data) => {
							uni.hideLoading()
							if (data.statusCode === 200) {
								var sFilePath = data.tempFilePath
								//文件保存到本地
								uni.saveFile({
									tempFilePath: data.tempFilePath,
									success: function(res) {
										let osname = plus.os.name;
										//ios手机直接打开文件，手动存储文件到手机，Android手机从根目录创建文件夹，保存文件并改名
										if (osname == 'Android') {
											uni.showToast({
												icon: 'none',
												mask: true,
											});
											_this.fSetFileName(sFilePath);
										}
										setTimeout(() => {
											//打开文档查看
											uni.openDocument({
												filePath: res.savedFilePath,
												success: function(res) {
													console.log("成功打开文件")
												},
												fail() {
													console.log("打开文件失败")
												}
											})
										}, 1000)
									},
									fail: function(res) {}
								});
							} else {
								this.loadProgress = 0;
								console.log(11111111, data)
								uni.showToast({
									icon: "none",
									mask: true,
									title: "下载失败"
								})
							}
						},
						fail: (err) => {
							this.arcZzShow = false;
							this.loadProgress = 0;
							uni.showToast({
								icon: "none",
								mask: true,
								title: "下载失败"
							})
						}
					})
					downloadTaskt.onProgressUpdate(this.progressUpdate);
				}
			},
			// 给下载的文件重命名
			fSetFileName(sFileName) {
				var sFileName = sFileName.split('/')[sFileName.split('/').length - 1]; //原来的文件名
				var url = this.downloadUlr;
				let dtask = plus.downloader.createDownload(url, {
						filename: "file://storage/emulated/0/AAA/" + sFileName //在手机存储更目录创建一个叫AAA的文件夹，把文件存储进去，并更改会原名
					},
					(d, status) => {
						if (status == 200) {
							plus.io.convertLocalFileSystemURL(d.filename);
						} else {
							//下载失败
							plus.downloader.clear(); //清除下载任务
						}
					})
				dtask.start();
			},
			progressUpdate: (res) => {
				this.loadProgress = res.progress;
				if (this.loadProgress < 100) {} else {
					this.loadProgress = 0;
				}
				if (res.totalBytesExpectedToWrite < 10485760) {
					this.dltDownLvNew = Math.ceil(res.totalBytesWritten / 1024) + "KB";
					this.dltDownLvAll = Math.ceil(res.totalBytesExpectedToWrite / 1024) + "KB";
					this.dltDownLvWc = res.progress + "%"
				} else {
					this.dltDownLvNew = Math.ceil(res.totalBytesWritten / 1048576) + "M"
					this.dltDownLvAll = Math.ceil(res.totalBytesExpectedToWrite / 1048576) + "M";
					this.dltDownLvWc = res.progress + "%"
				}
			}
		}

	}
</script>
<style>

</style>