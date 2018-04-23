<template>
  <div class="clound" v-loading="loading">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item>会员积分</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__auto">
        <div class="title">会员积分三大优势</div>
        <div class="content">
          <div>
            <img src="./img/clound1.png">
            <div class="text">
              <div class="step">1</div>
              <div class="plain">到店消费领积分，有效增加回头客</div>
            </div>
          </div>
          <div>
            <img src="./img/clound2.png">
            <div class="text">
              <div class="step">2</div>
              <div class="plain">积分兑换店内商品，最少成本做营销</div>
            </div>
          </div>
          <div>
            <img src="./img/clound3.png">
            <div class="text">
              <div class="step">3</div>
              <div class="plain">线上积分商城，实现个性化积分兑换</div>
            </div>
          </div>
        </div>
      </div>
      <div class="form-submit_wrapper">
        <a class="panel-btn__download panel-btn__download_detail" :href="linkUrl" @click="getUrl" target="_blank">
          <span>立即使用</span>
        </a>
        <a class="cancel" href="http://qmm.la/xVk0Fx" target="_blank">了解更多</a>
      </div>

    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  import config from 'config';

  export default {
    data() {
      return {
        loading: false,
        linkUrl: 'javascript:;'
      }
    },
    created() {
      this.getUrl();
    },

    methods: {
      getUrl() {
        this.loading = true;
        axios.get(`${config.host}/merchant/rediect_url`).then((res) => {
          this.loading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.linkUrl = (data.data || {}).url;
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('请求失败!');
        });
      }
    }
  };
</script>
<style lang="scss">
  .clound {
    .title {
      color: #FE9B20;
      font-size: 16px;
      text-align: center;
      margin: 10px 0;
    }
    .content {
      display: flex;
      padding: 20px;
      justify-content: center;
      & > div {
        padding: 10px 50px;
      }
      img {
        width: 150px;
      }
      .text {
        display: flex;
        width: 170px;
      }
      .step {
        font-size: 40px;
        width: 20px;
        margin-right: 5px;
        color: #FE9B20;
      }
      .plain {
        flex: 1;
        line-height: 1.2;
      }
    }
    .form-submit_wrapper {
      justify-content: center;

      .panel-btn__download:first-child {
        margin-left: 140px;
      }
    }
  }
</style>
