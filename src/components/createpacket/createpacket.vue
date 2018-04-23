<template>
  <div class="createpacket">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberredpacket' }" replace>会员红包</el-breadcrumb-item>
        <el-breadcrumb-item>创建红包</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">输入红包信息</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="myform_wrapper">
          <el-form>
            <el-form-item label="红包类型">
              <el-radio-group v-model="act_type" @change="changePacketType">
                <el-radio label="type_common" v-if="!role.isBaoshang">红包通知</el-radio>
                <el-radio label="type_payment">消费返红包</el-radio>
                <el-radio label="type_share">分享红包</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <keep-alive>
            <router-view ref="form"></router-view>
          </keep-alive>
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
  import Store from '../../common/js/store';
  export default {
    data() {
      return {
        loading: false,
        role: Store.get('role') || {},
        act_type: ''
      };
    },
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        if(!vm.act_type) {
          if(vm.role.isBaoshang) {
            vm.act_type = 'type_payment';
            vm.$router.replace({ name: 'type_payment' });
          }else {
            vm.act_type = 'type_common';
            vm.$router.replace({ name: 'type_common' });
          }
        }else {
          vm.$router.replace({ name: vm.act_type });
        }
      });
    },
    computed: {
      shopData() {
        return this.$store.state.shopData;
      }
    },
    methods: {
      changePacketType(label) {
        this.$router.replace({ name: label });
      },
      currentChange(currentPage) {
        this.$store.dispatch({
          type: 'getShopList',
          start: currentPage - 1
        });
      },
      cancelCreation() {
        this.$router.push('/main/memberredpacket');
      },
      preview() {
        let packet = this.$refs['form'];
        packet.$refs['form'].validate((valid) => {
          if(valid) {
            Store.set('reviewpacketdata', packet.data);
            this.$router.push({ name: 'reviewpacket' });
          } else {
            this.$message.error('请检查输入信息是否正确');
          }
        });
      }
    }
  };
</script>
<style lang="scss">
.form-item__detail {
  margin-top: 10px;
  color: #98989E;
  font-size: 14px;
  line-height: 1;
}

.form-submit_wrapper {
  display: flex;
  padding: 20px;
  align-items: center;
  .cancel {
    margin-right: 46px;
    text-decoration: underline;
    font-size: 16px;
    color: #FE9B20;
    cursor: pointer;
  }
  .icon-create {
    margin-right: 10px;
  }
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #E8E7E6;
}

.myform_wrapper {
  margin-top: 20px;
  .el-form-item {
    margin-left: 20px;
    margin-bottom: 20px;
    .el-form-item {
      display: inline-block;
      margin: 0px;
    }
  }
  .el-form-item__content {
    margin-left: 110px;
    line-height: 32px;
    font-size: 16px;
  }
  .el-radio__label {
    font-size: 16px;
  }
  .el-form-item__label {
    padding: 8px 0px;
    font-size: 16px;
  }
  .el-input {
    display: inline-block;
  }
}

.add_rule {
  display: inline-block;
  width: 100px;
  line-height: 30px;
  margin-top: 2px;
  margin-left: 20px;
  background-color: #7ED321;
  border-radius: 3px;
  color: #fff;
  text-align: center;
  font-size: 15px;
  cursor: pointer;
  .icon-create {
    margin-right: 8px;
  }
}
.el-form-item.is-required .el-form-item__label:before {
  display: none !important;
}
.remark {
  margin-top: 10px;
  color: red !important;
  font-size: 14px !important;
}
</style>
