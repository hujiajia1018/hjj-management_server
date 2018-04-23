<template>
  <div class="billctl">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>账单管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__auto">
        <el-form :model="form" :rules="formrules" ref="form">
          <div class="panel-select-group">
            <div class="panel-select__wrapper">
              <span class="panel-select__desc">打款时间</span>
              <el-form-item prop="dateRangeValue" class="relative">
                <el-date-picker style="width:265px;" v-model="form.dateRangeValue" type="daterange" placeholder="选择日期范围" size="small" @change="changeDateRange" :clearable="false" :editable="false">
                </el-date-picker>
                <span class="remark note ml-0">* 请不要跨月查询</span>
              </el-form-item>
            </div>
            <div class="panel-select__wrapper" v-show="!role.single">
              <span class="panel-select__desc">店铺名称</span>
              <el-form-item prop="selectShopUid">
                <el-select v-model="form.selectShopUid" placeholder="全部" size="small">
                  <el-option v-for="shop in shopData.list" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
          <div class="panel-btn-group__wrapper">
            <!--<a :href="detailHref" download="true" style="float: left">-->
              <!--<div class="panel-btn__download panel-btn__download_detail">-->
                <!--<i class="icon-download"></i>-->
                <!--<span>下载打款明细</span>-->
              <!--</div>-->
            <!--</a>-->
            <a :href="recordHref" download="true">
              <div class="panel-btn__download panel-btn__download_record">
                <i class="icon-download"></i>
                <span>下载打款记录</span>
              </div>
            </a>
          </div>
        </el-form>
      </div>
    </div>
    <div class="panel">
      <div class="panel-body panel-body__fix">
        <div class="panel-paragraph">
          <p>账单是T+1生成，即交易后的第二个工作日，请在相应日期下载对账单</p>
          <p>相应的钱款也是T+1清算。</p>
          <p>例：周五、周六、周日的款项会在下周一清算，节假日会在节假日后的第一个工作日清算</p>
        </div>
        <div class="paragraph-divider"></div>
        <div class="panel-paragraph">
          <p>合作的清算方名称如下，请在对账时下载银行卡相应的流水单</p>
          <p>联动优势电子商务有限公司客户备付金</p>
          <p>商户结算专户</p>
          <p>昆明结算中心</p>
          <p>扫码支付专户</p>
          <p>网银在线</p>
          <p>财付通</p>
          <p>银联支付</p>
        </div>
        <div class="paragraph-divider"></div>
        <div class="panel-paragraph">
          <p>如您已成为微信实名认证商户，请在微信商户后台查看微信交易的对账单。<a target="_blank" href="https://pay.weixin.qq.com/index.php" class="paragraph-link">点此跳转</a></p>
          <p>商户管理后台仅提供非微信交易的对账单，如支付宝、京东等。</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import config from 'config';
  import { formatObj } from '../../common/js/util';
  import Store from '../../common/js/store';

  export default {
    data() {
      let today = new Date();
      let yesterday = new Date();
      let defaultDateRange = [];
      yesterday.setDate(yesterday.getDate() - 1);
      defaultDateRange.push(yesterday, today);

      let checkDateRangeValue = (rule, value, cb) => {
        if (value[0] && value[1]) {
          console.log(value);
          let startmonth = value[0].getMonth();
          let endmonth = value[1].getMonth();
          if (startmonth !== endmonth) {
            cb(new Error('请不要跨月选择'));
          }
        }
      };

      return {
        role: Store.get('role') || {},
        defaultDateRange: defaultDateRange,
        form: {
          dateRangeValue: defaultDateRange,
          selectShopUid: '',
          order: ''
        },
        formrules: {
          dateRangeValue: [{
            required: true,
            message: '请选择打款时间'
          }, {
            validator: checkDateRangeValue,
            trigger: 'change'
          }]
        }
      };
    },
    computed: {
      detailHref() {
        return `${config.host}/merchant/debit/download?${formatObj(this.basicParams)}`;
      },
      recordHref() {
        return `${config.host}/merchant/debit/total?${formatObj(this.basicParams)}`;
      },
      shopData() {
        return this.$store.state.shopData;
      },
      startdate() {
        return this.form.dateRangeValue[0] && this.format(this.form.dateRangeValue[0]);
      },
      enddate() {
        return this.form.dateRangeValue[1] && this.format(this.form.dateRangeValue[1]);
      },
      basicParams() {
        return {
          userid: this.form.selectShopUid,
          enddate: this.enddate,
          startdate: this.startdate,
          busicd: this.form.orderno || '',
          lang: 'zh-CN',
          charset: 'utf-8'
        };
      }
    },
    methods: {
      format(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;

        return `${year}-${month}-${day}`;
      },
      changeDateRange() {
        console.log(this.form.dateRangeValue);
        if (this.form.dateRangeValue[0] && this.form.dateRangeValue[1]) {
          let startmonth = this.form.dateRangeValue[0].getMonth();
          let endmonth = this.form.dateRangeValue[1].getMonth();
          if (startmonth !== endmonth) {
            this.$message.error('请不要跨月选择');
            this.form.dateRangeValue = this.defaultDateRange;
          }
        }
      }
    }
};
</script>
<style lang="scss">
.el-date-table td {
  vertical-align: middle;
}

.panel-select-group {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
}

.panel-header__auto {
  height: auto !important;
  padding: 25px 0 20px 15px;
}

.panel-btn-group__wrapper {
  display: flex;
  margin-top: 25px;
}

.panel-body__fix {
  padding: 5px 15px !important;
}

.panel-body-btn-group {
  margin: 10px 0px 20px;
}

.panel-paragraph {
  padding: 20px 0px;
  line-height: 1.6;
  font-size: 15px;
}

.paragraph-divider {
  height: 1px;
  padding: 0px 10px;
  background-color: #E9E8E6;
}

.paragraph-link {
  color: #529DF5;
  &:hover {
    text-decoration: underline;
  }
}

.relative {
  position: relative;
  .note {
    position: absolute;
    bottom: -28px;
    left: 0px;
  }
  .ml-0 {
    margin-left: 0px;
  }
}

.billctl {
  .panel-header {
    background-color: #fff;
  }
}
</style>
