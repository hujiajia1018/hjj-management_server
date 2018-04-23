<template>
  <div class="settings" v-loading="loading" element-loading-text="拼命加载中">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>设置</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">邮箱设置</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="myform_wrapper">
          <el-form :rules="formrules" :model="form" ref="form">
            <el-form-item label="邮箱">
              <el-form-item prop="email">
                <el-input size="small" type="text" :disabled="!state2" v-model.trim="form.email" class="panel-select-input-230"></el-input>
              </el-form-item>
                <div class="panel-header-btn panel-header-btn__fill" v-if="state2" @click="commit">
                <span class="el-icon-loading" v-if="loading1"></span>
                <span v-else>确认</span>
              </div>
              <div v-else class="edit" @click="edit">修改</div>

              <div class="gray-explain">* 我们会在次日早上7点，把上一天的交易记录发送给您。</div>
            </el-form-item>
            <el-form-item label="每日发送交易报表" prop="status">
              <el-switch v-model="form.status" on-text="" off-text="" on-color="#7ed321" off-color="#d8d8d8" on-value=1 off-value=0 @change="sendChange" :disabled="state1"></el-switch>
            </el-form-item>

          </el-form>
        </div>
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
        loading1: false,
        state2: true,
        state1: true,
        form: {
          email: '',
          status: 0
        },
        formrules: {
          email: [
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
          ]
        }
      };
    },

    mounted() {
        this.getData();
    },

    methods: {
      getData() {
        this.loading = true;
        axios.get(`${config.host}/merchant/get/email?format=cors`).then((res) => {
          this.loading = false;
          let data = res.data;
          if(data.respcd === config.code.OK) {

            this.form.email = data.data.email;
            this.form.status = data.data.status + '';

            if(this.form.email) {
               this.state1 = false;
               this.state2 = false;
            }
          } else {
            this.$message.error(data.resperr);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('获取邮箱设置失败');
        });
      },

      sendChange(val) {
        this.$refs['form'].validate((valid) => {
          if(valid && !this.loading1) {
            axios.post(`${config.host}/merchant/add/email`, {
              status: val
            }).then((res) => {
              let data = res.data;
              if(data.respcd === config.code.OK) {
              } else {
                this.$message.error(data.resperr);
              }
            }).catch(() => {
              this.$message.error('修改失败');
            });
          }
        })
      },

      // 提交
      commit() {
        this.$refs['form'].validate((valid) => {
            if(valid && !this.loading1) {
              this.loading1 = true;
              axios.post(`${config.host}/merchant/add/email`, {
                email: this.form.email,
                status: 1
              }).then((res) => {
                this.loading1 = false;
                let data = res.data;
                if(data.respcd === config.code.OK) {
                  this.$message({
                    type: 'success',
                    message: '修改成功'
                  });
                  this.form.status = '1';
                  this.state1 = false;
                  this.state2 = false;
                } else {
                  this.$message.error(data.resperr);
                }
              }).catch(() => {
                this.loading1 = false;
                this.$message.error('修改失败');
              });
            }
        })
      },

      // 修改
      edit() {
        this.state2 = true;
      }
    }
  };
</script>

<style lang="scss">
  .settings {
    .panel-select-input-230 {
      width: 230px;
    }
    .panel-header__auto{
      border-top: none;
    }
    .gray-explain {
      color: #8A8C92;
      font-size: 14px;
      margin-top: 10px;
    }
    .el-form-item__label {
      color: #2f323a;
    }
    .el-switch__core {
      margin-left: 20px;
    }
    .panel-header-btn {
      display: inline-block;
      float: none;
    }

    .el-input.is-disabled .el-input__inner {
      color: #2f323a;
      background-color: transparent;
      border: none;
      font-size: 16px;
    }
    .edit {
      display: inline-block;
      float: none;
      color: #FE9B20;
      cursor: pointer;
    }
    .myform_wrapper {
      padding-bottom: 2px;
    }
  }
</style>
