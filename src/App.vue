<template>
  <router-view />
</template>
<script>
  import config from 'src/config';
  export default {
    created() {
      document.title = '商户管理后台';
    },
    mounted() {
      var _this = this;
      window.onmessage = function(e) {
        var msg = e.data;
        if(msg && msg.origin === 'yirui') {
          let bicon = new Image();
          bicon.src = `${config.ohost}/mchnt/set_cookie?sessionid=${msg.session_id}`;
          localStorage.setItem('origin', 'yirui');
          _this.$router.push('/main/memberctl');
        }
      }
    }
  }
</script>
