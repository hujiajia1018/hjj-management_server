  <template>
  <el-form :rules="formrules" :model="form" ref="form">
    <el-form-item label="活动名称" prop="act_name">
      <el-input v-model="form.act_name" size="small" class="el-form-item-300"></el-input>
    </el-form-item>
    <el-form-item label="开始时间" prop="start_time">
      <el-date-picker v-model="form.start_time" type="date" :editable="false" placeholder="请选择开始时间" size="small" :clearable="false" :picker-options="dateRange">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="结束时间" prop="expire_time">
      <el-date-picker v-model="form.expire_time" type="date" :editable="false" placeholder="请选结束时间" size="small" :clearable="false" :picker-options="dateRange">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="适用门店" prop="sub_mchnt_list" v-if="!role.single">
      <el-select v-model="form.sub_mchnt_list" placeholder="请选择门店" multiple size="small">
        <el-option v-for="shop in shopList" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="红包金额">
      <el-radio-group v-model="packetValue">
        <el-radio :label="0">固定金额</el-radio>
        <el-radio :label="1">随机金额</el-radio>
      </el-radio-group>
    </el-form-item>
    <template v-if="packetValue === 0">
      <el-form-item label="单个红包金额" v-if="packetValue === 0">
        <el-form-item prop="singleValue">
          <el-input size="small" type="number" v-model.number="form.singleValue"></el-input>
        </el-form-item>
        <span>元</span>
      </el-form-item>
      <el-form-item label="红包个数">
        <el-form-item prop="coupon_num">
          <el-input size="small" type="number" v-model.number="form.coupon_num"></el-input>
        </el-form-item>
        <span>个</span>
      </el-form-item>
    </template>
    <template v-if="packetValue === 1">
      <el-form-item label="单个红包金额">
        <el-form-item prop="amt_min">
          <el-input v-model.number="form.amt_min" type="number" size="small"></el-input>
        </el-form-item>
        <span>至</span>
        <el-form-item prop="amt_max">
          <el-input v-model.number="form.amt_max" type="number" size="small"></el-input>
        </el-form-item>
        <span>元</span>
      </el-form-item>
      <el-form-item label="红包总预算">
        <el-form-item prop="total_amt">
          <el-input size="small" type="number" v-model.number="form.total_amt"></el-input>
        </el-form-item>
        <span>元</span>
        <span class="remark ml-10">* 红包金额领取后被使用，才会消耗预算</span>
      </el-form-item>
    </template>
    <el-form-item label="领取条件">
      <span>微信支付满</span>
      <el-form-item prop="obtain_amt">
        <el-input size="small" type="number" v-model.number="form.obtain_amt"></el-input>
      </el-form-item>
      <span>元可领取</span>
    </el-form-item>
    <el-form-item label="使用条件">
      <span>微信支付</span>
      <el-form-item prop="limit_amt">
        <el-input size="small" type="number" v-model.number="form.limit_amt"></el-input>
      </el-form-item>
      <span>元以上可用</span>
    </el-form-item>
    <el-form-item label="生效日期" prop="effect_offset">
      <el-radio-group v-model="form.effect_offset">
        <el-radio :label="0">即刻生效</el-radio>
        <el-radio :label="1">次日生效</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="红包有效期">
      <span>领取后</span>
        <el-form-item prop="effect_date">
          <el-input type="number" v-model.number="form.effect_date" size="small"></el-input>
        </el-form-item>
      <span>天内可使用</span>
      <div class="remark">
        <p>注：</p>
        <p>1、红包费用由商户承担；</p>
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
      let expireValid = (rule, val, cb) => {
        if(val === '') {
          cb('请选择活动结束时间');
        } else if(this.form.start_time && val.getTime() < this.form.start_time.getTime()) {
          cb('活动结束时间必须大于开始时间');
        } else {
          console.log(val);
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
      let amtAmxValid = (rule, val, cb) => {
        if(val === '') {
          cb('请输入随机金额最大值');
        } else if(isNaN(val)) {
          cb('请输入数字');
        } else if(val < this.form.amt_min) {
          cb('随机金额最大值要大于最小值');
        } else if(!(/^\d+(\.\d{1,2})?$/.test(val))) {
          cb('小数点后只能有两位');
        } else {
          cb();
        }
      };
      let limitAmtValidator = (rule, val, cb) => {
        if(val === '') {
          cb('请输入使用条件');
        } else if(isNaN(val)) {
          cb('请输入数字');
        } else if(this.packetValue === 0 && val < this.form.singleValue) {
          cb('使用条件要大于单个红包金额');
        } else if(this.packetValue === 1 && val < this.form.amt_max) {
          cb('使用条件要大于随机金额最大值');
        } else if(!(/^\d+(\.\d{1,2})?$/.test(val))) {
          cb('小数点后只能有两位');
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
        packetValue: 0,
        form: {
          act_name: '',
          start_time: '',
          expire_time: '',
          shopList: '',
          singleValue: '',
          effect_date: '',
          effect_offset: 0,
          obtain_amt: '',
          limit_amt: '',
          amt_min: '',
          amt_max: '',
          coupon_num: '',
          total_amt: '',
          sub_mchnt_list: ['']
        },
        formrules: {
          act_name: [
            { required: true, message: '请输入活动名称' }
          ],
          start_time: [
            { validator: startValid }
          ],
          expire_time: [
            { validator: expireValid }
          ],
          packetValue: [
            { required: true, message: '请选择红包金额' }
          ],
          obtain_amt: [
            { validator: Validator.obtainAmtValidator }
          ],
          limit_amt: [
            { validator: limitAmtValidator }
          ],
          effect_offset: [
            { required: true, message: '请选择生效日期!' }
          ],
          effect_date: [
            { validator: Validator.dateValidator }
          ],
          amt_max: [
            { validator: amtAmxValid }
          ],
          amt_min: [
            { validator: Validator.amtMinValid }
          ],
          singleValue: [
            { validator: Validator.singleValueValidator }
          ],
          coupon_num: [
            { validator: Validator.couponNumValidator }
          ],
          total_amt: [
            { validator: Validator.totalAmt }
          ],
          sub_mchnt_list: [
            { required: true, message: '请选择适用门店' }
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
      data() {
        if(this.packetValue === 0) {
          this.form.total_amt = (this.form.singleValue * 100 * this.form.coupon_num) / 100;
        };
        return {
          packetValue: this.packetValue,
          act_type: 'type_payment',
          act_name: this.form.act_name,
          start_time: this.form.start_time && formatDate(this.form.start_time),
          expire_time: this.form.expire_time && formatDate(this.form.expire_time),
          singleValue: this.form.singleValue,
          amt_min: this.form.amt_min,
          amt_max: this.form.amt_max,
          obtain_amt: this.form.obtain_amt,
          limit_amt: this.form.limit_amt,
          effect_date: this.form.effect_date,
          effect_offset: this.form.effect_offset,
          coupon_num: this.form.coupon_num,
          total_amt: this.form.total_amt,
          act_type_label: '消费返红包',
          sub_mchnt_list: this.form.sub_mchnt_list
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
    }
  };
</script>
<style>
  .ml-10 {
    margin-left: 10px;
  }
</style>
