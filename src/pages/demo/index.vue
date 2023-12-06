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
	// @ts-ignore
	import TempPrinter from "@/components/TempPrinter.vue"
	import PrintTemp from "@/components/PrintTemp.vue"

	onLoad(() => { console.log("demo 页面 onLoad") })
	onShow(() => { console.log("demo 页面 onShow") })
	onUnload(() => { console.log("demo 页面 onUnload") })
	onHide(() => { console.log("demo 页面 onHide") })

	const { logouting, logout } = useLogout()

	// 后端数据
	const printDataRemote = [
		{
			shortUrl: "http://tmlmcloud.com:8084/url/J9cV&tenantCode=sdsad",
			belongOrgName: "所属组织0",
			cardCode: "卡片编号0",
			cardName: "卡片名称0",
			toolingTypeName: "分类名称0",
			spec: "规格型号",
			buyTime: "购入日期",
			productionDate: "制造日期",
			processName: "工序名称",
			fixedAssetsCode: "固定资产编码",
			factoryCode: "出厂编号",
			productLineName: "产线名称",
			originalCode: "原卡片编码",
		},
		{
			shortUrl: "http://tmlmcloud.com:8084/url/J9cV&tenantCode=tnhyt",
			belongOrgName: "所属组织1",
			cardCode: "卡片编号1",
			cardName: "卡片名称1",
			toolingTypeName: "分类名称1",
			spec: "规格型号",
			buyTime: "购入日期",
			productionDate: "制造日期",
			processName: "工序名称",
			fixedAssetsCode: "固定资产编码",
			factoryCode: "出厂编号",
			productLineName: "产线名称",
			originalCode: "原卡片编码",
		},
		{
			shortUrl: "http://tmlmcloud.com:8084/url/J9cV&tenantCode=zxczx",
			belongOrgName: "所属组织2",
			cardCode: "卡片编号2",
			cardName: "卡片名称2",
			toolingTypeName: "分类名称2",
			spec: "规格型号",
			buyTime: "购入日期",
			productionDate: "制造日期",
			processName: "工序名称",
			fixedAssetsCode: "固定资产编码",
			factoryCode: "出厂编号",
			productLineName: "产线名称",
			originalCode: "原卡片编码",
		},
		{
			shortUrl: "http://tmlmcloud.com:8084/url/J9cV&tenantCode=qweqw",
			belongOrgName: "所属组织3",
			cardCode: "卡片编号3",
			cardName: "卡片名称3",
			toolingTypeName: "分类名称3",
			spec: "规格型号",
			buyTime: "购入日期",
			productionDate: "制造日期",
			processName: "工序名称",
			fixedAssetsCode: "固定资产编码",
			factoryCode: "出厂编号",
			productLineName: "产线名称",
			originalCode: "原卡片编码",
		},
		{
			shortUrl: "http://tmlmcloud.com:8084/url/J9cV&tenantCode=zxczx",
			belongOrgName: "所属组织4",
			cardCode: "卡片编号4",
			cardName: "卡片名称4",
			toolingTypeName: "分类名称4",
			spec: "规格型号",
			buyTime: "购入日期",
			productionDate: "制造日期",
			processName: "工序名称",
			fixedAssetsCode: "固定资产编码",
			factoryCode: "出厂编号",
			productLineName: "产线名称",
			originalCode: "原卡片编码",
		}
	]
	// 后端模版
	const originContentStringZero =
		'{"checkList":["shortUrl","cardCode","cardName"],"template":"<div data-v-f89c5ede=\\"\\" class=\\"html-template\\" style=\\"width: 6cm; height: 4cm;\\"><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-shortUrl\\" style=\\"z-index: auto; top: 11px; left: 81px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 70px; height: 70px;\\"><img data-v-f89c5ede=\\"\\" src=\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAAAXNSR0IArs4c6QAAA0tJREFUeF7t3NtuwzAMA9D2/z+6wx7rADkg5C7pwL26kWiKusTu+nw8Hq/HH/69Xufuns/nG5rp51d7n97qL/oSupHlErqRzF9TJfTThKpmpf7TmrjaVw0U3ql/7Xe1f1CoAMqBCEntl9CF0alCSmgJfR+b1pSUQtYU1/NKeSlaeFL/spfujzV0t8MSury5qCmlCkmbmAKc+pe9KnR5tZ2WkK8ndKrYKhQ1JFVYCS2h5wykClGTq0LDplBCwUAVuhwwixApSs9rsG+XXxgooVCoFKn1tKnIntZ3B1T+bncemr76aYMlNDwrKKG4Fv73CpUCputpSqY1WPan+PX85beeuwkroWFJEGFal8Km61XolMH1Du2VvrpsBpCaUxO7ejvPEpqG9PzzJXQvn48SupvQ9euMqkHpmJNecqlL78YneynfvJefHqeV0OE3jNMunCpeitptrwodviikBB4yeHcNFSApWCUita+aLHvCMz4PVUoJYAldX63C/9JQU1MAVDNlvwpdGPp3hCrFpyks+1LwX/sXXs6hNBBeYSgFp4pUAKb+yYe6PA2U0LcYVqFhk6XA1uM7PhACSLuwUnY3vtQe8ZXQ83/WTZve4fgujdi0iex+XvjTjCmhYUlSAMaEskagq6djSbqhqX3tT/b1fHxir4gJ0NXrIkT49HwJxauuBHSoyemtpxwowlevS2HCp+djhcpguq4Ayd7uKWE6BZTQzVc+JbSEvifl7VL+bj8zpJqp9d1zrfwdam4Jff/ZqmmTvPzrjKkC9PkqVAyF67cjNC3y2u90g5oL5V+DuvYr/KyhcqANiIDdGxSe3f7ED69ABFjrirDWFSD5L6HhoP11hKZjxKcVIUVP8SpA9J9eI8thCb3Z/8tTAeHXFVMB6PPEV4VmP/B7e0IJMLzDksLSqUElLJ5Dp0U+JSzdgOZCEaz9pXg4h8rhClgApuvyJwKr0Kb8+XFYmqLTkjFVrPCu+C5PeW24hN7sl8UUMNXUKhRnASJYGaEAMOUFQOspQAFOFZNOBZpq6F9vSiJM6yV0mDJThU2fHytsOKY15ZcIjgNy9TVyWhKmG1aJ0rrwXn6NLIAqAWnTEWFaF94SKgZREg5nE035jFEp9AeeJJP4uq/HiwAAAABJRU5ErkJggg==\\" style=\\"width: 100%;\\"></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-cardCode\\" style=\\"z-index: auto; top: 88px; left: 88px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 57px; height: 18px;\\"><p data-v-f89c5ede=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片编码 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-cardName\\" style=\\"z-index: auto; top: 110px; left: 89px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 56px; height: 18px;\\"><p data-v-f89c5ede=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片名称 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div></div>"}'
	const originContentStringOne =
		'{"checkList":["shortUrl","c-text1","cardCode","cardName","spec","fixedAssetsCode","belongOrgName"],"template":"<div data-v-e787917e=\\"\\" class=\\"html-template\\" style=\\"width: 6cm; height: 4cm;\\"><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-shortUrl\\" style=\\"z-index: auto; top: 54px; left: 128px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 86px; height: 86px;\\"><img data-v-e787917e=\\"\\" src=\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAADQUlEQVR4Xu3c0W4CMQxEUfj/j6b0cYPE0ciBpXQq9SmN41yP7ewGer1cLrf779t+brfny12v14Mv079f7b16o7/eF+hGygW6EeavqQJ9NVDVrHT9tCau9lUD5e90fe13tf+gUDmoBQQktV+gC9GpQgq0QI/HpjUlpZA1xTVfKS9Fy590fdlL98caunvBAl2eXNSUUoWkTUwBTteXvSp0ebSdlpA/D3Sq2CoUNSRVWIEW6HMCqULU5KrQsCkUKAhUocsLZgGRojRfB/t2+YVAgUKhUqTG06YiexrfHVCt93HvQ9NHP22wQMN3BQWKa+GvV6gUMB1PUzKtwbI/9V/zT7/13A2sQMOSIGAal8Km41XolOB6h3aP6Fs/ijP1X03s7O1cC3Qa4uP8At3L81Kgu4He7R1qqGpQesxJL7nUpXf7J3spb97LT1+nFejwE8ZpF04VL0XttleFDh8UUoAPGby7hsohKVglIrWvmix78mf8PlQpJQcLdH20Cr+loaamAKhmyn4VuhD6OqBK8WkKy74U/O715S/PoTQQXmEoBaeKVACm65OHujwNFOghhlVo2GQpsPX1HSeEDqRdWCm727/UHv0r0Odf1k2b3sPruzRi0yaye778TzOmQMOSpACMgbJGoKunx5J0Q1P72p/sa378xl4Rk0NnjwuI/NP8AsWjrgT0UJPTW08toAifPS6FyT/NjxUqg+m4AiR7u08J01NAgW6+8inQAj0m5cel/Pq2STVrOp4CSNfbfa6N1y/Q42flpk3y9I8zpgrQ31ehIhSOfxzQ3TVuukGdC8VbB3XtV/4/+LfWUC2gDQjA7g3Kn93riQ+vQOSwxhVhjStAWr9Aw4P2nwOaHiNerQgpeuqvAsT1VUOnDsoBpXQaoKm/BYr/ICFAajJxwKvQ7FtFyjh2+WkK0YHwA7KrYlKFSXGyLx4FOrx0jA/2ikga0d1NpgoN/w2RAlqg4VdLpzVYXV41VQFb/Tu9hmrDBRqmdIGCQNp0/h1QbVjjStnd86dNbDxfT0rasMYLNOzCBXokwC4vYBr/9woVoOn4tGlNa9zUfwnk9GtkOaiDtx59pwC1/oNA1qa02wFtuECHxL895X8AniST+A28urwAAAAASUVORK5CYII=\\" style=\\"width: 100%;\\"></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-belongOrgName\\" style=\\"z-index: auto; top: 98px; left: 0px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 63px; height: 18px;\\"><p data-v-e787917e=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 所属组织 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-cardCode\\" style=\\"z-index: auto; top: 116px; left: 0px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 61px; height: 18px;\\"><p data-v-e787917e=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片编码 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-cardName\\" style=\\"z-index: auto; top: 58px; left: 1px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 59px; height: 18px;\\"><p data-v-e787917e=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片名称 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-spec\\" style=\\"z-index: auto; top: 77px; left: 0px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 63px; height: 18px;\\"><p data-v-e787917e=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 规格型号 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-fixedAssetsCode\\" style=\\"z-index: auto; top: 34px; left: 0px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 88px; height: 18px;\\"><p data-v-e787917e=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 固定资产编码 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-e787917e=\\"\\" class=\\"vdr inactive  template-c-text1\\" style=\\"z-index: auto; top: 6px; left: 50px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 122px; height: 18px;\\"><p data-v-e787917e=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 浙江明筑资产标签 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div></div>"}'
	const originContentStringTwo =
		'{"checkList":["shortUrl","belongOrgName","cardName","spec","productLineName"],"template":"<div data-v-2e45168c=\\"\\" class=\\"html-template\\" style=\\"width: 10cm; height: 10cm;\\"><div data-v-2e45168c=\\"\\" class=\\"vdr inactive  template-shortUrl\\" style=\\"z-index: auto; top: 39px; left: 107px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 148px; height: 148px;\\"><img data-v-2e45168c=\\"\\" src=\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAAAXNSR0IArs4c6QAAA0tJREFUeF7t3NtuwzAMA9D2/z+6wx7rADkg5C7pwL26kWiKusTu+nw8Hq/HH/69Xufuns/nG5rp51d7n97qL/oSupHlErqRzF9TJfTThKpmpf7TmrjaVw0U3ql/7Xe1f1CoAMqBCEntl9CF0alCSmgJfR+b1pSUQtYU1/NKeSlaeFL/spfujzV0t8MSury5qCmlCkmbmAKc+pe9KnR5tZ2WkK8ndKrYKhQ1JFVYCS2h5wykClGTq0LDplBCwUAVuhwwixApSs9rsG+XXxgooVCoFKn1tKnIntZ3B1T+bncemr76aYMlNDwrKKG4Fv73CpUCputpSqY1WPan+PX85beeuwkroWFJEGFal8Km61XolMH1Du2VvrpsBpCaUxO7ejvPEpqG9PzzJXQvn48SupvQ9euMqkHpmJNecqlL78YneynfvJefHqeV0OE3jNMunCpeitptrwodviikBB4yeHcNFSApWCUita+aLHvCMz4PVUoJYAldX63C/9JQU1MAVDNlvwpdGPp3hCrFpyks+1LwX/sXXs6hNBBeYSgFp4pUAKb+yYe6PA2U0LcYVqFhk6XA1uM7PhACSLuwUnY3vtQe8ZXQ83/WTZve4fgujdi0iex+XvjTjCmhYUlSAMaEskagq6djSbqhqX3tT/b1fHxir4gJ0NXrIkT49HwJxauuBHSoyemtpxwowlevS2HCp+djhcpguq4Ayd7uKWE6BZTQzVc+JbSEvifl7VL+bj8zpJqp9d1zrfwdam4Jff/ZqmmTvPzrjKkC9PkqVAyF67cjNC3y2u90g5oL5V+DuvYr/KyhcqANiIDdGxSe3f7ED69ABFjrirDWFSD5L6HhoP11hKZjxKcVIUVP8SpA9J9eI8thCb3Z/8tTAeHXFVMB6PPEV4VmP/B7e0IJMLzDksLSqUElLJ5Dp0U+JSzdgOZCEaz9pXg4h8rhClgApuvyJwKr0Kb8+XFYmqLTkjFVrPCu+C5PeW24hN7sl8UUMNXUKhRnASJYGaEAMOUFQOspQAFOFZNOBZpq6F9vSiJM6yV0mDJThU2fHytsOKY15ZcIjgNy9TVyWhKmG1aJ0rrwXn6NLIAqAWnTEWFaF94SKgZREg5nE035jFEp9AeeJJP4uq/HiwAAAABJRU5ErkJggg==\\" style=\\"width: 100%;\\"></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-2e45168c=\\"\\" class=\\"vdr inactive  template-belongOrgName\\" style=\\"z-index: auto; top: 248px; left: 128px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-2e45168c=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 所属组织 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-2e45168c=\\"\\" class=\\"vdr inactive  template-cardName\\" style=\\"z-index: auto; top: 189px; left: 125px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-2e45168c=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片名称 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-2e45168c=\\"\\" class=\\"vdr inactive  template-spec\\" style=\\"z-index: auto; top: 208px; left: 128px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-2e45168c=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 规格型号 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-2e45168c=\\"\\" class=\\"vdr inactive  template-productLineName\\" style=\\"z-index: auto; top: 228px; left: 129px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 19px;\\"><p data-v-2e45168c=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 产线名称 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div></div>"}'
	const originContentStringThree =
		'{"checkList":["shortUrl","belongOrgName","cardCode"],"template":"<div data-v-f89c5ede=\\"\\" class=\\"html-template\\" style=\\"width: 8cm; height: 8cm;\\"><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-shortUrl\\" style=\\"z-index: auto; top: 49px; left: 79px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 70px; height: 70px;\\"><img data-v-f89c5ede=\\"\\" src=\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAAAXNSR0IArs4c6QAAA0tJREFUeF7t3NtuwzAMA9D2/z+6wx7rADkg5C7pwL26kWiKusTu+nw8Hq/HH/69Xufuns/nG5rp51d7n97qL/oSupHlErqRzF9TJfTThKpmpf7TmrjaVw0U3ql/7Xe1f1CoAMqBCEntl9CF0alCSmgJfR+b1pSUQtYU1/NKeSlaeFL/spfujzV0t8MSury5qCmlCkmbmAKc+pe9KnR5tZ2WkK8ndKrYKhQ1JFVYCS2h5wykClGTq0LDplBCwUAVuhwwixApSs9rsG+XXxgooVCoFKn1tKnIntZ3B1T+bncemr76aYMlNDwrKKG4Fv73CpUCputpSqY1WPan+PX85beeuwkroWFJEGFal8Km61XolMH1Du2VvrpsBpCaUxO7ejvPEpqG9PzzJXQvn48SupvQ9euMqkHpmJNecqlL78YneynfvJefHqeV0OE3jNMunCpeitptrwodviikBB4yeHcNFSApWCUita+aLHvCMz4PVUoJYAldX63C/9JQU1MAVDNlvwpdGPp3hCrFpyks+1LwX/sXXs6hNBBeYSgFp4pUAKb+yYe6PA2U0LcYVqFhk6XA1uM7PhACSLuwUnY3vtQe8ZXQ83/WTZve4fgujdi0iex+XvjTjCmhYUlSAMaEskagq6djSbqhqX3tT/b1fHxir4gJ0NXrIkT49HwJxauuBHSoyemtpxwowlevS2HCp+djhcpguq4Ayd7uKWE6BZTQzVc+JbSEvifl7VL+bj8zpJqp9d1zrfwdam4Jff/ZqmmTvPzrjKkC9PkqVAyF67cjNC3y2u90g5oL5V+DuvYr/KyhcqANiIDdGxSe3f7ED69ABFjrirDWFSD5L6HhoP11hKZjxKcVIUVP8SpA9J9eI8thCb3Z/8tTAeHXFVMB6PPEV4VmP/B7e0IJMLzDksLSqUElLJ5Dp0U+JSzdgOZCEaz9pXg4h8rhClgApuvyJwKr0Kb8+XFYmqLTkjFVrPCu+C5PeW24hN7sl8UUMNXUKhRnASJYGaEAMOUFQOspQAFOFZNOBZpq6F9vSiJM6yV0mDJThU2fHytsOKY15ZcIjgNy9TVyWhKmG1aJ0rrwXn6NLIAqAWnTEWFaF94SKgZREg5nE035jFEp9AeeJJP4uq/HiwAAAABJRU5ErkJggg==\\" style=\\"width: 100%;\\"></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-belongOrgName\\" style=\\"z-index: auto; top: 43px; left: 160px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-f89c5ede=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 所属组织 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-cardCode\\" style=\\"z-index: auto; top: 93px; left: 166px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-f89c5ede=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片编码 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-c-text1\\" style=\\"z-index: auto; top: 191px; left: 27px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-f89c5ede=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 纯文本1 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-f89c5ede=\\"\\" class=\\"vdr inactive  template-c-text2\\" style=\\"z-index: auto; top: 192px; left: 169px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-f89c5ede=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 纯文本2 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div></div>"}'
	const originContentStringFour =
		'{"checkList":["shortUrl","cardCode","cardName","c-image"],"template":"<div data-v-174f7b4d=\\"\\" class=\\"html-template\\" style=\\"width: 6cm; height: 4cm;\\"><div data-v-174f7b4d=\\"\\" class=\\"vdr inactive  template-shortUrl\\" style=\\"z-index: auto; top: 52px; left: 35px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 70px; height: 70px;\\"><img data-v-174f7b4d=\\"\\" src=\\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAADS0lEQVR4Xu3c227DMAwD0Pb/P7rDHusAOSDkLunAvbqRaIq6xO76fDwer8cf/r1e5+6ez+cbmunnV3uf3uov+hK6keUSupHMX1Ml9NOEqmal/tOauNpXDRTeqX/td7V/UKgAyoEISe2X0IXRqUJKaAl9H5vWlJRC1hTX80p5KVp4Uv+yl+6PNXS3wxK6vLmoKaUKSZuYApz6l70qdHm1nZaQryd0qtgqFDUkVVgJLaHnDKQKUZOrQsOmUELBQBW6HDCLEClKz2uwb5dfGCihUKgUqfW0qcie1ncHVP5udx6avvppgyU0PCsoobgW/vcKlQKm62lKpjVY9qf49fzlt567CSuhYUkQYVqXwqbrVeiUwfUO7ZW+umwGkJpTE7t6O88Smob0/PMldC+fjxK6m9D164yqQemYk15yqUvvxid7Kd+8l58ep5XQ4TeM0y6cKl6K2m2vCh2+KKQEHjJ4dw0VIClYJSK1r5ose8IzPg9VSglgCV1frcL/0lBTUwBUM2W/Cl0Y+neEKsWnKSz7UvBf+xdezqE0EF5hKAWnilQApv7Jh7o8DZTQtxhWoWGTpcDW4zs+EAJIu7BSdje+1B7xldDzf9ZNm97h+C6N2LSJ7H5e+NOMKaFhSVIAxoSyRqCrp2NJuqGpfe1P9vV8fGKviAnQ1esiRPj0fAnFq64EdKjJ6a2nHCjCV69LYcKn52OFymC6rgDJ3u4pYToFlNDNVz4ltIS+J+XtUv5uPzOkmqn13XOt/B1qbgl9/9mqaZO8/OuMqQL0+SpUDIXrtyM0LfLa73SDmgvlX4O69iv8rKFyoA2IgN0bFJ7d/sQPr0AEWOuKsNYVIPkvoeGg/XWEpmPEpxUhRU/xKkD0n14jy2EJvdn/y1MB4dcVUwHo88RXhWY/8Ht7QgkwvMOSwtKpQSUsnkOnRT4lLN2A5kIRrP2leDiHyuEKWACm6/InAqvQpvz5cViaotOSMVWs8K74Lk95bbiE3uyXxRQw1dQqFGcBIlgZoQAw5QVA6ylAAU4Vk04FmmroX29KIkzrJXSYMlOFTZ8fK2w4pjXllwiOA3L1NXJaEqYbVonSuvBefo0sgCoBadMRYVoX3hIqBlESDmcTTfmMUSn0B54kk/i6r8eLAAAAAElFTkSuQmCC\\" style=\\"width: 100%;\\"></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-174f7b4d=\\"\\" class=\\"vdr inactive  template-cardCode\\" style=\\"z-index: auto; top: 58px; left: 90px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-174f7b4d=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片编码 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-174f7b4d=\\"\\" class=\\"vdr inactive  template-cardName\\" style=\\"z-index: auto; top: 96px; left: 92px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 120px; height: 18px;\\"><p data-v-174f7b4d=\\"\\" style=\\"text-align: center; line-height: 1.5em; font-size: 14px;\\"> 卡片名称 </p></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div><div data-v-174f7b4d=\\"\\" class=\\"vdr inactive  template-c-image\\" style=\\"z-index: auto; top: 10px; left: 35px; position: absolute;\\"><div class=\\"content-container\\" style=\\"width: 161px; height: 28px;\\"><img data-v-174f7b4d=\\"\\" src=\\"https://yxvbjkf.obs.cn-east-2.myhuaweicloud.com:443/202206/gongmorukudan/5deaaf2b29134e0995ee70937a4b7f9a.png\\" style=\\"width: 100%; height: 100%;\\"></div> <div class=\\"vdr-stick vdr-stick-tl\\" style=\\"width: 8px; height: 8px; top: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tm\\" style=\\"width: 8px; height: 8px; top: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-tr\\" style=\\"width: 8px; height: 8px; top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-mr\\" style=\\"width: 8px; height: 8px; margin-top: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-br\\" style=\\"width: 8px; height: 8px; bottom: -4px; right: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bm\\" style=\\"width: 8px; height: 8px; bottom: -4px; margin-left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-bl\\" style=\\"width: 8px; height: 8px; bottom: -4px; left: -4px;\\"></div><div class=\\"vdr-stick vdr-stick-ml\\" style=\\"width: 8px; height: 8px; margin-top: -4px; left: -4px;\\"></div></div></div>"}'

	let originContentString = ""
	let originContentString2 = ""
	let originContent = ref<any>({})
	let originContent2 = ref<any>({})
	const printData = ref<(typeof printDataRemote)[0] | null>(null)
	const printData2 = ref<(typeof printDataRemote)[0] | null>(null)

	const setPrint = (num : number) => {
		if (num == 0) {
			originContentString = originContentStringZero
			originContentString2 = originContentStringOne
		}
		if (num == 1) {
			originContentString = originContentStringOne
			originContentString2 = originContentStringTwo
		}
		if (num == 2) {
			originContentString = originContentStringTwo
			originContentString2 = originContentStringThree
		}
		if (num == 3) {
			originContentString = originContentStringThree
			originContentString2 = originContentStringFour
		}
		if (num == 4) {
			originContentString = originContentStringFour
			originContentString2 = originContentStringZero
		}
		originContent.value = JSON.parse(originContentString)
		originContent2.value = JSON.parse(originContentString2)
		printData.value = printDataRemote[num]
		printData2.value = printDataRemote[num + 1]

		return
	}

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
		await logout()
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
		showBottomPopup.value = false
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

	const rightClick = () => {
		uni.showToast({
			title: "右边点击",
			icon: "none"
		})
	}

	const showBottomPopup = ref(false)
	const showCenterPopup = ref(false)

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
		<u-navbar title="个人中心" :fixed="true" placeholder>
			<template #right>
				<view class="link" @click="rightClick">
					默认参数
				</view>
			</template>
		</u-navbar>

		<up-button @click="goNav" type="primary">跳转</up-button>
		<up-button @click="goLogin" type="primary">登录</up-button>
		<up-button @click="goLogout" type="primary">退出</up-button>
		<up-button @click="clearLogin" type="primary">清空登录信息</up-button>
		<up-button @click="showPopup" type="primary">居中显示弹出框</up-button>
		<u-popup :show="showBottomPopup" @close="close" @open="open" mode="bottom">
			<view style="height: 1200rpx">
				<up-button @click="showCenterPopup = true" type="primary">居下显示弹出框</up-button>
			</view>
		</u-popup>
		<u-button @click="showBottomPopup = true" type="primary">下方打开弹出层</u-button>
		<u-popup :show="showCenterPopup" @close="showCenterPopup = false" @open="open" mode="center">
			<view style="height: 600rpx; border: 1px solid #333">
				<text>中间选择列表</text>
			</view>
		</u-popup>
		<view class="content">
			<view class="button-box">
				<button @click="setPrint(0)" type="primary">0号</button>
				<button @click="setPrint(1)" type="primary">1号</button>
				<button @click="setPrint(2)" type="primary">2号</button>
				<button @click="setPrint(3)" type="primary">3号</button>
				<button @click="setPrint(4)" type="primary">4号</button>
				<TempPrinter></TempPrinter>
			</view>
			<view class="print-template-box">
				<view class="print-template" v-show="originContent.template">
					<PrintTemp :tempData="printData" :tempStr="originContent.template"></PrintTemp>
				</view>
			</view>
			<view class="print-template-box">
				<view class="print-template" v-show="originContent.template">
					<PrintTemp :tempData="printData2" :tempStr="originContent2.template"></PrintTemp>
				</view>
			</view>
		</view>
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
					<uni-td class="link" @click="showPopup">{{ item.info }}</uni-td>
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

	.button-box {
		display: flex;

		button {
			font-size: 28rpx;
		}
	}

	.print-template-box {
		display: flex;
		justify-content: space-around;
		margin-top: 12rpx;

		.print-template {
			box-shadow: 0 0 12rpx 6rpx rgba(0, 0, 0, 0.15);
		}
	}
</style>