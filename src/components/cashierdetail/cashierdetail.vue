<template>
  <div class="cashierdetail" v-loading="loading">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="first" :to="{ path: '/main/cashiermanage' }" replace>收银员管理</el-breadcrumb-item>
        <el-breadcrumb-item>查看详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group panel-select-group__justify">
          <span class="panel-header__desc">收银员资料</span>
        </div>
      </div>
      <div class="panel-body" >
        <div class="info_wrapper">
          <div class="info">
            <div class="info__title">账户状态</div>
            <div class="info__desc">
              <el-switch v-model="opinfo.status" on-text="" off-text="" on-color="#FF8100" off-color="#d8d8d8" on-value=1 off-value=0 @change="changeStatus"></el-switch>
            </div>
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
          <div class="info">
            <div class="info__title">收银员编号</div>
            <div class="info__desc">{{ opinfo.opuid }}</div>
          </div>
          <div class="info next-bottom">
            <div class="info__title">收银员密码</div>
            <div class="info__desc">******</div>
          </div>
          <div class="info">
            <div class="info__title"></div>
            <div class="gray-explain">* 收银员登陆方式为主账号+收银员编号+收银员密码</div>
          </div>
          <div class="info next-bottom">
            <div class="info__title">退款权限</div>
            <div class="info__desc">
              <el-switch v-model="opinfo.refund" on-text="" off-text="" on-color="#7ed321" off-color="#d8d8d8" on-value=1 off-value=0 @change="changeRights"></el-switch>
            </div>
          </div>
          <div class="info">
            <div class="info__title"></div>
            <div class="gray-explain">* 目前收银员仅支持查看活动信息，不支持对红包、集点、储值活动、特卖、店铺公告、会员特权的增删改</div>
          </div>
          <div class="panel-btn-group__wrapper">
            <a :href="downHref" download>
              <div class="panel-btn__download panel-btn__download_detail">
                <i class="icon-download"></i>
                <span>下载收款码</span>
              </div>
            </a>
            <div class="panel-btn__download panel-btn__download_record" @click="changeInfo">
              <span>编辑收银员资料</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog title="编辑收银员资料" :visible.sync="showChangeInfo" @close="handleClose" custom-class="mydialog" top="20%" :show-close="false">
      <el-form :model="form" :rules="formrules" ref="form" label-width="90px">
        <el-form-item label="姓名" prop="opname">
          <el-input v-model.trim="form.opname" size="small" type="text" placeholder="请输入收银员姓名"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model.trim="form.mobile" size="small" type="text" placeholder="请输入收银员电话"></el-input>
        </el-form-item>
        <el-form-item label="门店">
          <div>{{ shop.shopname }}</div>
        </el-form-item>

        <el-form-item label="主账号">
          <div>{{ shop.mobile }}</div>
        </el-form-item>
        <el-form-item label="收银员编号">
          <div>{{ opuid }}</div>
        </el-form-item>
        <el-form-item label="收银员密码" prop="password">
          <el-input v-model="form.password" size="small" type="password" placeholder="请输入收银员密码" @change="passChange" @blur="passBlur"></el-input>
        </el-form-item>
      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="showChangeInfo = false" class="cancel">关 闭</div>
        <div @click="submit" class="submit">
          <span class="el-icon-loading" v-if="iconShow"></span>
          <span v-else>确 认</span>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        vm.opuid = vm.$route.query.id || '';
        vm.getInfo();
      });
    },

    data() {
      let mobileValid = (rule, val, cb) => {
        if(val === '') {
          cb('请输入收银员电话');
        } else if(!/^1[34578]\d{9}$/.test(val)) {
          cb('请输入正确的收银员电话');
        } else {
          cb();
        }
      };

      return {
        opinfo: {},
        opuid: '',
        loading: false,
        iconShow: false,
        flag: false,
        isChange: false,
        showChangeInfo: false,
        form: {
          opname: '',
          mobile: '',
          password: ''
        },
        formrules: {
          opname: [
            { required: true, message: '请输入收银员姓名' },
            { max: 20, min: 2, message: '请输入2~20位字符' }
          ],
          mobile: [
            {validator: mobileValid}
          ],
          password: [
            { required: true, message: '请输入收银员密码' },
            { max: 20, min: 6, message: '请输入6~20位字符' }
          ]
        }
      };
    },

    computed: {
      downHref() {
        return `${config.host}/merchant/qrcode?userid=${this.shop.uid}&opuid=${this.opuid}`;
      }
    },

    props: {
      shop: {
        type: Object
      }
    },

    methods: {
      // 获取收银员信息
      getInfo() {
        this.loading = true;
        axios.get(`${config.host}/merchant/opuser/info`, {
          params: {
            opuid: this.opuid
          }
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.opinfo = data.data || {};
            this.opinfo.status = this.opinfo.status + '';
            this.opinfo.refund = this.opinfo.refund + '';
            this.form = {
              opname: this.opinfo.opname,
              mobile: this.opinfo.mobile,
              password: '******'
            }
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('网络错误');
        });
      },

      // 改变状态
      changeStatus(st) {
        if(!this.loading) {
          this.loading = true;
          axios.post(`${config.ohost}/mchnt/opuser/change`, {
            opuid: this.opuid,
            status: st,
            format: 'cors'
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if (data.respcd === config.code.OK) {
              let message;
              if(st === '1') {
                message = '账户已启用';
              }else {
                message = '账户已禁用';
              }
              this.$message({
                type: 'success',
                message: message
              });
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('网络错误');
          })
        }
      },

      // 改变权限
      changeRights(rg) {
        if(!this.loading) {
          this.loading = true;
          axios.post(`${config.ohost}/mchnt/opuser/perm/change`, {
            opuid: this.opuid,
            type: 'refund',
            status: rg,
            format: 'cors'
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if (data.respcd === config.code.OK) {
              let message;
              if(rg === '1') {
                message = '权限已开启';
              }else {
                message = '权限已关闭';
              }
              this.$message({
                type: 'success',
                message: message
              });
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('网络错误');
          })
        }
      },

      // 基本信息弹层
      changeInfo() {
        this.showChangeInfo = true;
      },

      // 输入框聚焦改变时清空
      passChange(val) {
        if(!this.flag) {
          this.isChange = true;
          this.form.password = val.substr(-1) || '';
          this.flag = true;
        }
      },

      // 失焦
      passBlur() {
        this.flag = false;
      },

      // 提交修改
      submit() {
        this.$refs['form'].validate((valid) => {
          if (valid && !this.iconShow) {
            this.iconShow = true;
            let params;
            if(this.isChange) {
              params = Object.assign({}, this.form, {
                opuid: this.opuid,
                format: 'cors'
            });
            }else {
              params = {
                opname: this.form.opname,
                mobile: this.form.mobile,
                opuid: this.opuid,
                format: 'cors'
              }
            }
            axios.post(`${config.ohost}/mchnt/opuser/change`, params).then((res) => {
              this.iconShow = false;
              this.showChangeInfo = false;
              let data = res.data;
              if (data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '修改成功'
                });
                // 路由重新渲染
                this.getInfo();
              } else {
                this.$message.error(data.resperr);
              }
            }).catch(() => {
              this.iconShow = false;
              this.showChangeInfo = false;
              this.$message.error('网络错误');
            })
          }
        });
      },

      // 关闭弹出层,清除表单
      handleClose() {
        this.isChange = false;
        this.$refs['form'].resetFields();
      }
    }

  };
</script>
<style lang="scss">
  .cashierdetail {
    .next-bottom {
      margin-bottom: 0;
    }
  }
</style>
