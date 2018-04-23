<template>
  <div class="transcollect">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>交易汇总</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel down" style="background-color: rgba(0, 0, 0, 0)">
      <div class="panel-header panel-header__auto">
        <el-form :model="form" :rules="formrules" ref="form">
          <div class="panel-select-group">
            <!-- 交易时间 -->
            <div class="panel-select__wrapper">
              <span class="panel-select__desc">交易时间</span>
              <el-form-item prop="dateRangeValue">
                <el-date-picker
                  v-model="form.dateRangeValue"
                  type="daterange"
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
          <div class="panel-select-group">
            <!-- 门店分组 -->
            <div class="panel-select__wrapper" v-if="!role.single">
              <span class="panel-select__desc">门店分组</span>
              <el-form-item prop="fenzuid">
                <el-select v-model="form.fenzuid" :placeholder="lang==='en'? 'All':'全部'" size="small" @change="getShopList(form.fenzuid)">
                  <el-option v-for="group in grouplist" :label="group.group_name" :value="group.group_id" :key="group.group_id">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <!-- 门店 -->
            <div class="panel-select__wrapper" v-if="!role.single">
              <span class="panel-select__desc panel-select__desc2">门店</span>
              <el-form-item prop="selectShopUid">
                <el-select v-model="form.selectShopUid" :placeholder="lang==='en'? 'All':'全部'" size="small" @change="getOperators(form.selectShopUid)">
                  <el-option label="全部" value=""></el-option>
                  <el-option v-for="shop in shopData.list" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <!-- 收银员 -->
            <div class="panel-select__wrapper" v-if="!role.isCashier">
              <span class="panel-select__desc">操作账号</span>
              <el-form-item prop="operaValue">
                <el-select v-model="form.operaValue" placeholder="全部" size="small" @change="operaChange" :disabled="form.selectShopUid === ''">
                  <el-option label="全部" value=""></el-option>
                  <el-option label="门店主账户" value="vl"></el-option>
                  <el-option v-for="(label, value) in operaList" :label="label" :value="value" :key="value"></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
          <!-- 交易方式 -->
          <div class="panel-select-group down-btn">
            <div class="panel-select-down-btn" @click="changePullStatus()">
              <span>{{pullstatus}}</span>
              <i class="icon-right_arrow" :class="{'icon-down_arrow__rotate': pullflag}"></i>
            </div>
            <!-- 展开  收起 -->
            <transition name="collpase">
              <div v-if="pullflag" class="collpase">
                <!-- 交易方式 -->
                <div class="panel-select__wrapper">
                  <span class="panel-select__desc">交易方式</span>
                  <el-form-item prop="checkAll1">
                    <el-checkbox v-model="form.checkAll1" @change="handleCheckAllChange1">不限</el-checkbox>
                  </el-form-item>
                  <el-form-item prop="type">
                    <el-checkbox-group v-model="form.type" @change="handleCheckedCitiesChange1">
                      <el-checkbox v-for="item in typeList" :label="item.value" :key="item.value">{{ item.name }}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
                <!-- 交易类型 -->
                <div class="panel-select__wrapper">
                  <span class="panel-select__desc">交易类型</span>
                  <el-form-item prop="checkAll2">
                    <el-checkbox v-model="form.checkAll2" @change="handleCheckAllChange2">不限</el-checkbox>
                  </el-form-item>
                  <el-form-item prop="other">
                    <el-checkbox-group v-model="form.other" @change="handleCheckedCitiesChange2">
                      <el-checkbox v-for="item in otherList" :label="item.value" :key="item.value">{{ item.name }}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
              </div>
            </transition>
          </div>
          <!-- 按钮行 -->
          <div class="panel-select-group">
            <div class="panel-select-group-btn"></div>
            <div class="panel-select-group-btn" style="padding-left: 70px;">
              <div class="panel-header-btn" @click="search">
                <span class="el-icon-loading" v-if="loading"></span>
                <span v-else>查询</span>
              </div>
              <div class="panel-header-btn" @click="reset">重置</div>
              <div class="panel-header-btn"><a :href="collectHref" download style="color: #FE9B20; display: block; width: 100%;">导出</a></div>
            </div>
          </div>
        </el-form>
      </div>
      <div class="panel-body">
        <div class="panel-btn-group__wrapper panel-body-btn-group flex-normal">
          <div class="num_total">
            <div class="num_wrapper">
              <p class="num-title">订单金额</p>
              <p class="num-desc">{{ transData.sucamt | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">交易金额</p>
              <p class="num-desc">{{ transData.total_txamt | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">手续费</p>
              <p class="num-desc">{{ transData.total_fee | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">结算金额</p>
              <p class="num-desc">{{ transData.settle_amt | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">支付笔数</p>
              <p class="num-desc">{{ transData.sucnum || 0 }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">退款笔数</p>
              <p class="num-default">{{ transData.cancelnum || 0 }}</p>
            </div>
          </div>
        </div>
        <div style="padding: 10px 10px 0px; background-color:#fff;">
          <el-table
            :data="transData.data"
            row-class-name="el-table__row_fix"
            v-loading="loading" @cell-click="goDetail">
            <el-table-column prop="sysdtm" min-width="140" label="交易时间">
              <template scope="scope">{{ scope.row.date }}</template>
            </el-table-column>
            <el-table-column prop="sysdtm" label="交易方式">
              <template scope="scope">{{ scope.row.busicd_info}}</template>
            </el-table-column>
            <el-table-column
              prop="transtype"
              label="交易类型">
            </el-table-column>
            <el-table-column
              label="订单金额">
              <template scope="scope">
                <div class="table-content">{{ scope.row.total_amt | formatCurrency }}{{ role.currency }}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="交易金额">
              <template scope="scope">
                <div class="table-content">{{ scope.row.txamt | formatCurrency }}{{ role.currency }}</div>
              </template>
            </el-table-column>
            <el-table-column
              label="支付笔数">
              <template scope="scope">{{scope.row.sucnum}}</template>
            </el-table-column>
            <el-table-column
              label="退款笔数">
              <template scope="scope">{{ scope.row.cancel_num}}</template>
            </el-table-column>
            <el-table-column
              label="手续费">
              <template scope="scope">{{ scope.row.total_fee | formatCurrency}}</template>
            </el-table-column>
            <el-table-column
              label="结算金额">
              <template scope="scope">{{ scope.row.settle_amt | formatCurrency }}</template>
            </el-table-column>
            <el-table-column
              label="操作">
              <template scope="scope">
                <div>查询明细</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="pagination_wrapper" v-if="transData.num >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="transData.num"
          @current-change="currentChange"
          :current-page="currentPage">
        </el-pagination>
      </div>
      <div class="table_placeholder" style="background-color: #fff;" v-else></div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';
  import qs from 'qs';
  import {formatDate} from '../../common/js/util';
  import Store from '../../common/js/store';

  let typeLists = ['wxpay', 'alipay', 'qqpay', 'card'];
  let otherLists = ['success', 'cancel'];

  // cancel 0未撤销 1撤销 status  0:交易中 1:交易成功 2:交易失败 3:交易超时

  export default {
    data() {
      let checkOrderNo = (rule, val, cb) => {
        if(val && !/^\d+$/.test(val)) {
          cb('流水号必须为数字');
        } else if(val && !/\d{14}/.test(val)) {
          cb('交易流水号需要至少14位！');
        } else {
          cb();
        }
      };
      return {
        lang: config.lang,
        role: Store.get('role') || {},
        showConfirm: false,
        checkValue: {},
        formpwd: {
          pwd: ''
        },
        formSend: {
          email: ''
        },
        iconLoading: false,
        pageSize: 10,
        status: false,
        loading: false,
        typeList: [
          {'name': '微信', 'value': 'wxpay'},
          {'name': '支付宝', 'value': 'alipay'},
          {'name': 'QQ钱包', 'value': 'qqpay'},
          {'name': '刷卡', 'value': 'card'}
        ],
        otherList: [
          {'name': '支付', 'value': 'success'},
          {'name': '退款', 'value': 'cancel'}
        ],
        choosetimes: [
          {'name': '今天', 'value': '1'},
          {'name': '最近一周', 'value': '7'},
          {'name': '最近一个月', 'value': '30'},
          {'name': '最近三个月', 'value': '91'}
        ],
        grouplist: [],
        shopData: {},
        paramsInfo: {},
        form: {
          fenzuid: 'all',
          selectShopUid: '',
          orderno: null,
          dateRangeValue: '',
          operaValue: '',
          checkAll1: true,
          checkAll2: true,
          choosetime: '1',
          type: [],
          other: []
        },
        pullstatus: '展开',
        pullflag: false,
        currentPage: 1,
        operaList: {},
        transData: {},
        formrules: {
          orderno: [
            { validator: checkOrderNo, trigger: 'change' }
          ]
        },
        pwdrules: {
            pwd: [
              { required: true, message: '请输入账户密码' }
            ]
        }
      };
    },
    props: {
      shop: {
        type: Object
      }
    },

    computed: {
      collectHref() {
        let collectParmas = Object.assign({}, this.basicParams, {isdownload: true});
        return `${config.host}/merchant/trade/total/info?${qs.stringify(collectParmas)}`;
      },

      basicParams() {
        let str = '';
        if(!this.form.choosetime) {
          str = 'yyyy-MM-dd';
        }
        return {
          fenzu_id: this.form.fenzuid,
          userid: this.form.selectShopUid,
          opuid: this.form.operaValue,
          starttime: formatDate(this.form.dateRangeValue[0], str),
          endtime: formatDate(this.form.dateRangeValue[1], str),
          orderno: this.form.orderno,
          charset: 'utf-8',
          isdownload: false,
          page: this.currentPage,
          maxnum: this.pageSize,
          paytypes: this.form.type.join(','),
          filters: this.form.other.join(','),
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
      // 子商户查询其收银员
      if(this.role.single) {
        this.form.selectShopUid = this.shop.uid;
        this.getOperators(this.shop.uid);
      }
      // 包商收款方式特殊处理
      if(this.role.isBaoshang) {
          this.typeList = [
          {'name': '微信', 'value': 'wxpay'},
          {'name': '支付宝', 'value': 'alipay'}
        ];
        typeLists = ['wxpay', 'alipay'];
      }

      // 门店分组数据
      if (!this.role.single) {
        this.getGroupList();
      }
      // 交易数据
      this.getTransData();
    },

    methods: {
      getGroupList () {
        axios.get(`${config.host}/merchant/group/list`).then((res) => {
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.grouplist = data.data;
              this.getShopList('all');
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.$message.error('获取门店分组信息失败');
          });
      },
      getShopList (fenzuid) {
        this.form.selectShopUid = ''
        axios.get(`${config.host}/merchant/group/sublist`, {
          params: {
            fenzu_id: fenzuid
          }
        }).then((res) => {
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.shopData = data.data;
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.$message.error('获取门店信息失败');
          });
      },
      goDetail (row, column, cell, event) {
        if (column.label === '操作') {
          let data = {}
          data.date = row.date
          data.fenzu_id = this.paramsInfo.fenzu_id
          data.userid = this.paramsInfo.userid
          data.opuid = this.paramsInfo.opuid
          data.paytypes = this.paramsInfo.paytypes
          data.filters = this.paramsInfo.filters
          this.$router.replace({ name: 'transdetail', params: data });
        }
      },
      // 展开交易类型
      changePullStatus() {
        this.pullflag = !this.pullflag
        if (this.pullflag) {
          this.pullstatus = '收起'
        } else {
          this.pullstatus = '展开'
        }
      },
      // 关闭弹出层
      handleClose(form) {
        this.$refs[form] && this.$refs[form].resetFields();
      },

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

      // check选择功能
      handleCheckAllChange1(event) {
        this.form.type = event.target.checked ? [] : typeLists;
      },

      handleCheckedCitiesChange1(value) {
        let checkCount = value.length;
        this.form.checkAll1 = !(checkCount > 0);
      },

      handleCheckAllChange2(event) {
        this.form.other = event.target.checked ? [] : otherLists;
      },

      handleCheckedCitiesChange2(value) {
        let checkCount = value.length;
        this.form.checkAll2 = !(checkCount > 0);
      },

      // 点击查询
      search() {
        this.handleSizeChange();
      },

      // 获取数据
      getTransData() {
        if(!this.loading) {
          this.loading = true;
          axios.get(`${config.host}/merchant/trade/total/info`, {
            params: this.basicParams
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.transData = data.data;
              this.paramsInfo = data.data.param_info;
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.loading = false;
            this.$message.error('获取交易数据失败');
          });
        }
      },

      operaChange(opuid) {
        this.basicParams.opuid = opuid;
      },

      // 查询收银员列表
      getOperators(uid) {
        this.form.operaValue = '';
        axios.get(`${config.host}/merchant/sub/opusers`, {
            params: {
              userid: uid
            }
          }).then((res) => {
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.operaList = data.data;
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.$message.error('获取收银员信息失败');
          });
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
        this.pullflag = false
      },

      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange();
      },
      paytype (type) {
        let paytype = ''
        for (var i = 0; i < this.typeList.length; i++) {
          if (type === this.typeList[i].name) {
            paytype = this.typeList[i].value
          }
        }
        return paytype
      },
      filters (type) {
        let filters = ''
        for (var i = 0; i < this.otherList.length; i++) {
          if (type === this.otherList[i].name) {
            filters = this.otherList[i].value
          }
        }
        return filters
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
  .panel {
    margin: 23px 25px 23px;
    .panel-header {
      border-bottom: none;
    }

    .panel-header__auto {
      position: relative;
      height: auto !important;
      padding: 25px 0 10px 20px;
    }

    .panel-select-input__fix {
      width: auto;
    }

    .pagination_wrapper {
      background-color: #fff;
    }
    .icon-down_arrow__rotate {
      transform: rotateZ(90deg);
    }
    .el-form-item__content {
      .el-checkbox-group{
        display: inline-block;
        .el-checkbox{
          margin-left: 15px;
        }
      }
    }
  }
  .down {
    .panel-body {
      padding: 0;
      margin-top: 10px;

      .panel-body-btn-group {
        margin: 10px 0px 0px;
      }
      table {
        width: auto;
      }
    }
    .panel-select-group {
      margin-bottom: 10px;
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
      font-size: 15px;
    }
    .num_total {
      width: 100%;
      text-align: center;
      display: flex;
      height: 105px;
      align-items: center;
      padding: 0 20px;
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
        margin-left: 0!important;
        position: relative;
        flex: 1;
        &::after {
          position: absolute;
          top: 6px;
          right: 0;
          content: '';
          height: 48px;
          width: 1px;
          border-right: 1px solid #EAE9EA;
        }
        &:last-child {
          &::after {
            border-right: none;
          }
        }
      }
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
  .panel-select-group-btn {
    width: 50%;
    display: flex;
    justify-content: center;
    .panel-header-btn {
      margin-left: 15px;
    }
  }
  .el-form-item {
    margin-bottom: 0px;
  }

  .mr-16 {
    margin-right: 30px !important;
  }
  .flex-normal {
    justify-content: space-between;
    border-top: 2px solid #FE9B20;
    background-color: #fff;
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
      height: 70px;
    }
  }
  @keyframes expand-leave {
    0% {
      height: 70px;
    }

    100% {
      height: 0px;
    }
  }
</style>
