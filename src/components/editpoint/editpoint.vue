<template>
  <div class="editpoint">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberredpoint' }" replace>会员集点</el-breadcrumb-item>
        <el-breadcrumb-item>修改集点</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">修改集点活动</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="myform_wrapper">
          <el-form :rules="formrules" :model="form" ref="form" class="myRate">
            <el-form-item label="目标点数">
              <el-form-item prop="exchange_pt">
                <el-rate :max=10 disabled v-model="form.exchange_pt" show-text void-icon-class="el-rate-off" :icon-classes="['el-rate-on','el-rate-on','el-rate-on']" text-template="{value}点" text-color="#FE9B20">
                </el-rate>
              </el-form-item>
              <div class="gray-explain">* 大数据分析表明，选择5点可使回头客明显增加，活动效果更优！</div>
            </el-form-item>
            <el-form-item label="集点条件">
              <span>支付满</span>
              <el-form-item prop="obtain_amt">
                <el-input size="small" v-model.number="form.obtain_amt" type="number"></el-input>
              </el-form-item>
              <span>元可集一个点</span>
            </el-form-item>
            <el-form-item prop="checked" class="explain">
              <el-checkbox v-model="checked">一次付款可以集多点</el-checkbox>
              <div class="content">适合有顾客批量购买多个商品的情况</div>
              <div class="content">例如：支付20元可集一点，当用户微信支付80元时，可以直接集4点</div>
            </el-form-item>
            <el-form-item label="礼品名称" prop="goods_name">
              <el-input size="small" type="text" v-model.trim="form.goods_name" class="panel-select-input-220"></el-input>
            </el-form-item>
            <el-form-item label="礼品价格" prop="goods_amt">
              <el-input size="small" type="text" v-model.trim="form.goods_amt" class="panel-select-input-220"></el-input>
              <span>元</span>
            </el-form-item>
            <el-form-item label="开始时间" prop="start_time">
              <el-date-picker v-model="form.start_time" type="date" placeholder="请选择开始时间" size="small" :editable="false" :clearable="false" :picker-options="dateRange">
              </el-date-picker>
            </el-form-item>
            <el-form-item label="结束时间" prop="expire_time">
              <el-date-picker v-model="form.expire_time" type="date" placeholder="请选结束时间" size="small" :editable="false" :clearable="false" :picker-options="dateRange">
              </el-date-picker>
            </el-form-item>
            <el-form-item prop="mchnt_id_list" label="适用门店" v-if="!role.single">
              <el-select v-model="form.mchnt_id_list" placeholder="请选择门店" multiple filterable size="small">
                <el-option label="全部" value="">
                </el-option>
                <el-option v-for="shop in checkList" :label="shop.shopname" :key="shop.uid" :value="shop.uid">
                </el-option>
                <el-option v-for="shop in shopData" :label="shop.shopname" :key="shop.uid" :value="shop.uid" :disabled="shop.state == 0">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div class="divider"></div>
          <div class="form-submit_wrapper">
            <span class="cancel" @click="cancelCreat">放弃创建</span>
            <div class="panel-btn__download panel-btn__download_detail" @click="preview">
              <i class="icon-create"></i>
              <span>提交预览</span>
            </div>
            <span class="black-explain">注：会员在集点满额兑换礼品后，将自动重新集点</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {formatDate} from '../../common/js/util';
  import Validator from '../../validator';
  import axios from 'axios';
  import config from 'config';
  import Store from '../../common/js/store';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        let pData = Store.get('pointData');
        if(pData) {
          vm.form = {
            exchange_pt: +pData.exchange_pt,
            obtain_amt: +pData.obtain_amt,
            goods_name: pData.goods_name,
            goods_amt: +pData.goods_amt,
            start_time: new Date(pData.start_time),
            expire_time: new Date(pData.expire_time),
            mchnt_id_list: []
          };
          vm.id = pData.id;
          vm.checked = pData.obtain_limit == 0;
        }

        vm.getData();
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
          if(this.form.expire_time !== '') {
            this.$refs['form'].validateField('expire_time');
          }
          cb();
        }
      };

      let ptValid = (rule, val, cb) => {
        if(!val) {
          cb('请输入目标集点');
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
        shopData: [],
        role: Store.get('role') || {},
        checkList: [],
        id: null,
        checked: false,
        form: {
          exchange_pt: null,
          obtain_amt: null,
          goods_name: '',
          goods_amt: null,
          start_time: new Date(),
          expire_time: new Date(),
          mchnt_id_list: []
        },
        formrules: {
          exchange_pt: [
            { validator: ptValid }
          ],
          obtain_amt: [
            { required: true, message: '请输入集点条件' },
            { validator: Validator.pointValidator }
          ],
          goods_name: [
            { required: true, message: '请输入礼品名称' },
            { max: 8, message: '最多输入8个字符' }
          ],
          goods_amt: [
            { required: true, message: '请输入礼品价格' },
            { validator: Validator.pointValidator }
          ],
          start_time: [
            { validator: startValid }
          ],
          expire_time: [
            { validator: expireValid }
          ],
          mchnt_id_list: [
            { required: true, message: '请选择适用门店' }
          ]
        }
      };
    },
    computed: {
      data() {
        return {
          exchange_pt: this.form.exchange_pt,
          obtain_amt: this.form.obtain_amt,
          obtain_limit: this.checked ? 0 : 1,
          goods_name: this.form.goods_name,
          goods_amt: this.form.goods_amt,
          start_time: this.form.start_time && formatDate(this.form.start_time),
          expire_time: this.form.expire_time && formatDate(this.form.expire_time),
          mchnt_id_list: this.form.mchnt_id_list,
          id: this.id
        };
      }
    },
    watch: {
      'form.mchnt_id_list': function (val, oldval) {
        if(val.length > oldval.length) {
          if(val.indexOf('') > 0) {
            this.form.mchnt_id_list = [''];
          }else if(oldval.indexOf('') > -1) {
            this.form.mchnt_id_list.shift();
          }
        }
      }
    },

    methods: {
      // 放弃创建
      cancelCreat() {
        this.$router.push('/main/memberredpoint');
      },

      // 进入页面格式化数据
      formatData(data) {
        let checklist = [];
        let alllist = data;
        let checkList = [];
        let list = [];
        let valueList = [];
        for(let val of alllist) {
          let flag = false;

          if((Store.get('pointData') || {}).apply_shops) {
            checklist = (Store.get('pointData') || {}).apply_shops;
            for(let index of checklist) {
              if(val.uid == index.uid) {
                checkList.push(val);
                valueList.push(val.uid);
                flag = true;
              }
            }
          }else {
            checklist = (Store.get('pointData') || {}).mchnt_id_list;
            for(let index of checklist) {
              if(val.uid == index) {
                checkList.push(val);
                valueList.push(val.uid);
                flag = true;
              }
            }
          }

          if(!flag) {
            list.push(val);
          }
        }

        this.shopData = list;
        this.checkList = checkList;
        this.form = Object.assign(this.form, {
          mchnt_id_list: valueList
        })
      },

      // 提交预览
      preview() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if(this.form.mchnt_id_list[0] === '') {
              let param = this.form.mchnt_id_list.concat(this.checkList);
              this.data = Object.assign(this.data, {
                mchnt_id_list: param
              })
            }
            Store.set('pointData', this.data);
            this.$router.push("/main/memberredpoint/reviewpoint?type=edit");
          } else {
            this.$message.error('请核对信息是否完整');
          }
        });
      },

      // 获取店铺列表信息
      getData() {
        axios.get(`${config.host}/merchant/card/active_state`).then((res) => {
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.formatData(data.data);
            Store.set('shopStateList', data.data || []);
          } else {
            this.$message.error(data.respmsg);
          }
        });
      }
    }
  };
</script>

<style lang="scss">

</style>
