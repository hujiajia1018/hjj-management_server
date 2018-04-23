<template>
  <div class="reviewpoint">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>会员功能</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/main/memberredpoint' }" replace>会员集点</el-breadcrumb-item>
        <el-breadcrumb-item>{{ type === 'create'?'创建集点':'修改集点'}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">预览集点信息</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="review-info__wrapper">
          <div class="review-info">
            <span class="info-title">目标点数</span>
            <span class="info-desc"><span class="highlight ml-0">{{ data.exchange_pt }}点</span></span>
          </div>
          <div class="review-info">
            <span class="info-title">集点条件</span>
            <span class="info-desc">
              支付满<span class="highlight ml-0">{{ data.obtain_amt }}元</span>可集一点
              <span class="highlight ml-0" v-if="data.obtain_limit == 0" style="font-size: 14px;">/一次付款可集多点</span>
            </span>
          </div>
          <div class="review-info">
            <span class="info-title">礼品名称</span>
            <span class="info-desc">{{ data.goods_name }}</span>
          </div>
          <div class="review-info">
            <span class="info-title">礼品价格</span>
            <span class="info-desc">{{ data.goods_amt }}元</span>
          </div>
          <div class="review-info">
            <span class="info-title">活动时间</span>
            <span class="info-desc">{{ data.start_time }} - {{ data.expire_time }}</span>
          </div>
          <div class="review-info flex" v-if="!role.single">
            <span class="info-title">适用门店</span>
            <div class="info-desc__wrapper">
              <div class="info-desc">
                <div><span v-for="(shop,index) in shopList">{{ shop.shopname }}{{ index < shopList.length - 1?"、":"" }}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="form-submit_wrapper">
          <span class="cancel" @click="backToEdit">返回修改</span>
          <div class="panel-btn__download panel-btn__download_detail" @click="submit">
            <span class="el-icon-loading" v-if="loading"></span>
            <span v-else><i class="icon-create"></i>确认提交</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import axios from 'axios';
  import config from 'config';
  import qs from 'qs';
  import { formatData } from '../../common/js/util';
  import Store from '../../common/js/store';

  export default {
    beforeRouteEnter (to, from, next) {
      next((vm) => {
        vm.data = Store.get('pointData');
        let list = Store.get('shopStateList');
        vm.shopList = vm.getshopList(list);

        if(vm.$route.query.type === 'edit') {
          vm.type = 'edit'
        }else {
          vm.type = 'create'
        }
      });
    },
    data() {
      return {
        loading: false,
        role: Store.get('role') || {},
        data: {},
        type: 'create',
        shopList: []
      };
    },
    methods: {
      backToEdit() {
        this.$router.go(-1);
      },

      // 遍历选择的门店
      getshopList(list) {
        let lists = [];
        if(this.data.mchnt_id_list[0] === '') {
            lists = this.data.mchnt_id_list;
            lists.shift();
          for(let states of list) {
              if (states.state === '1') {
                lists.push(states);
              }
          }
        }else {
          for(let id of this.data.mchnt_id_list) {
            for(let val of list) {
              if(id == val.uid) {
                lists.push(val);
              }
            }
          }
        }

        return lists;
      },

      submit() {
        if(!this.loading) {
          this.loading = true;
          let params;
          if(this.type === "create") {
            params = "actv_create";
          }else {
            params = "actv_change";
          }

          let param = [];
          for(let v of this.shopList) {
              param.push(v.uid)
          }
          axios.post(`${config.ohost}/mchnt/card/v1/${params}`, qs.stringify(Object.assign({}, this.data, {
            obtain_amt: formatData(this.data.obtain_amt, 100),
            goods_amt: formatData(this.data.goods_amt, 100),
            mchnt_id_list: param.join(','),
            format: 'cors'
          })), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
          }).then((res) => {
              this.loading = false;
              let data = res.data;
              if(data.respcd === config.code.OK) {
                this.$message({
                  type: 'success',
                  message: this.type === "create" ? '创建集点活动成功' : '修改集点活动成功'
                });
                this.$router.push('/main/memberredpoint');
              } else {
                this.$message.error(data.resperr);
              }
            })
            .catch(() => {
              this.loading = false;
              this.$message.error('创建集点活动失败');
            });
        }
      }
    }
};
</script>

<style>
</style>
