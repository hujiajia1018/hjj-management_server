<template>
  <div class="addcashier" v-loading="loading">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item class="first" :to="{ path: '/main/cashiermanage' }" replace>收银员管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加收银员</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">输入收银员信息</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="myform_wrapper">
          <el-form :rules="formrules" :model="form" ref="form">
            <el-form-item label="姓名" prop="opname">
              <el-input size="small" v-model.trim="form.opname" type="text" placeholder="请输入收银员姓名" class="panel-select-input-220"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
              <el-input size="small" v-model.trim="form.mobile" type="text" placeholder="请输入收银员电话" class="panel-select-input-220"></el-input>
            </el-form-item>
            <el-form-item label="主账号">
              <span class="input-content">{{ shop.mobile }}</span>
            </el-form-item>
            <el-form-item label="收银员编号">
              <span class="input-content">{{ opuid }}</span>
            </el-form-item>
            <el-form-item label="收银员密码" prop="password">
              <el-input size="small" type="password" v-model.trim="form.password" placeholder="请输入收银员密码" class="panel-select-input-220"></el-input>
            </el-form-item>
            <div class="gray-explain">* 收银员登陆方式为主账号+收银员编号+收银员密码</div>
          </el-form>
          <div class="divider"></div>
          <div class="form-submit_wrapper">
            <span class="cancel" @click="cancelCreat">放弃添加</span>
            <div class="panel-btn__download panel-btn__download_detail" @click="submit">
              <span class="el-icon-loading" v-if="loading1"></span>
              <span v-else>提交</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  import config from 'config';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        vm.$refs['form'].resetFields();
        vm.getOpuid();
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
        loading: false,
        loading1: false,
        opuid: '',
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
            { validator: mobileValid }
          ],
          password: [
            { required: true, message: '请输入收银员密码' },
            { max: 20, min: 6, message: '请输入6~20位字符' }
          ]
        }
      };
    },
    props: {
      shop: {
        type: Object
      }
    },

    methods: {
      // 放弃添加
      cancelCreat() {
        this.$router.push('/main/cashiermanage');
      },

      // 提交
      submit() {
        this.$refs['form'].validate((valid) => {
          if (valid && !this.loading1) {
            this.loading1 = true;
            axios.post(`${config.ohost}/mchnt/opuser/add`, Object.assign({}, this.form, {
              opuid: this.opuid,
              format: 'cors'
            })).then((res) => {
              this.loading1 = false;
              let data = res.data;
              if(data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '添加收银员成功'
                });
                this.$router.push('/main/cashiermanage');
              } else {
                this.$message.error(data.resperr);
              }
            }).catch(() => {
              this.loading1 = false;
              this.$message.error('网络错误');
            })
          }
        });
      },

      // 获取收银员编号
      getOpuid() {
        this.loading = true;
        axios.get(`${config.ohost}/mchnt/opuser/opuid?format=cors`).then((res) => {
          this.loading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.opuid = data.data.opuid;
          } else {
            this.$message.error(data.respmsg);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('获取收银员编号失败');
        });
      }
    }
  };
</script>
<style lang="scss">
  .addcashier {
    .input-content {
      color: #777A7D;
      font-size: 16px;
    }
    .gray-explain {
      margin-left: 120px;
      margin-bottom: 20px;
    }
  }
</style>

