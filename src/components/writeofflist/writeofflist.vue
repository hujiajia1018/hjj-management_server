<template lang="html">
  <div>
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>卡券管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品券核销明细</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel down1">
      <div class="panel-header panel-header__auto">
        <el-form :model="form" ref="form" :formrules="formrules">
          <div class="panel-select-group">
            <!-- 交易时间 -->
            <div class="panel-select__wrapper">
              <span class="panel-select__desc">时间</span>
              <el-form-item prop="dateRangeValue">
                <el-date-picker
                  v-model="form.dateRangeValue"
                  type="datetimerange"
                  :editable="false"
                  placeholder="选择日期范围"
                  size="small"
                  :clearable="false">
                </el-date-picker>
              </el-form-item>
            </div>
            <!-- 时间选择 -->
            <div class="panel-select__wrapper">
              <el-form-item prop="choosetime">
                <el-radio-group v-model="form.choosetime" @change="changeTime">
                  <el-radio-button v-for="item in choosetimes" :label="item.value" :key="item.value">{{ item.name }}</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
          <!-- 券码查询 -->
          <div class="panel-select-group">
            <div class="panel-select__wrapper orderno_nowrap">
              <span class="panel-select__desc">券码查询</span>
              <el-form-item prop="ticket_code">
                <el-input v-model="form.ticket_code" type="number" size="small" class="panel-select-input-310"></el-input>
              </el-form-item>
            </div>
          </div>
          <div class="panel-select-group" style="padding-bottom: 10px;">
            <div class="panel-select__wrapper orderno_nowrap">
              <span class="panel-select__desc">商品名称</span>
              <el-form-item prop="ticket_name">
                <el-input v-model="form.ticket_name" type="text" size="small" class="panel-select-input-200"></el-input>
              </el-form-item>
            </div>
            <div class="panel-select__wrapper orderno_nowrap">
              <span class="panel-select__desc">核销交易号</span>
              <el-form-item prop="writeoff_syssn">
                <el-input v-model="form.writeoff_syssn" type="number" size="small" class="panel-select-input-200"></el-input>
              </el-form-item>
            </div>
            <div class="panel-select__wrapper orderno_nowrap">
              <span class="panel-select__desc">商品订单号</span>
              <el-form-item prop="goods_syssn">
                <el-input v-model="form.goods_syssn" type="number" size="small" class="panel-select-input-200"></el-input>
              </el-form-item>
            </div>
          </div>
          <!-- 按钮行 -->
          <div class="panel-select-group">
            <div class="panel-select-group-btn" style="padding-left: 70px;"></div>
            <div class="panel-select-group-btn">
              <el-button type="primary" style="width:102px;" class="primary-btn" @click="search()">搜索</el-button>
              <div class="panel-header-btn" @click="reset()">重置</div>
            </div>
          </div>
        </el-form>
      </div>
      <div class="panel-body">
        <el-table
          :data="transData.records"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          v-loading="loading">
          <el-table-column prop="sysdtm" min-width="100px" label="时间">
            <template scope="scope">{{ scope.row.create_time }}</template>
          </el-table-column>
          <el-table-column
            prop="trade_id"
            min-width="130"
            label="核销交易号">
          </el-table-column>
          <el-table-column
            label="券码">
            <template scope="scope">{{ scope.row.ticket_code }}</template>
          </el-table-column>
          <el-table-column
            label="商品订单号">
            <template scope="scope">{{ scope.row.order_id }}</template>
          </el-table-column>
          <el-table-column
            label="商品名称">
            <template scope="scope">{{ scope.row.goods_name}}</template>
          </el-table-column>
          <el-table-column
            label="交易状态">
            <template scope="scope">
              <div>{{ scope.row.status_str}}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="门店">
            <template scope="scope">
              <div>{{ scope.row.shop_name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作员">
            <template scope="scope">{{ scope.row.userid }}</template>
          </el-table-column>
          <el-table-column label="订单金额">
            <template scope="scope">{{ scope.row.current_price | formatCurrency }}元</template>
          </el-table-column>
          <el-table-column label="平台补贴"  min-width="60px">
              <template scope="scope">{{ scope.row.koubei_subsidy_amt | formatCurrency }}元</template>
          </el-table-column>
          <el-table-column
            label="商家实收" min-width="60px">
            <template scope="scope">{{ scope.row.receipt_amt | formatCurrency }}元</template>
          </el-table-column>
          <el-table-column
            label="商家优惠">
            <template scope="scope">{{ scope.row.discount_amt | formatCurrency }}元</template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="transData.total >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="transData.total"
          @current-change="currentChange"
          :current-page="currentPage">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';
  // import qs from 'qs';
  import {formatDate} from '../../common/js/util';
  import Store from '../../common/js/store';

  // cancel 0未撤销 1撤销 status  0:交易中 1:交易成功 2:交易失败 3:交易超时

  export default {
    data() {
      let checkOrderNo = (rule, val, cb) => {
        if(val && !/^\d+$/.test(val)) {
          cb('流水号必须为数字');
        } else {
          cb();
        }
      };
      return {
        lang: config.lang,
        role: Store.get('role') || {},
        showConfirm: false,
        showTotal: false,
        iconLoading: false,
        pageSize: 10,
        status: false,
        loading: false,
        choosetimes: [
          {'name': '今天', 'value': '1'},
          {'name': '昨天', 'value': '2'},
          {'name': '近7天', 'value': '7'},
          {'name': '近30天', 'value': '30'}
        ],
        form: {
          dateRangeValue: [],
          choosetime: '1',
          ticket_code: '',
          ticket_name: '',
          writeoff_syssn: '',
          goods_syssn: ''
        },
        currentPage: 1,
        transData: {},
        formrules: {
          ticket_code: [
            { validator: checkOrderNo, trigger: 'change,blur' }
          ]
        }
      };
    },

    computed: {
      basicParams() {
        let str = 'yyyy-MM-dd HH:mm:ss';
        return {
          trade_id: this.form.writeoff_syssn,
          order_id: this.form.goods_syssn,
          ticket_code: this.form.ticket_code,
          ticket_name: this.form.ticket_name,
          start_time: formatDate(this.form.dateRangeValue[0], str),
          end_time: formatDate(this.form.dateRangeValue[1], str),
          charset: 'utf-8',
          offset: this.currentPage,
          limit: this.pageSize,
          lang: this.lang,
          format: 'cors'
        };
      }
    },
    watch: {
      'form.dateRangeValue': function(val) {
        if(!this.status) {
          this.form.choosetime = '';
        }
        this.status = false;
      }
    },
    created() {
      this.changeTime('1');
      this.getTransData();
    },

    methods: {
      // 选择时间
      changeTime(value) {
        if(value) {
          this.status = true;
          let end = new Date();
          let start = new Date(end.getTime() - 3600 * 1000 * 24 * (value - 1));

          if(value == 2) {
              end = new Date(end.getTime() - 3600 * 1000 * 24);
          }

          start.setHours(0);
          start.setMinutes(0);
          start.setSeconds(0);

          if(value != 1) {
            end.setHours(23);
            end.setMinutes(59);
            end.setSeconds(59);
          }
          this.form.dateRangeValue = [start, end];
        }
      },
      // 点击查询
      search() {
        this.$refs['form'].validate((valid) => {
          if(valid) {
            this.handleSizeChange();
          }
        })
      },

      // 获取数据
      getTransData() {
        let data = this.basicParams
        // let baseUrl = 'http://172.100.113.124:9092'
        // config.host
        if(!this.loading) {
          this.loading = true;
          axios.get(`${config.host}/merchant/koubei/ticket/record`, {
            params: data
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.transData = data.data;
              if (this.transData.records === []) {
                this.$message.error('查询信息有误，该券不存在')
              }
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('获取数据失败');
          });
        }
      },

      currentChange(current) {
        if (!current && this.currentPage !== 1) {
          this.currentPage = 1;
          return;
        }
        if (current) {
          this.currentPage = current;
        }

        this.getTransData();
      },
      // 重置表单
      reset() {
        this.status = true;
        this.$refs['form'].resetFields();
      },

      handleSizeChange(size = 10) {
        this.pageSize = size
        this.currentChange()
      }
    }
  };
</script>

<style lang="scss" scoped>
  .el-table__row_fix {
    height: 62px;
    min-height: 62px;
    color: #282A2D;
  }

  .down1 {
    .panel-select-group {
      margin-bottom: 15px;
      position: relative;

      .orderno_nowrap .el-form-item__error {
        overflow: visible;
        white-space: nowrap;
      }
      .panel-select__desc {
        width: 80px!important;
      }
      .panel-select__desc2 {
        width: 50px!important;
      }
      .el-checkbox__label {
        color: #090909;
      }
    }
    .down-btn {
      align-items: flex-start;
    }
    .table-title {
      font-size: 16px;
      font-weight: 500;
    }
    .table-content {
      font-size: 12px;
    }
    .num_total {
      text-align: center;
      display: flex;
      p {
        height: 30px;
        line-height: 30px;
      }
      .num-title {
        font-size: 15px;
      }
      .num-desc {
        font-size: 18px;
        color: #FF8100;
        font-weight: bold;
      }
      .num-default {
        font-size: 18px;
        color: #8A8C92;
        font-weight: bold;
      }
      .num_wrapper {
        margin-left: 30px;
      }
    }
  }
  .panel {
    margin: 23px 25px 23px;

    .panel-header {
      border-bottom: none;
      background-color: #fff;
    }

    .panel-header__auto {
      position: relative;
      height: auto !important;
      padding: 25px 0 10px 20px;
    }

    .panel-select-group__fix {
      margin-bottom: 15px;

    }
    .el-form-item__content {
      .el-checkbox-group{
        display: inline-block;
        .el-checkbox{
          margin-left: 15px;
        }
      }
    }

    .pagination_wrapper {
      background-color: #fff;
    }
    .icon-down_arrow__rotate {
      transform: rotateZ(90deg);
    }
  }

  .panel-select-group-btn {
    width: 50%;
    display: flex;
    justify-content: center;
    .primary-btn {
    font-size: 17px;
    }
    .panel-header-btn {
      margin-left: 15px;
    }
  }

  .panel-select-down-btn {
    width: 60px;
    display: flex;
    margin-right: 20px;
    padding-top: 10px;
    justify-content: space-between;
    i {
      color: gray;
    }
  }
  .el-form-item {
    margin-bottom: 0px;
  }
  .panel-select-input-310 {
    width: 310px;
    .el-input__inner {
      width: 310px!important;
    }
  }
  .mr-16 {
    margin-right: 30px !important;
  }
  .flex-normal {
    justify-content: space-between;
  }

  .el-dropdown-menu {
    padding: 0;
    .download_detail {
      background-color: #fff;
      color: #262323;
      &:link,&:visited,&:hover,&:active {
        color: #FFF;
        background-color: darken(#7ED321, 5%);
      }
    }
  }

  .el-select {
    width: 206px;
  }

  .icon-right_arrow {
    font-size: 14px;
    right: 16px;
    top: 17px;
    transform-origin: center center;
    transition: .3s cubic-bezier(.33,.48,.74,.86);
  }

  .collpase {
    overflow: hidden;
  }
  .collpase-enter-active {
    animation: expand-enter .4s;
  }
  .collpase-leave-active {
    animation: expand-leave .4s;
  }

  @keyframes expand-enter {
    0% {
      height: 0px;
    }

    100% {
      height: 35px;
    }
  }
  @keyframes expand-leave {
    0% {
      height: 35px;
    }

    100% {
      height: 0px;
    }
  }
  .dialog_detail{
    text-align: center;
  }

  .detail_body {
    border-top: 1px solid #F5A623;
    padding: 20px 0 0 ;
    .table1 {
      width: 100%;
    }
    .table_tr {
      height: 35px;
      line-height: 35px;
      color: #9B9B9B;
      font-size: 14px;
    }
    .table_td {
      span:first-child {
        display: inline-block;
        width: 70px;
        padding-right: 15px;
        text-align:center;
        text-align:justify;
        text-justify:distribute-all-lines;
        text-align-last:justify;
      }
      span:last-child {
        color: #262424;
      }
    }

    .table_td1 {
      width: 70%;
    }
    .table_td2 {
      width: 30%;
    }
    .panel-header-btn-fill {
      width: 107px;
      height: 40px;
      background-color: #FE9B20;
      color: #fff;
      text-align: center;
      line-height: 40px;
    }

    .fieldset-border {
      border: 1px solid #DEDEDE;
      border-radius: 5px;
      padding-top: 20px;
      .table2 {
        width: 100%;
        table-layout: fixed;
        tr {
          line-height: 30px;
        }
        td {
        text-align: center
        }
        .syssn-td {
          word-wrap: break-word;
          padding: 0 10px;
        }
      }
    }
    .fieldset-title {
      font-size: 16px;
      color: #262424;
      text-align: center;
      padding: 0 40px;
    }
  }

  .el-dialog {
    border-radius: 5px;
  }
  .detail_title {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px 0;
    span {
      display: block;
      font-size: 14px;
      display: flex;
      align-items: center;
      color: #262424;
      &:first-child {
        font-size: 20px;
      }
    }
  }
  .detail_footer {
    display: flex;
    justify-content: center;
    padding-bottom: 15px;
    .close-btn {
      width: 100px;
      height: 32px;
      border: none;
      background-color: #FE9B20;
      color: #fff;
      &:hover {
        background-color: #F2A749;
      }
    }
  }
</style>
