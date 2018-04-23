<template>
  <div class="createpacket" v-loading="loading">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberstorage' }" replace>会员储值</el-breadcrumb-item>
        <el-breadcrumb-item>创建储值</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">设置储值活动</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="myform_wrapper">
          <el-form :rules="formrules" :model="form" ref="form">
            <el-form-item label="开始时间" prop="start_time">
              <el-date-picker v-model="form.start_time" type="date" placeholder="请选择开始时间" size="small" :editable="false" :clearable="false" :picker-options="dateRange">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间" prop="end_time">
              <el-date-picker v-model="form.end_time" type="date" placeholder="请选结束时间" size="small" :editable="false" :clearable="false" :picker-options="dateRange">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="适用门店" v-if="!role.single">
              <el-form-item prop="mchnt_ids">
                <el-select v-model="form.mchnt_ids" placeholder="请选择门店" multiple size="small">
                  <el-option label="全部" value="" :disabled="state"></el-option>
                  <el-option v-for="shop in shopList" :label="shop.shopname" :key="shop.h" :value="shop.h" :disabled="shop.status == 0 || shop.status == 1">
                  </el-option>
                </el-select>
              </el-form-item>
              <div class="remark">注：请确保以上门店均已开通储值服务，否则无法正常储值</div>
            </el-form-item>
            <el-form-item label="设置规则" min-width="150">
              <div class="storage-item" v-for="(item, index) in form.rulesData">
                <span>储值</span>
                <el-form-item :prop="'pay_amt' + index">
                  <el-input size="small" type="number" v-model.trim="form['pay_amt' + index]" @change="bindPayAmtValue(index)"></el-input>
                </el-form-item>
                <span>元送</span>
                <el-form-item :prop="'present_amt' + index">
                  <el-input size="small" type="number" v-model.trim="form['present_amt' + index]" @change="bindPresentAmtValue(index)"></el-input>
                </el-form-item>
                <span>元</span>
                <el-button size="small" @click="addRule" :disabled="len === 4" v-if="index === 0" class="ml-15" :plain="true" type="primary">增加规则</el-button>
                <el-button size="small" v-if="index !== 0" @click="removeRule(item)" class="ml-15" :plain="true" type="danger">删除</el-button>
              </div>
            </el-form-item>
            <el-form-item label="储值规则备注">
              <el-form-item prop="desc">
                <el-input type="textarea" placeholder="请输入储值规则" v-model="form.desc" :autosize="{ minRows: 3, maxRows: 7 }" class="w-500"></el-input>
              </el-form-item>
              <div class="stro-info mt-20 error-42"><p>例如:</p> <p>1、一旦储值不予退款；</p> <p>2、储值用户可享所有商品优惠；</p></div>
            </el-form-item>
            <el-form-item label="预留电话" prop="mobile">
              <el-input size="small" type="number" v-model.trim="form.mobile" class="panel-select-input-220"></el-input>
            </el-form-item>
          </el-form>
          <div class="divider"></div>
          <div class="form-submit_wrapper">
            <span class="cancel" @click="cancelCreation">放弃创建</span>
            <div class="panel-btn__download panel-btn__download_detail" @click="preview">
              <i class="icon-create"></i>
              <span>提交预览</span>
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
  import {formatDate} from '../../common/js/util';
  import Validator from '../../validator';
  import Store from '../../common/js/store';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        vm.getShopList();
      });
    },

    data() {
      let expireValid = (rule, val, cb) => {
        if(val === '') {
          cb('请选择活动结束时间');
        } else if(this.form.start_time && val.getTime() < this.form.start_time.getTime()) {
          cb('活动结束时间必须大于开始时间');
        } else {
          cb();
        }
      };
      let startValid = (rule, val, cb) => {
        if(val === '') {
          cb('请选择活动开始时间');
        } else {
          if(this.form.end_time !== '') {
            this.$refs['form'].validateField('end_time');
          }
          cb();
        }
      };
      let descValid = (rule, val, cb) => {
        if(val === '') {
          cb('请输入储值规则描述');
        } else if(val.length >= 140) {
          cb('请不要超过140个字符');
        } else {
          cb();
        }
      };

      return {
        dateRange: {
          disabledDate: (time) => {
            return time.getTime() < (Date.now() - 24 * 1000 * 3600);
          }
        },
        role: Store.get('role') || {},
        loading: false,
        state: false,
        shopList: [],
        form: {
          start_time: '',
          end_time: '',
          mchnt_ids: [''],
          mobile: '',
          desc: '',
          pay_amt0: null,
          present_amt0: null,
          pay_amt1: null,
          present_amt1: null,
          pay_amt2: null,
          present_amt2: null,
          pay_amt3: null,
          present_amt3: null,
          rulesData: [
            {
              grid_index: 1,
              pay_amt: null,
              present_amt: null
            }
          ]
        },
        formrules: {
          start_time: [
            { validator: startValid }
          ],
          end_time: [
            { validator: expireValid }
          ],
          mchnt_ids: [
            {required: true, message: '请选择适用门店'}
          ],
          desc: [
            { validator: descValid }
          ],
          mobile: [
            { validator: Validator.mobileValid }
          ],
          pay_amt0: [
            { validator: Validator.stoAmtValid }
          ],
          present_amt0: [
            { validator: Validator.stoAmtValid }
          ],
          pay_amt1: [
            { validator: Validator.stoAmtValid }
          ],
          present_amt1: [
            { validator: Validator.stoAmtValid }
          ],
          pay_amt2: [
            { validator: Validator.stoAmtValid }
          ],
          present_amt2: [
            { validator: Validator.stoAmtValid }
          ],
          pay_amt3: [
            { validator: Validator.stoAmtValid }
          ],
          present_amt3: [
            { validator: Validator.stoAmtValid }
          ]
        }
      };
    },
    watch: {
      'form.mchnt_ids': function (val, oldval) {
        if(val.length > oldval.length) {
          if(val.indexOf('') > 0) {
            this.form.mchnt_ids = [''];
          }else if(oldval.indexOf('') > -1) {
            this.form.mchnt_ids.shift();
          }
        }
      }
    },

    computed: {
      data() {
        return {
          start_time: this.form.start_time && formatDate(this.form.start_time),
          end_time: this.form.end_time && formatDate(this.form.end_time),
          mchnt_ids: this.form.mchnt_ids,
          mobile: this.form.mobile,
          desc: this.form.desc,
          rules: this.form.rulesData
        };
      },
      len() {
        return this.form.rulesData.length;
      }
    },
    methods: {
      getShopList() {
        if(!this.role.single) {
          this.loading = true;
          axios.get(`${config.host}/merchant/prepaid/activity`).then((res) => {
            this.loading = false;
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.shopList = data.data || [];

              for(let val of this.shopList) {
                // 0未开始1进行中2已结束3已终止
                if(val.status === 0 || val.status === 1) {
                  this.state = true;
                  this.form.mchnt_ids = [];
                }
              }
            } else {
              this.$message.error(data.respmsg);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('获取店铺数据失败!');
          });
        }
      },

      cancelCreation() {
        this.$router.push('/main/memberstorage');
      },
      preview() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            Store.set('storagedata', this.data);
            this.$router.push({ name: 'reviewstorage' });
          } else {
            this.$message.error('请核对信息是否完整');
          }
        });
      },
      addRule() {
        let lastIndex = this.len + 1;
        this.form.rulesData.push({
          grid_index: lastIndex,
          pay_amt: null,
          present_amt: null
        });
      },
      removeRule(item) {
        let index = this.form.rulesData.indexOf(item);
        this.form.rulesData.splice(index, 1);
        this.form.rulesData.forEach((v, index) => {
          v.grid_index = index + 1;
        });
      },
      bindPayAmtValue(index) {
        this.form.rulesData[index].pay_amt = this.form['pay_amt' + index];
      },
      bindPresentAmtValue(index) {
        this.form.rulesData[index].present_amt = this.form['present_amt' + index];
      }
    }
  };
</script>

<style lang="scss">
  .w-500 {
    width: 500px;
  }
  .storage-item {
    margin-bottom: 15px;
  }
  .ml-15 {
    margin-left: 15px;
  }
  .stro-info {
    margin-top: 10px;
    color: black !important;
    font-size: 14px !important;
  }
  .mt-20 {
    margin-top: 20px;
  }
  .lh-16 {
    line-height: 16px;
  }
</style>
