<template>
  <el-form :rules="formrules" :model="form" ref="form">
    <el-form-item label="目标通知到">
      <span>{{ member_total || 0 }}</span>
      <span>人</span>
    </el-form-item>
    <el-form-item label="适用门店" prop="sub_mchnt_list" v-if="!role.single">
      <el-select v-model="form.sub_mchnt_list" placeholder="请选择门店" multiple size="small"
                 ref="selectShops">
        <el-option v-for="shop in shopList" :label="shop.shop_name" :key="shop.uid" :value="shop.uid">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="单个红包金额">
      <el-form-item prop="singleValue">
        <el-input size="small" type="number" v-model.number="form.singleValue"></el-input>
      </el-form-item>
      <span>元</span>
    </el-form-item>
    <el-form-item label="使用条件">
      <span>微信支付</span>
      <el-form-item prop="limit_amt">
        <el-input size="small" v-model.number="form.limit_amt" type="number"></el-input>
      </el-form-item>
      <span>元以上可用</span>
    </el-form-item>
    <el-form-item label="有效期">
      <span>领取后</span>
      <span>14</span>
      <span>天内可使用</span>
      <div class="remark">
        <p>注：</p>
        <p>1、确认提交后，将在次日以公众号的形式将你的店铺红包发给会员；</p>
        <p>2、红包费用由商户承担；</p>
      </div>
    </el-form-item>
  </el-form>

</template>

<script>

  import {formatDate} from '../../common/js/util';
  import Validator from '../../validator';
  import Store from '../../common/js/store';

  export default {

    data() {

      let limitAmtValidator = (rule, val, cb) => {
        if (val === '') {
          cb('请输入使用条件');
        } else if (isNaN(val)) {
          cb('请输入数字');
        } else if (val < this.form.singleValue) {
          cb('使用条件要大于单个红包金额');
        } else if (!(/^\d+(\.\d{1,2})?$/.test(val))) {
          cb('小数点后只能有两位');
        } else {
          cb();
        }
      };

      return {
        role: Store.get('role') || {},
        form: {
          singleValue: '',
          limit_amt: '',
          sub_mchnt_list: ['']
        },
        formrules: {
          limit_amt: [
            {validator: limitAmtValidator}
          ],
          effect_date: [
            {required: true, message: '请输入有限期'},
            {type: 'number', message: '请输入数字'}
          ],
          singleValue: [
            {validator: Validator.singleValueValidator}
          ],
          sub_mchnt_list: [
            {required: true, message: '请选择适用门店'}
          ]
        }
      };
    },
    computed: {
      shopData() {
        return this.$store.state.shopData;
      },
      shopList() {
        return this.shopData.list;
      },
      member_total() {
        return this.$store.state.member_total;
      },
      data() {
        return {
          act_type: 'type_common',
          sub_mchnt_list: this.form.sub_mchnt_list,
          limit_amt: this.form.limit_amt,
          amt_max: this.form.singleValue,
          amt_min: this.form.singleValue,
          total_amt: this.form.singleValue * this.member_total,
          act_type_label: '红包通知',
          member_total: this.member_total,
          notify_time: this.getNotifyTime()
        };
      }
    },
    watch: {
      'form.sub_mchnt_list': function (val, oldval) {
        if(val.length > oldval.length) {
          if(val.indexOf('') > 0) {
            this.form.sub_mchnt_list = [''];
          }else if(oldval.indexOf('') > -1) {
            this.form.sub_mchnt_list.shift();
          }
        }
      }
    },
    methods: {
      getNotifyTime() {
        let baseDate = new Date();
        let date = new Date();
        date.setDate(baseDate.getDate() + 1);
        return formatDate(date);
      }
    }
  };
</script>
<style lang="scss">
  .el-form-item-300 {
    width: 300px;
  }

  .el-form-item-200 {
    width: 200px;
  }
</style>
