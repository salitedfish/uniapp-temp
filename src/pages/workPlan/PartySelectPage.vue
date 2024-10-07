<template>
  <select-page
    :data="getList"
    :tb-columns="columns"
    :width="400"
    multiple
    search-field="condition"
    :params="{}"
    v-bind="$attrs"
    v-on="$listeners"
  >
  </select-page>
</template>
<script>
import sharedCourtApi from "@/api/sharedCourtApi";

export default {
  name: "PartySelectPage",
  data() {
    return {
      columns: [
        { title: "序号", data: "$index" },
        { title: "姓名", data: "name" },
        { title: "身份证", data: "cardNo" },
        { title: "联系电话", data: "phone" },
      ]
    };
  },
  methods: {
    getList(params) {
      return sharedCourtApi.partyList(params);
    }
  }
};
</script>
