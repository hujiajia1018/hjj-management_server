<template>
  <div class="transcollect">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>交易管理</el-breadcrumb-item>
        <el-breadcrumb-item>交易明细</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel down1">
      <div class="panel-header panel-header__auto">
        <el-form :model="form" :rules="formrules" ref="form">
          <div class="panel-select-group">
            <!-- 交易时间 -->
            <div class="panel-select__wrapper">
              <span class="panel-select__desc">交易时间</span>
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
          <!-- 流水号 -->
          <div class="panel-select-group">
            <div class="panel-select__wrapper orderno_nowrap">
              <span class="panel-select__desc">订单流水号</span>
              <el-form-item prop="orderno">
                <el-input v-model="form.orderno" type="number" placeholder="请输入订单流水号" size="small" class="panel-select-input-310"></el-input>
              </el-form-item>
            </div>
          </div>
          <!-- 门店分组 -->
          <div class="panel-select-group">
            <!-- 门店分组 -->
            <div class="panel-select__wrapper" v-if="!role.single">
              <span class="panel-select__desc">门店分组</span>
              <el-form-item prop="fenzuid">
                <el-select v-model="form.fenzuid" :placeholder="'全部'" size="small" @change="getShopList(form.fenzuid)">
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
                <el-select v-model="form.operaValue" placeholder="全部" size="small" @change="operaChange" :disabled="form.selectShopUid === '' && !role.single">
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
              <span>{{ pullflag ? '收起' : '展开'}}</span>
              <i class="icon-right_arrow" :class="{'icon-down_arrow__rotate': pullflag}"></i>
            </div>
            <!-- 展开  收起 -->
            <transition name="collpase">
              <div v-if="pullflag" class="collpase">
                <!-- 交易方式  -->
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
            <div class="panel-select-group-btn" style="padding-left: 70px;"></div>
            <div class="panel-select-group-btn">
              <div class="panel-header-btn" @click="search">
                <span class="el-icon-loading" v-if="loading"></span>
                <span v-else>查询</span>
              </div>
              <div class="panel-header-btn" @click="reset">重置</div>
              <div class="panel-header-btn"><a :href="detailHref" download style="color: #FE9B20; display: block; width: 100%;">导出</a></div>
            </div>
          </div>

        </el-form>
      </div>
      <div class="panel-body">
        <el-table
          :data="transData.data"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          v-loading="loading"  @row-click='handleRowHandle'>
          <el-table-column prop="sysdtm" min-width="100px" label="交易时间">
            <template scope="scope">{{ scope.row.sysdtm }}</template>
          </el-table-column>
          <el-table-column
            prop="syssn"
            min-width="130"
            label="订单流水号">
          </el-table-column>
          <el-table-column
            label="门店分组">
            <template scope="scope">{{ scope.row.fenzu_name }}</template>
          </el-table-column>
          <el-table-column
            label="门店">
            <template scope="scope">{{ scope.row.username }}</template>
          </el-table-column>
          <el-table-column
            label="操作账号">
            <template scope="scope">{{ scope.row.opuser}}</template>
          </el-table-column>
          <el-table-column
            label="订单金额">
            <template scope="scope">
              <div>{{ scope.row.total_amt | formatCurrency }}{{ role.currency }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="交易金额">
            <template scope="scope">
              <div>{{ scope.row.txamt | formatCurrency }}{{ role.currency }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="sysdtm" label="交易方式">
            <template scope="scope">{{ scope.row.busicd_info }}</template>
          </el-table-column>
          <el-table-column
            prop="trantype"
            label="交易类型">
          </el-table-column>
          <el-table-column
            prop="status_str" label="订单状态"  min-width="60px">
          </el-table-column>
          <el-table-column
            label="手续费" min-width="60px">
            <template scope="scope">{{ scope.row.settlefee | formatCurrency }}</template>
          </el-table-column>
          <el-table-column
            label="结算金额">
            <template scope="scope">{{ scope.row.settle_amt | formatCurrency }}</template>
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

    <!-- 交易明细弹框 -->
    <el-dialog :visible.sync="showDetail" custom-class="dialog_detail" :show-close="false">
      <div class="detail_title" slot="title">
        <span>订单详情</span>
        <span>{{detailInfo.sysdtm}}</span>
      </div>
      <div class="detail_body">
        <div style="padding: 0 20px 10px;">
          <table class="table1">
            <tr class="table_tr">
              <td class="table_td table_td1">
                <span>订单流水号</span>
                <span>{{detailInfo.syssn}}</span>
              </td>
              <td class="table_td table_td2">
                <span>交易类型</span>
                <span>{{ detailInfo.trantype }}</span>
              </td>
            </tr>
            <tr class="table_tr" style="border-bottom: 1px dashed #DEDEDE">
              <td class="table_td table_td1">
                <span>订单状态</span>
                <span>{{ detailInfo.status_str }}</span>
              </td>
              <td class="table_td table_td2">
                <span>交易方式</span>
                <span>{{ detailInfo.busicd_info }}</span>
              </td>
            </tr>
            <tr class="table_tr">
              <td class="table_td table_td1">
                <span>门店分组</span>
                <span>{{ detailInfo.fenzu_name}}</span>
              </td>
              <td class="table_td table_td2">
                <span>订单金额</span>
                <span>{{detailInfo.total_amt | formatNumber}}</span>
              </td>
            </tr>
            <tr class="table_tr">
              <td class="table_td table_td1">
                <span>省份</span>
                <span>{{detailInfo.province}}</span>
              </td>
              <td class="table_td table_td2">
                <span>交易金额</span>
                <span>{{detailInfo.txamt | formatNumber}}</span>
              </td>
            </tr>
            <tr class="table_tr">
              <td class="table_td table_td1">
                <span>地市</span>
                <span>{{detailInfo.city}}</span>
              </td>
              <td class="table_td table_td2">
                <span>手续费</span>
                <span>{{detailInfo.settlefee | formatNumber}}</span>
              </td>
            </tr>
            <tr class="table_tr">
              <td class="table_td table_td1">
                <span>门店名称</span>
                <span>{{detailInfo.username}}</span>
              </td>
              <td class="table_td table_td2">
                <span>结算金额</span>
                <span>{{detailInfo.settle_amt | formatNumber}}</span>
              </td>
            </tr>
            <tr class="table_tr">
              <td class="table_td table_td1">
                <span>操作账号</span>
                <span>{{detailInfo.opuser}}</span>
              </td>
            </tr>
          </table>
        </div>
        <!-- 退款订单才显示 不显示 -->
        <!-- <div v-if="detailInfo.cancel">
          <fieldset class="fieldset-border">
            <legend class="fieldset-title">撤销/退款</legend>
            <div>
              <table class="table2">
                <tr style="color: #9B9B9B;">
                  <td>流水号</td>
                  <td>交易类型</td>
                  <td>交易时间</td>
                  <td>交易金额</td>
                  <td>交易状态</td>
                </tr>
                <tr style="color: #262424;">
                  <td class="syssn-td">{{ detailInfo.syssn }}</td>
                  <td>{{ detailInfo.trantype }}</td>
                  <td>{{ detailInfo.sysdtm }}</td>
                  <td>{{ detailInfo.total_amt | formatNumber }}</td>
                  <td>{{ detailInfo.status_str }}</td>
                </tr>
              </table>
            </div>
          </fieldset>
        </div> -->
      </div>
      <div slot="footer" class="detail_footer">
        <el-button @click="showDetail=false" class="close-btn">关闭</el-button>
      </div>
    </el-dialog>

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
        hehe: true,
        lang: config.lang,
        role: Store.get('role') || {},
        showConfirm: false,
        showTotal: false,
        showDetail: false,
        checkValue: {},
        formpwd: {
          pwd: ''
        },
        formSend: {
          email: ''
        },
        origin: true,
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
          {'name': '昨天', 'value': '2'},
          {'name': '近7天', 'value': '7'},
          {'name': '近30天', 'value': '30'}
        ],
        form: {
          fenzuid: 'all',
          selectShopUid: '',
          orderno: null,
          dateRangeValue: [],
          operaValue: '',
          checkAll1: true,
          checkAll2: true,
          choosetime: '1',
          type: [],
          other: []
        },
        grouplist: [],
        shopData: {},
        pullflag: false,
        currentPage: 1,
        operaList: {},
        transData: {},
        formrules: {
          orderno: [
            { validator: checkOrderNo, trigger: 'change,blur' }
          ]
        },
        pwdrules: {
            pwd: [
              { required: true, message: '请输入账户密码' }
            ]
        },
        detailInfo: {}
      };
    },
    props: {
      shop: {
        type: Object
      }
    },

    computed: {
      detailHref() {
        let detailParmas = Object.assign({}, this.basicParams, {isdownload: true});
        return `${config.host}/merchant/trade/detail/info?${qs.stringify(detailParmas)}`;
      },

      basicParams() {
        let str = '';
        if(!this.form.choosetime) {
          str = 'yyyy-MM-dd HH:mm:ss';
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

      // 是否是 交易汇总 点击 交易明细
      if (this.$route.params.date) {
        let start = new Date(this.$route.params.date);
        let start1 = new Date(start.getTime() - 3600 * 1000 * 8)
        let end = new Date(start1.getTime() + 3600 * 1000 * 24 - 1)

        this.form.dateRangeValue = [start1, end]

        this.form.fenzuid = this.$route.params.fenzu_id
        this.form.selectShopUid = this.$route.params.userid
        if (this.$route.params.userid) {
          this.getOperators(this.$route.params.userid)
        }
        this.form.operaValue = this.$route.params.opuid
        this.form.choosetime = ''

        if ( this.$route.params.paytypes !== '') {
          this.form.checkAll1 = false
          this.form.type = this.$route.params.paytypes.split(',')
        }
        if ( this.$route.params.filters !== '') {
          this.form.checkAll2 = false
          this.form.other = this.$route.params.filters.split(',')
        }

        this.pullflag = true // 筛选展开
        // 门店分组数据
        if (!this.role.single) {
          this.getGroupList(this.origin, this.form.fenzuid);
        }
      } else {
        // 门店分组数据
        if (!this.role.single) {
          this.getGroupList(0, this.form.fenzuid);
        }
      }
      this.getTransData();
    },

    methods: {
      getGroupList (origin, fenzuid) {
        axios.get(`${config.host}/merchant/group/list`).then((res) => {
            let data = res.data;
            if(data.respcd === config.code.OK) {
              this.grouplist = data.data;
              this.getShopList(fenzuid, origin);
            } else {
              this.$message.error(data.resperr);
            }
          }).catch(() => {
            this.$message.error('获取门店分组信息失败');
          });
      },
      getShopList (fenzuid, origin) {
        if (!origin) {
          this.form.selectShopUid = '';
        }
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
      // 点击数据行显示详情
      handleRowHandle (row, event, column) {
        if (column.label !== '操作') {
          this.showDetail = true
          this.detailInfo = row
        }
      },
      // 展开交易类型
      changePullStatus() {
        this.pullflag = !this.pullflag
      },
      // 关闭弹出层
      handleClose(form) {
        this.$refs[form] && this.$refs[form].resetFields();
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
        this.$refs['form'].validate((valid) => {
          if(valid) {
            this.handleSizeChange();
          }
        })
      },

      // 获取数据
      getTransData() {
        let data = this.basicParams
        if(!this.loading) {
          this.loading = true;
          axios.get(`${config.host}/merchant/trade/detail/info`, {
            params: data
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
        this.$refs['form'].resetFields()
        // 处理 交易汇总跳转过来点重置的逻辑
        this.changeTime('1')
        this.form.checkAll1 = true
        this.form.type = []
        this.form.checkAll2 = true
        this.form.other = []
        this.form.fenzuid = 'all'
        this.form.selectShopUid = ''
        this.form.operaValue = ''

        this.form.orderno = null
        this.form.choosetime = '1'
        this.pullflag = false
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
