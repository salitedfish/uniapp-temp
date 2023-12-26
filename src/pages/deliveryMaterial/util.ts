import type { DeliveryDocDetail, OutSrDocDetail } from "@/type/business"

export const deliveryDocVal = async (deliveryDocDetail : DeliveryDocDetail) => {
	for (const editItem of deliveryDocDetail.detailList) {
		if (editItem.planNum > editItem.stockNum) {
			uni.showToast({
				title: "不能大于库存数量",
				icon: "none"
			})
			return Promise.reject()
		}
		if (editItem.planNum < 0) {
			uni.showToast({
				title: "数量必须大于0",
				icon: "none"
			})
			return Promise.reject()
		}
		if (parseInt(editItem.planNum) != editItem.planNum) {
			uni.showToast({
				title: "数量必须为整数",
				icon: "none"
			})
			return Promise.reject()
		}
	}
	return Promise.resolve()
}

export const outSrDocVal = async (outSrDocDetail : OutSrDocDetail) => {
	if (!outSrDocDetail.value.outboundCode) {
		uni.showToast({
			title: "请选择出库类别",
			icon: "none"
		})
		return Promise.reject()
	}
	return Promise.resolve()
}