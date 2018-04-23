<template>
  <div class="transctl">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel down">
      <div class="panel-header panel-header__auto">
        <el-form :model="form" :rules="formrules" ref="form">
          <div class="panel-select-group">
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
            <div class="panel-select__wrapper">
              <el-form-item prop="choosetime">
                <el-radio-group v-model="form.choosetime" @change="changeTime">
                  <el-radio-button v-for="item in choosetimes" :label="item.value" :key="item.value">{{ item.name }}</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>
          <div class="panel-select-group">
            <div class="panel-select__wrapper" v-if="!role.single">
              <span class="panel-select__desc">店铺名称</span>
              <el-form-item prop="selectShopUid">
                <el-select v-model="form.selectShopUid" placeholder="全部" size="small" @change="getOperators(form.selectShopUid)">
                  <el-option v-for="shop in shopData.list" :label="shop.shop_name" :value="shop.uid" :key="shop.uid">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <div class="panel-select__wrapper" v-if="!role.isCashier">
              <span class="panel-select__desc">收银员</span>
              <el-form-item prop="operaValue">
                <el-select v-model="form.operaValue" placeholder="全部" size="small" @change="operaChange" :disabled="form.selectShopUid === ''">
                  <el-option label="全部" value=""></el-option>
                  <el-option v-for="(label, value) in operaList" :label="label" :value="value" :key="value"></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
          <div class="panel-select-group">
            <div class="panel-select__wrapper">
              <span class="panel-select__desc">收款方式</span>
              <el-form-item prop="checkAll1">
                <el-checkbox v-model="form.checkAll1" @change="handleCheckAllChange1">不限</el-checkbox>
              </el-form-item>
              <el-form-item prop="type">
                <el-checkbox-group v-model="form.type" @change="handleCheckedCitiesChange1">
                  <el-checkbox v-for="item in typeList" :label="item.value" :key="item.value">{{ item.name }}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>
          </div>
          <div class="panel-select-group">
            <div class="panel-select__wrapper">
              <span class="panel-select__desc">更多筛选</span>
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

          <div class="panel-select-group">
            <div class="panel-select__wrapper orderno_nowrap">
              <span class="panel-select__desc">流水号</span>
              <el-form-item prop="orderno">
                <el-input v-model="form.orderno" type="number" placeholder="请输入流水号" size="small" class="panel-select-input__fix panel-select-input-220"></el-input>
              </el-form-item>
            </div>
            <div class="panel-header-btn-group">
              <div class="panel-header-btn panel-header-btn__fill" @click="search">
                <span class="el-icon-loading" v-if="loading"></span>
                <span v-else>查询</span>
              </div>
              <div class="panel-header-btn transctl-btn" @click="reset">重置</div>
            </div>
          </div>
        </el-form>
      </div>
      <div class="panel-body">
        <div class="panel-btn-group__wrapper panel-body-btn-group flex-normal">
          <div class="num_total">
            <div class="num_wrapper">
              <p class="num-title">交易总金额</p>
              <p class="num-desc">{{ transData.sucamt | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">交易实收</p>
              <p class="num-desc">{{ transData.total_txamt | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">红包优惠</p>
              <p class="num-desc">{{ transData.coupon_amt | formatNumber }} {{ role.currency }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">成功交易笔数</p>
              <p class="num-desc">{{ transData.sucnum || 0 }}</p>
            </div>
            <div class="num_wrapper">
              <p class="num-title">撤销笔数</p>
              <p class="num-default">{{ transData.cancelnum || 0 }}</p>
            </div>
          </div>
          <div class="a-wrapper">
            <el-dropdown>
              <span class="el-dropdown-link"><img src="./img/download.png" alt="download"></span>
              <el-dropdown-menu slot="dropdown">
                <a :href="detailHref" download class="downDetail"><el-dropdown-item command=1>下载交易明细</el-dropdown-item></a>
                <a href="javascript:;" @click="downCollection"><el-dropdown-item command=2>下载交易汇总</el-dropdown-item></a>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <el-table
          :data="transData.data"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          v-loading="loading">
          <el-table-column
            label="店铺名称">
            <template scope="scope">
              <div>{{ scope.row.username }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="收银员">
            <template scope="scope">{{ scope.row.opuser || '-' }}</template>
          </el-table-column>
          <el-table-column
            prop="busicd_info"
            label="交易类型">
          </el-table-column>
          <el-table-column prop="sysdtm" min-width="150" label="交易时间">
            <template scope="scope">{{ scope.row.sysdtm }}</template>
          </el-table-column>
          <el-table-column
            label="交易金额">
            <template scope="scope">
              <div class="table-title">{{ scope.row.total_amt | formatCurrency }}{{ role.currency }}</div>
              <div class="table-content">实收{{ scope.row.txamt | formatCurrency }}{{ role.currency }}</div>
              <div v-show="scope.row.mchnt_coupon" class="table-content">商家红包{{ scope.row.mchnt_coupon | formatCurrency }}{{ role.currency }}</div>
              <div v-show="scope.row.hj_coupon" class="table-content">平台补贴{{ scope.row.hj_coupon | formatCurrency }}{{ role.currency }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="status_str"
            label="交易状态">
          </el-table-column>
          <el-table-column
            prop="syssn"
            min-width="210"
            label="流水号">
          </el-table-column>
          <el-table-column min-width="100" label="操作" v-if="role.single">
            <template scope="scope">
              <el-button type="text" size="small" :disabled="scope.row.cancel !== 0 || scope.row.status !== 1" class="el-button__fix" @click="confirm(scope.row)">撤销</el-button>
            </template>
          </el-table-column>
        </el-table>
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
      <div class="table_placeholder" v-else></div>
    </div>

    <el-dialog title="提示" :visible.sync="showConfirm" custom-class="mydialog" top="20%"
               :show-close="false" @close="handleClose('formpwd')">
      <div style="margin-bottom: 20px;">若要撤销交易，请输入账户登录密码以确认操作</div>
      <el-form :model="formpwd" :rules="pwdrules" ref="formpwd">
        <el-form-item prop="pwd">
          <el-input v-model="formpwd.pwd" placeholder="请输入账户密码" type="password" @keyup.enter.native="onEnter"></el-input>
        </el-form-item>
      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="checkPwd" class="submit">
          <span class="el-icon-loading" v-if="iconLoading"></span>
          <span v-else>确 定</span>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="交易流水Excel下载" :visible.sync="showTotal" custom-class="mydialog extra" top="20%" @close="handleClose">
      <div style="margin-bottom: 20px;">检测到门店有收银员角色，交易汇总是否要区分收银员？</div>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer total-footer">
        <div class="separate" @click="showTotal = false">
          <a :href="separateHref" download id="separate">区分收银员</a>
        </div>
        <div class="submit" @click="showTotal = false">
          <a :href="mergeHref" download>合并收银员</a>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios';
  import config from 'config';
  import qs from 'qs';
  import {formatDate} from '../../common/js/util';
  import Store from '../../common/js/store';

  let typeLists = ['wxpay', 'alipay', 'qqpay', 'card'];
  let otherLists = ['prepaid_recharge', 'prepaid', 'coupon', 'cancel'];

  // cancel 0未撤销 1撤销 status  0:交易中 1:交易成功 2:交易失败 3:交易超时

  export default {
    data() {
      let checkOrderNo = (rule, val, cb) => {
        if(val && !/^\d+$/.test(val)) {
          cb('流水号必须为数字');
        } else if(val && !/\d{14}/.test(val)) {
          cb('交易流水号需要至少14位');
        } else {
          cb();
        }
      };
      return {
        role: Store.get('role') || {},
        showConfirm: false,
        showTotal: false,
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
          {'name': '微信收款', 'value': 'wxpay'},
          {'name': '支付宝收款', 'value': 'alipay'},
          {'name': 'QQ收款', 'value': 'qqpay'},
          {'name': '刷卡收款', 'value': 'card'}
        ],
        otherList: [
          {'name': '储值充值', 'value': 'prepaid_recharge'},
          {'name': '储值消费', 'value': 'prepaid'},
          {'name': '红包优惠', 'value': 'coupon'},
          {'name': '撤销明细', 'value': 'cancel'}
        ],
        choosetimes: [
          {'name': '今天', 'value': '1'},
          {'name': '昨天', 'value': '2'},
          {'name': '近7天', 'value': '7'},
          {'name': '近30天', 'value': '30'}
        ],
        form: {
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
      mergeHref() {
        let collectParmas = Object.assign({}, {combine_opuser: 1}, this.basicParams);
        return `${config.host}/merchant/trade/total?${qs.stringify(collectParmas)}`;
      },
      separateHref() {
        let collectParmas = Object.assign({}, {combine_opuser: 0}, this.basicParams);
        return `${config.host}/merchant/trade/total?${qs.stringify(collectParmas)}`;
      },

      detailHref() {
        let detailParmas = Object.assign({}, this.basicParams, {isdownload: true});
        return `${config.host}/merchant/trade/download?${qs.stringify(detailParmas)}`;
      },

      shopData() {
        return this.$store.state.shopData;
      },
      basicParams() {
        let str = '';
        if(!this.form.choosetime) {
          str = 'yyyy-MM-dd HH:mm:ss';
        }
        return {
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
          lang: 'zh-CN',
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
          {'name': '微信收款', 'value': 'wxpay'},
          {'name': '支付宝收款', 'value': 'alipay'}
        ];
        typeLists = ['wxpay', 'alipay'];
      }

      this.getTransData();
    },

    methods: {
      // 关闭弹出层
      handleClose(form) {
        this.$refs[form] && this.$refs[form].resetFields();
      },

      // 点击下载交易汇总
      downCollection() {
        let oper = Object.entries(this.operaList);
        if(!this.form.operaValue && oper.length > 0) {
          this.showTotal = true;
        }else {
          document.querySelector('#separate').click();
        }
      },

      // 撤销操作
      revoke() {
        let val = this.checkValue;
        let params = {
          format: 'cors',
          txamt: val.total_amt,
          txdtm: formatDate(val.sysdtm, 'yyyy-MM-dd HH:mm:ss'),
          syssn: val.syssn,
          out_trade_no: Date.now(),
          udid: 'bigmerchant'
        };
        axios.post(`${config.payHost}/trade/v1/refund`, qs.stringify(params), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((res) => {
          this.iconLoading = false;
          let data = res.data;
          if (data.respcd === config.code.OK) {
            this.$message({
              type: 'success',
              message: '撤销成功'
            });

            this.showConfirm = false;

            this.getTransData();

          } else {
            this.$message.error(data.resperr);
          }
        }).catch((res) => {
          this.iconLoading = false;
          this.$message.error('撤销失败');
        });
      },

      // 点击enter键提交
      onEnter() {
        this.checkPwd();
      },

      // 验证密码
      checkPwd() {
        this.$refs['formpwd'].validate((valid) => {
          if (valid && !this.iconLoading) {
            this.iconLoading = true;
            axios.post(`${config.host}/merchant/validate_password`, {
              password: this.formpwd.pwd,
              format: 'cors'
            }).then((res) => {
              let data = res.data;
              if (data.data.result === 'success') {
                this.revoke();
              } else {
                this.iconLoading = false;
                this.$message.error('密码不正确');
              }
            }).catch(() => {
              this.iconLoading = false;
              this.$message.error('网络错误');
            })
          }

        })
      },

      // 确认弹框
      confirm(val) {
        if(this.role.isCashier) {
          this.cheekRefund(val);
        }else {
          this.checkValue = val;
          this.showConfirm = true;
        }
      },

      // 验证收银员退款权限
      cheekRefund(value) {
        axios.get(`${config.ohost}/mchnt/opuser/perms?format=cors`).then((res) => {
          let data = res.data;
          if(data.respcd === config.code.OK) {
            let response = data.data || {};
            if(response.refund === 1) {
              this.checkValue = value;
              this.showConfirm = true;
            }else {
              this.$message.error('您暂无权限执行此操作');
            }
          } else {
            this.$message.error(data.resperr);
          }
        }).catch(() => {
          this.$message.error('网络错误');
        });
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
          axios.get(`${config.host}/merchant/trade/info`, {
            params: this.basicParams
          }).then((res) => {
            this.loading = false;
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.transData = data.data;
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
      },

      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange();
      }
    }
  };
</script>

<style lang="scss">
  .el-table__row_fix {
    height: 62px;
    min-height: 62px;
    color: #282A2D;
  }

  .panel-header__auto {
    position: relative;
    height: auto !important;
    padding: 25px 0;
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
  .panel-select-input__fix {
    width: auto;
  }

  .down{
    .panel-header {
      background-color: #fff;
    }
    .panel-select-group {
      margin-bottom: 10px;
      position: relative;

      .orderno_nowrap .el-form-item__error {
        overflow: visible;
        white-space: nowrap;
      }
      .panel-select__desc {
        width: 120px;
        margin: 0;
      }
      .el-input__inner {
        width: 220px;
      }
      .el-checkbox__label {
        color: #090909;
      }
    }
    .panel-header__auto {
      padding-bottom: 10px;
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
    .a-wrapper {
      margin-right: 30px;
      .el-dropdown-link {
        img {
          padding: 5px;
          border: 1px solid #7ED321;
          cursor: pointer;
        }
      }
    }
  }
  .el-form-item {
    margin-bottom: 0px;
  }
  .panel-select-input-220 {
    width: 220px;
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
</style>
