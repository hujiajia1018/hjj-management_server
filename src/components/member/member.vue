<template>
  <div>
      <keep-alive>
        <router-view :shop="shop"></router-view>
      </keep-alive>
  </div>
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
