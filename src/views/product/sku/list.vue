<template>
  <div>SkuList</div>
</template>

<script>
export default {
  name: "SkuList",
  mounted() {
    const result = this.$API.sku.getList(1, 3, 61);
    console.log("sku---", result);
  }
};
</script>
