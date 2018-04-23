<template>
  <router-view :shop="shop">
  </router-view>
</template>
<script>
    export default {
      props: {
        shop: {
          type: Object
        }
      }
    };
</script>

