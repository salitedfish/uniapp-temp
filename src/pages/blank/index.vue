<script lang="ts" setup>
	// 启动页(pages.json 的第一页, 也就是 app 起来先落地的这一页), 页面本身不渲染任何东西,
	// 初始化统一在 App.vue 的 onLaunch 里按端分发(initApp / initWeb / initInDD / initInWX)。
	//
	// 这里原本还有一段「启动时静默检查更新」(仅 App 端, 且已登录时调 versionCheck),
	// 2026-09-30 移到首页右上角抽屉里的「检查更新」按钮手动触发 —— 启动不再检查更新。
	// 别再加回来: 手动入口是用户明确要的, 两处都查会重复弹升级弹窗。
</script>

<template>
</template>

<style>
</style>