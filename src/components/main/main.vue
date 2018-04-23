<template>
  <div class="top_content" v-loading.fullscreen="loading" element-loading-text="拼命加载中">
    <sidebar :shop="shop"></sidebar>
    <div class="main" :style="origin=='yirui'?'padding-left: 0':'padding-left: 220px'">
      <div class="header">
        <ul class="nav-yirui" :style="origin=='yirui'?'visibility:visible':'visibility:hidden'">
          <li class="nav-yirui-item">
            <router-link class="" :to="router('main/memberctl')">
              会员管理
            </router-link>
          </li>
          <li class="nav-yirui-item">
            <router-link class="" :to="router('main/memberredpoint')">
              会员集点
            </router-link>
          </li>
          <li class="nav-yirui-item">
            <router-link class="" :to="router('main/memberredpacket')">
              会员红包
            </router-link>
          </li>
          <li class="nav-yirui-item">
            <router-link class="" :to="router('main/memberstorage')">
              会员储值
            </router-link>
          </li>
        </ul>
        <div class="user_wrapper" :style="origin=='yirui'?'display:none':'display:-webkit-flex'">
          <div class="user_name">
            {{ role.isCashier?`Welcome,${(shop.opinfo || {}).opname}(${(shop.opinfo || {}).opuid})`:'Welcome'}}
          </div>
          <a href="javascript:;" @click="logout">
            <div class="user_operation">
              <i class="icon-ic_logout"></i>
              <span class="text">退出</span>
            </div>
          </a>
        </div>
      </div>
      <router-view :shop="shop"></router-view>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import config from '../../config';
import { getRole } from '../../common/js/util';
import Store from '../../common/js/store';
import sidebar from '../../components/sidebar/sidebar.vue';

export default {
  data() {
    return {
      origin: localStorage.getItem('origin'),
      role: Store.get('role') || {},
      loading: false,
      shop: {}
    };
  },
  components: {
    sidebar
  },
  created() {
    this.getData();
  },
  methods: {
    router(router) {
      return `/${router}`;
    },
    // 退出登录
    logout() {
      this.loading = true;
      axios.get(`${config.host}/merchant/signout`)
      .then((res) => {
        let data = res.data;
        this.loading = false;
        if (data.respcd === config.code.OK) {
          // 登出时删除本域cookie
          (new Image()).src = `${config.ohost}/mchnt/set_cookie?sessionid=`;
          Store.set('flag', true);
          localStorage.removeItem('hashid');
          localStorage.removeItem('uid');

          var toRemoved = document.getElementById('unique_map');
          if(toRemoved) {
            toRemoved.onload = null;
            document.body.removeChild(toRemoved);
          }
          this.$router.push(`/login?from=logout`);

        } else {
          this.$message.error(data.respmsg);
        }
      }).catch(() => {
        this.loading = false;
        this.$message.error('网络错误');
      });
    },

    getData() {
      this.loading = true;
      axios.get(`${config.host}/merchant/info?format=cors`)
        .then((res) => {
          this.loading = false;
          let data = res.data;
          if(data.respcd === config.code.OK) {
            // 本地调试或者刷新页面时设置role
            let val = getRole(data.data);
            Store.set('role', val);

            this.$store.dispatch('getShopList');
            this.$store.dispatch('getMemberTotal');

            this.shop = data.data || {};

          } else {
            this.$message.error(data.respmsg);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$message.error('网络错误');
          // console.log(err && err.respmsg)
        });
    }

  }
};
</script>

<style lang="scss">
  .responsive_img {
    max-width: 100%;
    height: auto;
  }
  .main {
    padding-left: 220px;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    @at-root .header {
      display: flex;
      height: 50px;
      background-color: #FE9B20;
      justify-content: space-between;
      align-items: center;
      color: #fff;
    }
    @at-root .user_wrapper {
      display: flex;
      align-items: center;
      @at-root .user-img__wrapper {
        width: 35px;
        height: 35px;
        background-color: #ccc;
        border-radius: 50%;
        margin-right: 14px;
      }
      @at-root .user_name {
        margin-right: 20px;
      }
      @at-root .user_operation {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #F39118;
        padding: 0 20px;
        height: 50px;
        cursor: pointer;
        transition: .3s cubic-bezier(.645,.045,.355,1);
        &:hover {
          box-shadow: -3px 3px 5px rgba(0, 0, 0, 0.12);
        }
        .icon-ic_logout {
          font-size: 22px;
          margin-right: 10px;
        }
      }
    }
  }

  .top_content {
    height: 100%;
  }
  .nav-yirui {
    flex:1;
    -webkit-flex:1;
    height:50px;
    display:flex;
    display:-webkit-flex;
    .nav-yirui-item {
      flex:1;
      -webkit-flex:1;
      justify-content: center;
      align-items: center;
      display:-webkit-flex;
      display:flex;
    }
  }
</style>
