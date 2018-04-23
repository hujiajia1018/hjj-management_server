<template>
  <div>
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>授权管理</el-breadcrumb-item>
        <el-breadcrumb-item>支付宝授权</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">授权信息</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="info_wrapper">
          <div class="info">
            <div class="info__title">商户简称</div>
            <div class="info__desc">{{shop.name}}</div>
            <div class="authorizeSucText" v-if="haveAuthorize">授权成功</div>
          </div>
          <div class="info">
            <div class="info__title">支付宝账号</div>
            <div class="info__desc">
            <el-button size="primary" @click="haveAuthorize ? showrelieveView(): showQrcode()" :class="haveAuthorize ? 'relieve-btn' : 'authorize-btn'" >{{haveAuthorize ? '解除授权' : '授权绑定'}}</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">常见问题</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="info_wrapper">
          <p class="info_text_title">如何查看支付宝账号是否有签约支付宝2.0？</p>
          <div class="question">
            <p><span>pc端：</span>点击登陆支付宝，查看我的签约产品</p>
            <p><span>手机号客户端：</span>打开手机支付宝客户端＞朋友＞生活号，搜索“蚂蚁金服商家平台”，点击服务指引＞签约当面付，查看是否已完成签约。</p>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="showAuthorize" custom-class="mydialog" top="10%" :show-close="true">
      <div class="text-tip">
        <p>请打开手机端<span>支付宝扫一扫</span></p>
        <p>扫描二维码完成授权操作</p>
        <div id="arrows-down"></div>
      </div>
      <div slot="footer" class="detail_footer">
        <div id="qrcodeContainer"></div>
        <div class="success-btn" @click="checkRequest()"><div>支付宝提示已绑定成功，点这里</div></div>
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="showReviseConfirm"  top="20%" custom-class="mydialog" :show-close="false">
      <span class="tip-text">是否确认解除授权？</span>
      <span slot="footer" class="dialog-footer dialog-center">
        <el-button @click="showReviseConfirm = false" class="dialog-btn">取 消</el-button>
        <el-button type="primary" @click="relieveBound" class="dialog-btn green-btn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
import config from 'config'
import qs from 'qs';
import QRCode from 'qrcodejs2'

export default {
  data () {
    return {
      showReviseConfirm: false,
      showAuthorize: false,
      authorizeUrl: '',
      haveAuthorize: true,
      pressBtn: false
    }
  },
  watch: {
     'showAuthorize': function (val, oldval) {
       if (oldval && !this.pressBtn) {
        this.checkRequest()
       }
     }
  },
  props: {
    shop: {
      type: Object
    }
  },
  created () {
    this.judgeAuthorize()
  },
  mounted () {
    var door = document.getElementsByClassName('el-dialog__headerbtn')[0]
    door.style.backgroundColor = 'rgba(0, 0, 0, 0)' // 去除火狐浏览器下关闭dailog按钮灰色背景
    door.style.cursor = 'pointer'
  },
  methods: {
    showQrcode () {
      this.showAuthorize = true
    },
    showrelieveView () {
      this.showReviseConfirm = true
    },
    relieveBound () {
      let parmas = {
        mode: 'deauth',
      }
      axios.post(`${config.host}/merchant/koubei/bind`, qs.stringify(parmas)).then((res) => {
        let data = res.data;
        if(data.respcd === config.code.OK) {
          this.$message({
            type: 'success',
            message: '解绑成功'
          })
          this.showReviseConfirm = false
          this.haveAuthorize = false
          this.getAuthorizeUrl()
        } else {
          this.$message.error(data.resperr);
        }
      })
    },
    getAuthorizeUrl () {
      axios.get(`${config.host}/merchant/koubei/auth_url`, {
        params: {
          format: 'cors'
        }
      }).then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          this.authorizeUrl = data.data.url
          this.qrcode()
        } else {
          this.$message.error(data.respmsg)
        }
      }).catch(() => {
        this.$message.error(this.$t('common.netError'))
      });
    },
    qrcode () {
      let _qrcodeUrl = this.authorizeUrl
      let qrcode = new QRCode('qrcodeContainer', {
        width: 220,
        height: 220,
        text: _qrcodeUrl // 二维码内容
      })
      console.log(qrcode)
      document.getElementById('qrcodeContainer').removeAttribute("title")
    },
    checkRequest () {
      this.pressBtn = true
      this.showAuthorize = false
      axios.get(`${config.host}/merchant/koubei/is_auth`, {
        params: {
          format: 'cors'
        }
      }).then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          if (data.data.is_auth) {
            this.$message({
              type: 'success',
              message: '授权成功'
            })
            this.haveAuthorize = true
          } else {
            this.$message.error('授权失败，请重新扫码授权')
          }
        } else {
          this.$message.error(data.respmsg)
        }
        this.pressBtn = false
      }).catch(() => {
        this.$message.error(this.$t('common.netError'))
      });
    },
    judgeAuthorize () {
      axios.get(`${config.host}/merchant/koubei/is_auth`, {
        params: {
          format: 'cors'
        }
      }).then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          if (data.data.is_auth) { // 已经授权成功了
            this.haveAuthorize = true
          } else {
            this.haveAuthorize = false
            this.getAuthorizeUrl()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.qrcode-view {
  width: 300px;
  height: 300px;
  margin: 0 auto;
}
.check-request {
  width: 320px;
  text-align: center;
  height: 40px;
  line-height: 40px;
  color: #fff;
  background-color: #FE9B20;
  border-radius: 5px;
  margin: 20px auto 0 auto;
}
.info .info__title {
  color: #262424;
}
.info .info__desc {
  color: #8A8C92;
}
.authorizeSucText {
  color: #FE9B20;
  padding-left: 30px;
}
.authorize-btn {
  width: 192px;
}
.relieve-btn {
  width: 192px;
  background-color: #ffc273;
  border-color: #ffc273;
}
.info_text_title {
  font-size: 20px;
  font-family:PingFangSC-Medium;
}
.info_wrapper .question {
  margin-top: 15px;
  padding-bottom: 20px;
}
.info_wrapper .question p{
  font-size: 16px;
  color: #777A7D;
  height: 27px;
  line-height: 27px;
}
.info_wrapper .question p span {
  color: #000;
}
.text-tip {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
  color: #000;
}
.text-tip p:first-child {
  font-size: 25px;
}
.text-tip p:first-child span {
  color: #2196F3;
}
.text-tip p:nth-child(2) {
  width: 100%;
  text-align: center;
  font-size: 18px;
  padding-top: 15px;
}
.success-btn {
  padding-top: 20px;
  border-top: 1px solid #E8E7E6;
  display: flex;
  justify-content: center;
  margin-top: 50px;
  cursor: pointer;
}
.success-btn > div {
  width: 300px;
  height: 40px;
  background-color: #FE9B20;
  color: #fff;
  text-align: center;
  line-height: 40px;
  border-radius: 3px;
}
#arrows-down {
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 18px solid #FE9B20;
  margin-top: 16px;
}
#qrcodeContainer {
  width: 260px;
  height: 260px;
  margin: 0 auto;
  border: 2px solid #FE9B20;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}
.el-dialog__headerbtn {
  border: 1px solid red!important;
}

.tip-text {
  display: inline-block;
  width: 100%;
  text-align: center;
  font-size: 16px;
  padding: 0 0 5px;
}
.dialog-center {
  .dialog-btn {
    width: 100px;
    margin-left: 20px;
    font-size: 15px;
  }
  .green-btn {
    background-color: #7ED321;
    border-color: #7ED321;
    &:hover {
      background-color: #64A61A;
      border-color: #64A61A;
    }
  }
}
</style>
