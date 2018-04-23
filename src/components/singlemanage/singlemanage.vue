<template>
  <div class="single">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>账户信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group panel-select-group__justify">
          <span class="panel-header__desc">基本信息</span>
        </div>
      </div>
      <div class="panel-body" v-if="!role.isCashier">
        <div class="info_wrapper">
          <div class="info">
            <div class="info__title">登录账号</div>
            <div class="info__desc">{{ shop.mobile }}</div>
          </div>
          <div class="info">
            <div class="info__title">店铺名称</div>
            <div class="info__desc">{{ shop.shopname }}</div>
          </div>
          <div class="info">
            <div class="info__title">地址</div>
            <div class="info__desc">{{ shop.address }}</div>
          </div>
          <div>
            <div class="info">
              <div class="info__title">手机号</div>
              <div class="info__desc">{{ shop.telephone || '无' }}</div>
            </div>
            <div class="info">
              <div class="info__title">持卡人</div>
              <div class="info__desc">{{ shop.bankuser }}</div>
            </div>
            <div class="info">
              <div class="info__title">银行账户</div>
              <div class="info__desc">{{ shop.bankaccount }} </div>
            </div>
            <div class="info">
              <div class="info__title" >银行名称</div>
              <div class="info__desc">{{ shop.bankname }}</div>
            </div>
          </div>
          <div class="panel-btn-group__wrapper">
            <a :href="downHref" download>
              <div class="panel-btn__download panel-btn__download_detail">
                <i class="icon-download"></i>
                <span>下载店铺收款码</span>
              </div>
            </a>
            <div class="panel-btn__download panel-btn__download_record" @click="changePass(shop.mobile)">修改密码</div>
          </div>
        </div>
      </div>
      <div class="panel-body" v-else>
        <div class="info_wrapper">
          <div class="info">
            <div class="info__title">账户状态</div>
            <div class="info__desc">{{ opinfo.status? '启用账户' : '禁用账户' }}</div>
          </div>
          <div class="info">
            <div class="info__title">姓名</div>
            <div class="info__desc">{{ opinfo.opname }}</div>
          </div>
          <div class="info">
            <div class="info__title">电话</div>
            <div class="info__desc">{{ opinfo.mobile }}</div>
          </div>
          <div class="info">
            <div class="info__title">门店</div>
            <div class="info__desc">{{ shop.shopname }}</div>
          </div>
          <div class="info">
            <div class="info__title">主账号</div>
            <div class="info__desc">{{ shop.mobile }}</div>
          </div>
          <div class="info next-bottom">
            <div class="info__title">收银员编号</div>
            <div class="info__desc">{{ opinfo.opuid }}</div>
          </div>
          <div class="info">
            <div class="info__title"></div>
            <div class="gray-explain">* 收银员登陆方式为主账号+收银员编号+收银员密码</div>
          </div>
          <div class="info next-bottom">
            <div class="info__title">退款权限</div>
            <div class="info__desc">{{ opinfo.refund?'有权限': '无权限'}}</div>
          </div>
          <div class="info">
            <div class="info__title"></div>
            <div class="gray-explain">* 目前收银员仅支持查看活动信息，不支持对红包、集点、储值活动、特卖、店铺公告、会员特权的增删改</div>
          </div>
          <div class="panel-btn-group__wrapper">
            <a :href="downHref" download>
              <div class="panel-header-btn panel-header-btn__fill">
                <i class="icon-download"></i>
                <span>下载收款二维码</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="修改密码" :visible.sync="showChangePass" @close="handleClose" custom-class="mydialog" top="20%" :show-close="false">
      <el-form :model="form" :rules="formrules" ref="form" label-width="80px">
        <el-form-item label="登录账号">
          <div>{{ userName }}</div>
        </el-form-item>
        <el-form-item label="输入新密码" prop="pass">
          <el-input v-model="form.pass" size="small" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="repass">
          <el-input v-model="form.repass" size="small" type="password" placeholder="请输入确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="showChangePass = false" class="cancel">取消</div>
        <div @click="submit" class="submit">
          <span class="el-icon-loading" v-if="iconShow"></span>
          <span v-else>确定</span>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import ElButton from "../../../node_modules/qfpay-element-ui/packages/button/src/button";
  import Store from '../../common/js/store';
  import axios from 'axios';
  import config from 'config';

  export default {
    components: {ElButton},
    data() {
      let passValid = (rule, val, cb) => {
        if(val === '') {
          cb('请输入新密码');
        } else {
          if(this.form.repass !== '') {
            this.$refs['form'].validateField('repass');
          }
          cb();
        }
      };

      let repassValid = (rule, val, cb) => {
        if(val === '') {
          cb('请输入确认新密码');
        } else if(this.form.pass && this.form.pass !== val) {
          cb('新密码与确认密码不一致');
        } else {
          console.log(val);
          cb();
        }
      };
      return {
        role: Store.get('role') || {},
        loading: false,
        iconShow: false,
        showChangePass: false,
        userName: '',
        form: {
          pass: '',
          repass: ''
        },
        formrules: {
          pass: [
            { validator: passValid },
            {max: 20, min: 6, message: '请输入6~20位数字或字母', trigger: 'blur'}
          ],
          repass: [
            { validator: repassValid },
            {max: 20, min: 6, message: '请输入6~20位数字或字母', trigger: 'blur'}
          ]
        }
      };
    },

    computed: {
      downHref() {
        if(this.role.isCashier) {
          return `${config.host}/merchant/qrcode?userid=${this.shop.uid}&opuid=${this.opuid}`;
        }else {
          return `${config.host}/merchant/qrcode?userid=${this.shop.uid}&lang=zh-CN`;
        }
      },
      opinfo() {
        return this.shop.opinfo || {}
      }
    },

    props: {
      shop: {
        type: Object
      }
    },

    methods: {
      changePass(name) {
        this.userName = name;
        this.showChangePass = true;
      },

      // 退出登录
      logout() {
        axios.get(`${config.host}/merchant/signout`)
          .then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              // 登出时删除.qfpay.com域下cookie
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
          this.$message.error('网络错误');
        });
      },

      // 修改密码提交
      submit() {
        this.$refs['form'].validate((valid) => {
          if(!this.iconShow && valid) {
            this.iconShow = true;

            axios.post(`${config.ohost}/mchnt/user/reset_pwd`, {
              mobile: this.shop.mobile,
              password: this.form.pass,
              mode: 'change',
              username: this.userName,
              src: 'mchnt',
              format: 'cors'
            }).then((res) => {
              let data = res.data;
              if (data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '修改成功'
                });
                this.showChangePass = false;
                this.logout();

              } else {
                this.$message.error(data.respmsg);
              }
              this.iconShow = false;
            }).catch(() => {
              this.iconShow = false;
              this.$message.error('网络错误');
            });
          }
        });
      },

      // 关闭弹出层,清除表单
      handleClose() {
        this.$refs['form'].resetFields();
      }

    }
  };
</script>

<style lang="scss">
  .panel-header__desc {
    font-size: 18px;
    color: #FE9B20;
  }

  .panel-header__fix {
    padding-right: 15px;
  }

  .panel-select-group__justify {
    justify-content: space-between;
  }


  .info_wrapper {
    padding: 30px 0px 30px 30px;
  @at-root .info {
    display: flex;
    height: 28px;
    -webkit-align-items: center;
    align-items: center;
    margin-bottom: 18px;
    @at-root .info__title {
      font-size: 16px;
      color: #8A8C92;
      width: 100px;
      margin-right: 25px;
      text-align: left;
    }
    @at-root .info__sign {
      margin: 0px 15px 0px 10px;
    }
    @at-root .info__desc {
      font-size: 15px;
      color: #1F2D3D;
    }
  }
  }
  .table_placeholder {
    height: 50px;
  }

  .single {
    .panel-header-btn {
      width: 210px;
    }
    .next-bottom {
      margin: 0;
    }
    .gray-explain {
      margin: 0;
      line-height: 1.4;
    }
  }
</style>
