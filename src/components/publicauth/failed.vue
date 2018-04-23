<template>
  <div class="warpper">
    <div class="banner_wrapper">
      <img src="./img/warning.png" alt="警告提示">
      <div>
        <h2>授权失败</h2>
        <p>仅支持认证的服务号授权，请检查您的公众号类型</p>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">绑定微信公众号</span>
        </div>
      </div>
      <div class="panel-body" style="padding-bottom:25px">
        <ul class="steps">
          <li>
            <strong><span>Step</span>1</strong>
            <img src="./img/step1_valid_error.jpg" alt="step1">
            <p>检查公众号是否认证<br/>公众号名片是否有认证的标志</p>
          </li>
          <li>
            <strong><span>Step</span>2</strong>
            <img src="./img/step2_valid_error.jpg" alt="step1">
            <p>检查公众号是否服务号<br/>只有出现在微信首页的是服务号<br/>被折叠在订阅号里的不是</p>
          </li>
        </ul>
        <button @click="goWechatAuth" :disabled="isDisabled" class="el-button el-button--primary btn-add" type="button">
          重新添加微信公众号
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import config from 'config'

  export default {
    data() {
      return {
        uid: '',
        isDisabled: 'disabled'
      }
    },
    created() {
      this.fetchMerchantIds()
    },
    methods: {
      fetchMerchantIds () {
        axios.get(`${config.host}/merchant/ids`)
          .then((res) => {
            let data = res.data
            if (data.respcd === config.code.OK) {
              this.uid = data.data.uid
              this.isDisabled = false
            } else {
              this.$message.error(data.respmsg)
            }
          })
          .catch(() => {
            this.$message.error('获取商户id信息失败')
          })
      },
      goWechatAuth () {
        let tempPage = process.env.NODE_ENV === 'production' ? 'https://wxmp.qfpay.com' : 'https://wxmp.qa.qfpay.net'
        let origin = window.location.origin
        window.location.href = `${tempPage}/v1/wxthird/auth_url?userid=${this.uid}&redirect_url=${origin}/redirect/main/publicauth`
      }
    }
  }
</script>

<style scoped lang="scss">
  .banner_wrapper {
    height: auto;
    padding: 20px 25px 25px;
    justify-content: center;
    img {
      width: 56px;
      vertical-align: text-bottom;
      margin-right: 16px;
    }
    h2 {
      line-height: 40px;
      color: #fe3824;
      font-size: 24px;
    }
  }
  .steps {
    text-align: center;
    li {
      padding-top: 30px;
      text-align: left;
      display: inline-block;
      vertical-align: top;
      width: 25%;
      &:first-child {
        margin-right: 10%;
      }
      box-sizing: border-box;
      strong {
        font-size: 34px;
        span {
          margin-right: 6px;
          color: #a7a9ae;
          font-size: 17px;
        }
      }
      img {
        width: 100%;
        margin: 20px 0;
        vertical-align: bottom;
      }
      p {
        font-size: 14px;
        line-height: 1.5;
      }
    }
  }
  .btn-add {
    display: block;
    width: 369px;
    height: 60px;
    margin: 64px auto 0 auto;
    font-size: 20px;
    &:disabled {
      background-color: #A7A9AE;
      cursor: default;
      border: none;
    }
  }
</style>
