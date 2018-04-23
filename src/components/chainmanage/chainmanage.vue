<template>
  <div class="chain">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>账户信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group panel-select-group__justify">
          <span class="panel-header__desc">基本信息</span>
          <!--<div class="panel-header-btn" @click="changePass('chain', shop.mobile)"></div>-->
          <div type="primary" class="panel-header-btn" :plain="true" @click="changePass('chain', shop.mobile)">修改密码</div>
        </div>
      </div>
      <div class="panel-body">
        <div class="info_wrapper">
          <div class="info">
            <div class="info__title">商户名称</div>
            <div class="info__sign">:</div>
            <div class="info__desc">{{ shop.shopname }}</div>
          </div>
          <div class="info">
            <div class="info__title">登录账号</div>
            <div class="info__sign">:</div>
            <div class="info__desc">{{ shop.mobile }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">分店信息</span>
          <!-- <div class="panel-header-btn__associate" @click="associate">
            <i class="icon-create"></i>
            <span>关联分店</span>
          </div> -->
          <div class="btn-group">
            <el-button type="primary" class="panel-edit-btn__subshopnum" @click.native="editSubShopNum">编辑分店编号</el-button>
            <el-dropdown :hide-on-click="true" style="margin-left:10px;" v-if="!role.isBaoshang">
              <div class="panel-header-btn__associate">
                <i class="icon-create"></i>
                <span>创建分店</span>
              </div>

              <el-dropdown-menu slot="dropdown" style="width:155px;">
                <el-dropdown-item @click.native="createShop">直接创建</el-dropdown-item>
                <el-dropdown-item @click.native="associate">关联已有</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

        </div>
      </div>
      <div class="panel-body">
        <el-table
          :data="pageShopData.list"
          style="width: 100%"
          row-class-name="el-table__row_fix"
          v-loading.body="loading">
          <el-table-column
            prop="shop_name"
            label="分店名称">
          </el-table-column>
          <el-table-column
            prop="mobile"
            label="登录账号">
          </el-table-column>
          <el-table-column
            prop="join_time"
            label="注册时间">
            <template scope="scope">{{ scope.row.join_time }}</template>
          </el-table-column>
          <el-table-column
            prop="tag"
            label="分店编号">
            <template scope="scope">{{ scope.row.tag }}</template>
          </el-table-column>
          <el-table-column
            label="操作">
            <template scope="scope">
              <el-button type="text" size="small" class="el-button__fix" @click="showDetail(scope)">查看详情</el-button>
              <!--<el-button type="text" size="small" class="el-button__fix" @click="unbind(scope)">解绑此分店</el-button>-->
              <el-dropdown>
                <span class="el-dropdown-link el-dropdown-link__fix">更多<i class="el-icon-caret-bottom el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown" class="el-dropdown-menu__fix collect">
                  <el-dropdown-item class="el-dropdown-item__fix" @click.native="changePass('single', scope.row.mobile)">修改密码</el-dropdown-item>
                  <el-dropdown-item class="el-dropdown-item__fix" @click.native="confirmDeleteShop(scope.row.uid)">删除分店</el-dropdown-item>

                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination_wrapper" v-if="pageShopData.count >= 10">
        <el-pagination
          ref="page"
          layout="total, sizes, prev, pager, next, jumper"
          :page-size="pageSize"
          @size-change="handleSizeChange"
          :total="+pageShopData.count"
          @current-change="currentChange"
          :current-page="currentpage">
        </el-pagination>
      </div>
      <div class="table_placeholder" v-else></div>
    </div>
    <el-dialog v-model="isShowDetail" class="detail_dialog" title="门店详情">
      <el-row>
        <el-col :span="6" class="title">登录账号</el-col>
        <el-col :span="10" class="desc">{{ detailData.mobile }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="6" class="title">店铺名称</el-col>
        <el-col :span="10" class="desc">{{ detailData.shopname }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="6" class="title">address</el-col>
        <el-col :span="10" class="desc">{{ detailData.address }}</el-col>
      </el-row>

      <div>
        <el-row>
          <el-col :span="6" class="title">手机号</el-col>
          <el-col :span="10" class="desc">{{ detailData.telephone || '无' }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="title">持卡人</el-col>
          <el-col :span="10" class="desc">{{ detailData.bankuser }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="title">银行账户</el-col>
          <el-col :span="10" class="desc">{{ detailData.bankaccount }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="title">银行名称</el-col>
          <el-col :span="14" class="desc">
            <div>{{ detailData.headbankname }}</div>
            <div>{{ detailData.bankname }}</div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <el-dialog title="修改密码" :visible.sync="showChangePass" @close="handleClose('form')" custom-class="mydialog"
               top="20%" :show-close="false">
      <el-form :model="form" :rules="formrules" ref="form" label-width="80px">
        <el-form-item label="登录账号">
          <div>{{ userName }}</div>
        </el-form-item>
        <el-form-item label="输入新密码" prop="pass">
          <el-input v-model="form.pass" size="small" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="repass">
          <el-input v-model="form.repass" size="small" type="password" placeholder="请输入确认新密码"></el-input>
        </el-form-item>
      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="showChangePass = false" class="cancel">取消</div>
        <div @click="submit" class="submit">
          <span class="el-icon-loading" v-if="iconShow"></span>
          <span v-else>确定</span>
        </div>
      </div>
    </el-dialog>

    <el-dialog title="编辑分店编号" :visible.sync="showEditSubShopNum" class="mydialog" custom-class="mydialog_haiwai" size="small" @close="refreshSubShopData">
      <el-form ref="form-edit-subshop-num" label-position="left" class="edit-sub-tag">
        <div class="desc" style="text-align: left">
          分店编号设置成功后将会显示在下载的交易明细和交易汇总中
        </div>
        <el-form-item v-for="(shop, index) in shopData.list" v-if="index !== 0" :key="index">
          <el-tooltip placement="bottom" :content="shop.shop_name" class="subshoptip">
            <label style="width:140px">{{shop.shop_name}}</label>
          </el-tooltip>
          <el-input v-model="shop.tag" size="small" placeholder="请输入二十位以内的文字或字母" style="width:65%" @blur="updateShopTag(shop)"></el-input>
        </el-form-item>

      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="refreshSubShopData" class="submit"><i class="el-icon-loading" v-show="iconShow"></i>确认</div>
      </div>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="showDeleteShopConfirm" custom-class="mydialog pass" top="20%"
               :show-close="true" @close="handleClose('pwdform')">
      <div style="margin-bottom: 20px;">删除分店前建议先终止该分店正在进行的会员营销活动。</div>
      <el-form :model="formpwd" :rules="formrules" ref="pwdform">
        <el-form-item prop="primeaccountpwd">
          <el-input v-model="formpwd.primeaccountpwd" placeholder="请输入总账户登录密码" type="password" style="font-size:12px"></el-input>
        </el-form-item>
      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="checkPrimeShopPwd('pwdform',this)" class="submit"><i class="el-icon-loading" v-show="iconShow"></i>确定</div>
      </div>
    </el-dialog>

    <el-dialog title="关联分店" :visible.sync="visible" class="mydialog" @close="handleClose('associate_form')">
      <el-form :model="associate_form" :rules="formrules" ref="associate_form" label-width="80px">
        <div class="desc">
          <p>请输入您的分店信息，以做关联。</p>
          <p>如您的分店还没有账号，请联系客服或者业务员为您的分店入网。</p>
        </div>
        <el-form-item label="分店账号" prop="account">
          <el-input v-model="associate_form.account" size="small" placeholder="请输入分店账号"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input type="password" v-model="associate_form.password" size="small" placeholder="请输入分店登录密码"></el-input>
        </el-form-item>
        <el-form-item label="收款人" prop="bankuser">
          <el-input v-model="associate_form.bankuser" size="small" placeholder="请输入分店收款人姓名"></el-input>
        </el-form-item>
        <el-form-item label="银行卡号" prop="bankaccount">
          <el-input v-model="associate_form.bankaccount" size="small" placeholder="请输入分店收款银行卡号"></el-input>
        </el-form-item>
      </el-form>
      <div class="divider"></div>
      <div slot="footer" class="dialog-footer">
        <div @click="visible = false" class="cancel">取 消</div>
        <div @click="submit_bind" class="submit"><i class="el-icon-loading" v-show="iconShow"></i>确 定</div>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  import axios from 'axios';
  import config from 'config';
  import Store from '../../common/js/store';
  import ElButton from "../../../node_modules/qfpay-element-ui/packages/button/src/button";
  import ElForm from "../../../node_modules/qfpay-element-ui/packages/form/src/form";
  const hasSpetialChar = function (str) {
    if (!/^[\u4E00-\u9FA5\uf900-\ufa2d\u3001\u3002\u3008-\u301B\u2013\u2014\u2018\u2019\u201C\u201D\uFF01\uFF08\uFF09\uFF0C\uFF0E\uFF1A\uFF1B\uFF1F\u0020-\u007F]*$/.test(str)) {
        return 1;
    }
  }
  export default {
    components: {
      ElForm,
      ElButton
    },
    data() {
      let passValid = (rule, val, cb) => {
        if (val === '') {
          cb('请输入新密码');
        } else {
          if (this.form.repass !== '') {
            this.$refs['form'].validateField('repass');
          }
          cb();
        }
      };
      let repassValid = (rule, val, cb) => {
        if (val === '') {
          cb('请输入确认新密码');
        } else if (this.form.pass && this.form.pass !== val) {
          cb('新密码与确认密码不一致');
        } else {
          console.log(val);
          cb();
        }
      };
//      let tagValid = (rule, val, cb) => {
//        if (val.length > 20) {
//          cb(new Error('请输入二十以内的文字或字母'));
//        } else if (hasSpetialChar(val)) {
//          cb(new Error('含特殊字符，请重新输入'));
//        } else {
//          cb();
//        }
//      };
      let primeAccountPwdValid = (rule, val, cb) => {
        if (val === '') {
          cb('请输入总账户登录密码');
        } else {
          console.log(val);
          cb();
        }
      }
      return {
        role: Store.get('role') || {},
        currentpage: 1,
        pageSize: 10,
        visible: false,
        loading: false,
        iconShow: false,
        isShowDetail: false,
        showChangePass: false,
        showEditSubShopNum: false,
        showDeleteShopConfirm: false,
        detailData: {},
        userName: '',
        type: '',
        shouldDeleteUid: '',
        associate_form: {
          account: '',
          password: '',
          payee: '',
          cardno: ''
        },
        formpwd: {
          primeaccountpwd: ''
        },
        form: {
          pass: '',
          repass: ''
        },
        checkTagRules: {
          tag: [
            {max: 20, min: 0, message: '请输入二十以内的文字或字母', trigger: 'blur'}
          ]
        },
        formrules: {
          pass: [
            {validator: passValid},
            {max: 20, min: 6, message: '请输入6~20位数字或字母', trigger: 'blur'}
          ],
          repass: [
            {validator: repassValid},
            {max: 20, min: 6, message: '请输入6~20位数字或字母', trigger: 'blur'}
          ],
          primeaccountpwd: [
            {validator: primeAccountPwdValid},
            {required: true, message: '请输入总账户密码', trigger: 'blur'}
          ],
          account: [
            {required: true, message: '请输入分店账号'}
          ],
          password: [
            {required: true, message: '请输入分店登录密码'}
          ],
          bankuser: [
            {required: true, message: '请输入分店收款人姓名'}
          ],
          bankaccount: [
            {required: true, message: '请输入分店收款银行卡号'}
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
      pageShopData() {
        return this.$store.state.pageShopData;
      },
      shopData() {
        return this.$store.state.shopData;
      }
    },
    created() {
      this.$store.dispatch('getPageShopData');
    },

    methods: {
      refreshSubShopData() {
        this.$store.dispatch('getPageShopData');
        this.$store.dispatch('getShopList');
        this.showEditSubShopNum = false;
      },
      updateShopTag(shop) {
          let _tag = shop.tag;
          if(_tag.length > 20) {
              this.$message.error('请输入二十以内的文字或字母');
              return;
          }
          if(hasSpetialChar(_tag)) {
            this.$message.error('不能含有特殊字符');
              return;
          }
          axios.post(`${config.host}/merchant/sub/tag_add`, {
            userid: shop.uid,
            tag: shop.tag,
            format: 'cors'
          }).then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.$message({
                type: 'success',
                message: '修改成功'
              });
            } else {
              this.$message.error('修改失败');
            }
          }).catch((e) => {
            this.$message.error(e);
          })
      },
      // 检查提交主账户密码
      checkPrimeShopPwd(formName, context) {
        var _this = this;
        this.$refs[formName].validate((valid) => {
          if (valid && !_this.iconShow) {
            // 发验证主账户密码请求
            _this.iconShow = true;
            _this.doCheckPrimePwd();
          } else {
            console.log("validate doesn't passed!!");
            return false;
          }
        });
      },
      doCheckPrimePwd() {
        axios.post(`${config.host}/merchant/validate_password`, {
          password: this.formpwd.primeaccountpwd,
          format: 'cors'
        }).then((res) => {
          let data = res.data;
          if (data.data.result === 'success') {
            this.unbind(this.shouldDeleteUid);
          } else {
            this.$message.error('密码不正确');
            this.iconShow = false;
          }
        }).catch((e) => {
          this.iconShow = false;
          this.$message.error(e);
        })
      },

      // 编辑子商户
      editSubShopNum() {
        this.showEditSubShopNum = true;
      },
      // 确认是否删除分店
      confirmDeleteShop(uid) {
        this.shouldDeleteUid = uid;
        this.showDeleteShopConfirm = true;
      },
      // 创建子门店
      createShop() {
        this.$router.push('/main/chainmanage/createsubshop');
      },
      // 修改密码
      changePass(type, name) {
        this.type = type;
        this.userName = name;
        this.showChangePass = true;
      },

      // 关闭弹出层,清除表单
      handleClose(formName) {
        this.$refs[formName].resetFields();
      },

      // 大商户修改自己的密码提交
      submit() {
        this.$refs['form'].validate((valid) => {
          if (!this.iconShow && valid) {
            this.iconShow = true;

            let src;
            if (this.type === 'single') {
              src = 'big-submchnt';
            } else if (this.type === 'chain') {
              src = 'mchnt';
            }
            axios.post(`${config.ohost}/mchnt/user/reset_pwd`, {
              mobile: this.shop.mobile,
              password: this.form.pass,
              mode: 'change',
              username: this.userName,
              src: src,
              format: 'cors'
            }).then((res) => {
              let data = res.data;
              if (data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: '修改成功'
                });
                this.showChangePass = false;

                if(this.type === 'chain') {
                  this.logout();
                }
              } else {
                this.$message.error(data.respmsg);
              }
              this.iconShow = false;
            }).catch(() => {
              this.$message.error('网络错误');
              this.iconShow = false;
            });
          }
        });
      },

      // 退出登录
      logout() {
        axios.get(`${config.host}/merchant/signout`)
          .then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              // 登出时删除.qfpay.com域下cookie
              (new Image()).src = `${config.ohost}/mchnt/set_cookie?sessionid=`;
              Store.set('flag', true);
              localStorage.removeItem('hashid');
              localStorage.removeItem('uid');

              var toRemoved = document.getElementById('unique_map');
              if(toRemoved) {
                toRemoved.onload = null;
                document.body.removeChild(toRemoved);
              }
              this.$router.push(`/login?from=logout}`);
            } else {
              this.$message.error(data.respmsg);
            }
          }).catch(() => {
          this.$message.error('网络错误');
        });
      },

      // 改变size
      handleSizeChange(size) {
        this.pageSize = size;
        this.currentChange();
      },

      currentChange(current) {
        console.log(current)

        if (!current && this.currentpage !== 1) {
          this.currentpage = 1;
          return;
        }
        if (current) {
          this.currentpage = current;
        }

        this.$store.dispatch({
          type: 'getPageShopData',
          start: current ? current - 1 : 0,
          len: this.pageSize
        });
      },

      associate() {
        this.visible = true;
      },
      submit_bind() {
        this.$refs['associate_form'].validate((valid) => {
          if (valid) {
            this.iconShow = true;
            axios.post(`${config.host}/merchant/sub/bind`, this.associate_form)
              .then((res) => {
                this.iconShow = false;
                let data = res.data;
                if (data.respcd === config.code.OK) {
                  this.$message({
                    type: 'success',
                    message: '绑定成功!'
                  });
                  this.visible = false;
                  this.$refs['associate_form'].resetFields();

                  this.handleSizeChange(10);
                  this.$store.dispatch('getShopList');
                } else {
                  this.$message.error(data.resperr);
                }
              }).catch((e) => {
              this.iconShow = false;
              console.log(e.stack);
            });
          }
        });
      },

      unbind(uid) {
        axios.get(`${config.host}/merchant/sub/remove`, {
          params: {
            sub_uid: uid
          }
        })
          .then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.$message({
                type: 'success',
                message: '删除分店成功'
              });
              this.shouldDeleteUid = '';
              this.formpwd.primeaccountpwd = '';
              this.showDeleteShopConfirm = false;

              this.handleSizeChange(10);
              this.$store.dispatch('getShopList');
            } else {
              this.$message.error(data.resperr);
            }
            this.iconShow = false;
          })
          .catch((e) => {
            this.$message.error(e);
            this.iconShow = false;
          });
      },

      showDetail(scope) {
        axios.get(`${config.host}/merchant/info`, {
          params: {
            userid: scope.row.uid,
            format: 'cors'
          }
        })
          .then((res) => {
            let data = res.data;
            if (data.respcd === config.code.OK) {
              this.detailData = data.data;
              this.isShowDetail = true;
            } else {
              this.$message.error(data.respmsg);
            }
          });
      }
    }
  };
</script>

<style lang="scss" scoped>
  .panel-header__desc {
    font-size: 18px;
    color: #FE9B20;
    float:left;
  }

  .panel-header__fix {
    padding-right: 15px;
    line-height:50px;
  }
  .panel-select-group {
    justify-content: space-between;
    line-height: 50px;
  }
  .panel-select-group__justify {
    justify-content: space-between;
  }
  /*.el-form-item__content:last-child {*/
    /*margin-left: 32px !important;*/
  /*}*/
  .info_wrapper {
    padding: 20px 0px 30px 10px;
    @at-root .info {
      display: flex;
      height: 28px;
      align-items: flex-end;
      &:first-child {
        margin-bottom: 18px;
      }

      @at-root .info__title {
        font-size: 16px;
        color: #8A8C92;
        width: 100px !important;
        margin-right: 0 !important;
      }
      @at-root .info__sign {
        margin: 0px 10px 0px 0px;
      }
      @at-root .info__desc {
        font-size: 16px;
        color: #1F2D3D;
      }
    }
  }

  .table_placeholder {
    height: 50px;
  }

  .detail_dialog {
    .el-dialog {
      width: 580px;
    }
    .el-dialog__title {
      font-size: 20px;
    }
    .title {
      font-size: 16px;
      color: black;
    }
    .desc {
      color: black;
    }
  }
  .chain {
    .panel-header-btn {
      width: 150px;
    }
    .panel-edit-btn__subshopnum {
      width: 164px;
      /*margin-left: 60%;*/
    }
    .pass {
      width: 420px;
      .el-dialog__header {
        text-align: center;
      }
      .el-form-item__label {
        width: 90px;
      }
    }
    .el-tooltip.subshoptip {
      display: inline-block;
      width: 100px;
      overflow: hidden;
      height: 16px;
      line-height: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .edit-sub-tag {
      height:420px;
      overflow-y: auto;
    }
    .mydialog .el-dialog__body {
      padding: 0 !important;
    }
    .mydialog  {
      .el-dialog.el-dialog--small.mydialog_haiwai {
        width: auto !important;
      }
    }
  }
  .btn-group {
    display: flex;
    align-items: center;
  }
</style>
