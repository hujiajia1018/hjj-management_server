<template>
  <div v-loading="isLoading1 || isLoading2" element-loading-text="拼命加载中">
    <div class="warpper">
      <div class="banner_wrapper">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item>{{ tab }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="panel">
        <div class="panel-header">
          <div class="panel-select-group">
            <span class="panel-header__desc">输入桌牌信息</span>
          </div>
        </div>
        <div class="panel-body" style="padding:30px 0">
          <el-row>
            <el-col :span="10" style="padding:80px 12% 0 8%;">
              <el-form label-position="top" label-width="80px" :model="tabelForm" ref="tabelForm" :rules="rules">
                <el-form-item label="区域名称">
                  <el-form-item prop="areaName" style="margin-bottom: 10px">
                    <el-input v-model="tabelForm.areaName" placeholder="例：2楼A区"></el-input>
                  </el-form-item>
                  <div class="explain">此内容展示在桌号之前，选填</div>
                </el-form-item>
                <el-form-item label="桌号范围" prop="startNum">
                  <el-input type="startNum" v-model.number="tabelForm.startNum" placeholder="起始桌号"></el-input>
                </el-form-item>
                <el-form-item label="至">
                  <el-form-item prop="endNum">
                    <el-input v-model.number="tabelForm.endNum" placeholder="结尾桌号"></el-input>
                  </el-form-item>
                  <div class="explain">请填写纯数字，如只需生成一张二维码，则不必填写结尾桌号</div>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" :disabled="createBtnDisabled" @click="submitForm('tabelForm')">生成二维码</el-button>
                  <el-button @click="reset()">重置</el-button>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="14" style="text-align:center;border-left:1px solid #e7eaec;padding:0 60px;">
              <figure v-show="isPreview">
                <img style="width:350px" src="./img/qrcode-demo.png" alt="二维码预览">
                <p>二维码预览</p>
              </figure>
              <div v-show="!isPreview" class="realQrcode">
                <figure id="tablePreview">
                  <canvas width="350" height="455"></canvas>
                  <p>已生成<em>{{tabelNumbers.length}}</em>个桌贴</p>
                  <el-button type="primary" :disabled="downloadTabelBtnDisabled" @click="downloadTabel()">下载桌贴</el-button>
                </figure>
                <figure id="qrcodePreview">
                  <canvas width="350" height="455"></canvas>
                  <p>已生成<em>{{tabelNumbers.length}}</em>个二维码</p>
                  <el-button type="primary" :disabled="downloadQrcodeBtnDisabled" @click="downloadQrcode()">下载二维码</el-button>
                </figure>
              </div>
            </el-col>
          </el-row>
          <img id="bg" src="./img/bg.jpg" alt="点餐桌贴" style="display:none">
          <div id="tableQrcodeContainer" style="display:none"></div>
          <div id="qrcodeContainer" style="display:none"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import config from 'config'
  import qs from 'qs'
  import QRCode from 'qrcode'
  import Store from '../../common/js/store'

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        if (vm.$route.params.hasPublic === 'yes') {
          vm.tab = '生成有公众号桌牌二维码'
        }else {
          vm.tab = '生成无公众号桌牌二维码'
        }
        vm.reset()
      })
    },

    data () {
      return {
        isLoading1: false,
        isLoading2: false,
        hasPublic: false,
        tabelForm: {
          areaName: '',
          startNum: '',
          endNum: ''
        },
        tab: '',
        tabelNumbers: [],
        isPreview: true,
        createBtnDisabled: false,
        downloadTabelBtnDisabled: false,
        downloadQrcodeBtnDisabled: false,
        uid: Store.get('uid'),
        rules: {
          'startNum': [
            {pattern: /^(0|[1-9][0-9]*)$/, message: '桌号必须为数字'}
          ],
          'endNum': [
            {pattern: /^(0|[1-9][0-9]*)$/, message: '桌号必须为数字'}
          ]
        }
      }
    },
    created () {
      if (!this.uid) {
        this.fetchMerchantIds()
      }
      if (this.$route.params.hasPublic === 'yes') {
        this.tab = '生成有公众号桌牌二维码'
        this.fetchPublicInfo()
      }else {
        this.tab = '生成无公众号桌牌二维码'
      }
    },
    methods: {
      reset() {
        this.tabelNumbers = []
        this.$refs['tabelForm'].resetFields()
        this.isPreview = true
        this.createBtnDisabled = false
        this.downloadTabelBtnDisabled = false
        this.downloadQrcodeBtnDisabled = false
        let tableNode = document.getElementById('tableQrcodeContainer')
        while (tableNode.firstChild) {
          tableNode.removeChild(tableNode.firstChild)
        }
        let qrcodeNode = document.getElementById('qrcodeContainer')
        while (qrcodeNode.firstChild) {
          qrcodeNode.removeChild(qrcodeNode.firstChild)
        }
      },
      fetchPublicInfo () {
        this.isLoading1 = true
        axios.post(`${config.host}/wxofficial/setting`)
          .then((res) => {
            let data = res.data
            this.isLoading1 = false
            if (data.respcd === config.code.OK) {
              if (data.data.offical_status === false) {
                this.hasPublic = false
              } else {
                this.hasPublic = true
              }
            } else {
              this.$message.error(data.respmsg)
            }
          })
          .catch(() => {
            this.isLoading1 = false
            this.$message.error('获取公众号信息失败')
          })
      },
      fetchMerchantIds () {
        this.isLoading2 = true
        axios.get(`${config.host}/merchant/ids`)
          .then((res) => {
            this.isLoading2 = false
            let data = res.data
            if (data.respcd === config.code.OK) {
              let uid = data.data.uid
              this.uid = uid
              Store.set('uid', uid)
            } else {
              this.$message.error(data.respmsg)
            }
          })
          .catch(() => {
            this.isLoading2 = false
            this.$message.error('获取商户id失败')
          })
      },
      fetchWxofficialQrcode (startNum, endNum, length) {
        this.isLoading = true
        if (this.hasPublic === false) {
          this.$message.error('您还没有绑定微信公众号，请到公众号授权页面绑定公众号!')
          return
        }
        axios.post(`${config.host}/wxofficial/qrcode`, qs.stringify({
          start_num: startNum,
          end_num: endNum
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
            let data = res.data
            if (data.respcd === config.code.OK) {
              let qrcodeUrlList = data.data.qrcode_list
              for (let i = 0; i < length + 1; i++) {
                this.tabelNumbers[i] = i === 0 ? startNum : this.tabelNumbers[i - 1] + 1
                this.urlToQrcode(this.tabelNumbers[i], qrcodeUrlList[i].qrcode)
              }
              this.isPreview = false
            } else {
              this.$message.error(data.respmsg)
            }
            this.isLoading = false
          })
          .catch(() => {
            this.isLoading = false
            this.$message.error('获取商户id失败')
          })
      },
      submitForm (formName) {
        this.createBtnDisabled = true
        let startNum = this.tabelForm.startNum
        let endNum = this.tabelForm.endNum
        let length = endNum ? endNum - startNum : 0 // 桌号数组长度
        if (!this.tabelForm.areaName && !startNum) {
          this.$message('区域名称、桌号 不能都为空')
          this.createBtnDisabled = false
          return false
        } else if (endNum && startNum > endNum) {
          this.$message('起始桌号必须小于结尾桌号')
          this.createBtnDisabled = false
          return false
        } else if (length > 49) {
          this.$message('单次最多生成50个二维码')
          this.createBtnDisabled = false
          return false
        }
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.$route.params.hasPublic === 'no') {
              for (let i = 0; i < length + 1; i++) {
                this.tabelNumbers[i] = i === 0 ? startNum : this.tabelNumbers[i - 1] + 1
                this.urlToQrcode(this.tabelNumbers[i])
              }
              this.isPreview = false
            } else {
              this.fetchWxofficialQrcode(startNum, endNum, length)
            }
          } else {
            this.createBtnDisabled = false
            return false
          }
        })
      },
      qrcodeText (areaName, tableNumber) {
        let qrcodeText = ''
        if (areaName) {
          qrcodeText = tableNumber ? `${areaName} ${tableNumber}` : `${areaName}`
        } else {
          qrcodeText = `${tableNumber}`
        }
        return qrcodeText
      },
      drawPreviewCanvas (qrcode, hasFrame, tableNumber) {
        let domName = hasFrame ? 'tablePreview' : 'qrcodePreview'
        let canvas = document.getElementById(domName).firstElementChild
        let ctx = canvas.getContext('2d')
        canvas.width = qrcode.width
        canvas.height = qrcode.height + 50
        ctx.rect(0, 0, qrcode.width, qrcode.height + 50)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.fillStyle = '#fe9b20'
        ctx.font = 'bold 22px 黑体'
        ctx.textAlign = 'center'
        let text = this.qrcodeText(this.tabelForm.areaName, tableNumber)
        ctx.fillText(text, qrcode.width / 2, qrcode.height + 30)

        let qrcodeCtx = qrcode.getContext("2d")
        let imgData = qrcodeCtx.getImageData(0, 0, qrcode.width, qrcode.height)
        ctx.putImageData(imgData, 0, 0)
      },
      urlToQrcode (tableNumber, qrcodeUrl) {
        let text = this.qrcodeText(this.tabelForm.areaName, tableNumber)
        let _qrcodeUrl = !qrcodeUrl ? `${config.ohost}/dc/?/#/merchant/${this.uid}/${text}` : qrcodeUrl
        let qrcode = document.createElement('canvas')
        QRCode.toCanvas(qrcode, _qrcodeUrl, {scale: 8, margin: 0}, function (err) {
          if (err) throw err
        })
        this.drawTableCanvas(qrcode, tableNumber)
        this.drawQrcodeCanvas(qrcode, tableNumber)
        if (tableNumber === this.tabelForm.startNum) {
          this.drawPreviewCanvas(qrcode, true, tableNumber)
          this.drawPreviewCanvas(qrcode, false, tableNumber)
        }
      },
      // 绘制第一张真实桌牌
      drawTableCanvas (qrcode, tableNumber) {
        let canvas = document.createElement('canvas')
        canvas.setAttribute('name', tableNumber)
        let ctx = canvas.getContext('2d')
        canvas.width = 460
        canvas.height = 620
        ctx.rect(0, 0, canvas.width, canvas.height)
        ctx.fill()

        let bg = document.getElementById('bg')
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

        ctx.fillStyle = '#fe9b20'
        ctx.font = 'bold 22px 黑体'
        ctx.textAlign = 'center'
        let text = this.tabelForm.areaName ? `${this.tabelForm.areaName} ${tableNumber}` : `${tableNumber}`
        ctx.fillText(text, 228, 460)

        let qrcodeCtx = qrcode.getContext('2d')
        let imgData = qrcodeCtx.getImageData(0, 0, qrcode.width, qrcode.height)
        ctx.putImageData(imgData, 97, 162)

        document.getElementById('tableQrcodeContainer').append(canvas)
      },
      drawQrcodeCanvas (qrcode, tableNumber) {
        let canvas = document.createElement('canvas')
        canvas.setAttribute('name', tableNumber)
        let ctx = canvas.getContext('2d')
        canvas.width = qrcode.width
        canvas.height = qrcode.height + 50
        ctx.rect(0, 0, qrcode.width, qrcode.height + 50)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        ctx.fillStyle = '#fe9b20'
        ctx.font = 'bold 22px 黑体'
        ctx.textAlign = 'center'
        let text = this.tabelForm.areaName ? `${this.tabelForm.areaName} ${tableNumber}` : `${tableNumber}`
        ctx.fillText(text, qrcode.width / 2, qrcode.height + 30)

        let qrcodeCtx = qrcode.getContext('2d')
        let imgData = qrcodeCtx.getImageData(0, 0, qrcode.width, qrcode.height)
        ctx.putImageData(imgData, 0, 0)

        document.getElementById('qrcodeContainer').append(canvas)
      },
      downloadFile(fileName, canvas) {
        let a = document.createElement('a')
        a.setAttribute('download', fileName)
        a.setAttribute('href', canvas.toDataURL())
        a.click()
      },
      downloadTabel () {
        this.downloadTabelBtnDisabled = true
        let tables = document.getElementById('tableQrcodeContainer').childNodes
        for (let i = 0; i < tables.length; i++) {
          this.downloadFile(tables[i].getAttribute('name'), tables[i])
        }
      },
      downloadQrcode (e) {
        this.downloadQrcodeBtnDisabled = true
        let qrcodes = document.getElementById('qrcodeContainer').childNodes
        for (let i = 0; i < qrcodes.length; i++) {
          this.downloadFile(qrcodes[i].getAttribute('name'), qrcodes[i])
        }
      }
    }
  };
</script>

<style scoped lang="scss">
  .el-form-item {
    margin-bottom: 22px;
  }

  .el-form-item__label {
    font-size: 20px;
    color: #262424;
  }

  .explain {
    color: #98989e;
    line-height: 20px;
    font-size: 15px;
  }

  .realQrcode {
    figure {
      width: 45%;
      display: inline-block;
    }
    canvas {
      width: 52%;
      margin-top: 28%;
      border: 3px solid #f2932f;
      border-radius: 6px;
      padding: 10px 10px 0;
    }
    p {
      margin: 32% 0 20px;;
    }
    em {
      color: #fe9b20;
      margin: 0 8px;
    }
  }
  #tablePreview {
    background: url('./img/qr-1.jpg') no-repeat;
    background-size: 100% auto;
  }
  #qrcodePreview {
    background: url('./img/qr-2.jpg') no-repeat;
    background-size: 100% auto;
  }
</style>
