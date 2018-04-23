<template lang="html">
  <div>
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>卡券管理</el-breadcrumb-item>
        <el-breadcrumb-item>卡券核销</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-select-group">
          <span class="panel-header__desc">输入券码核销</span>
        </div>
      </div>
      <div class="panel-body">
        <div class="info_wrapper">
          <div class="info">
            <div class="info__title">券码</div>
            <el-input v-model="ticketCode" type="number" placeholder="请输入券码" size="big" class="panel-select-input-240"></el-input>
            <div type="button" name="button" class="button" @click="getTicketInfo()">查询</div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel" v-if="haveData">
      <div class="panel-body">
        <el-table style="width: 100%" :data="ticketDate" row-class-name="el-table__row_fix">
          <el-table-column label="券码" prop="ticketCode"></el-table-column>
          <el-table-column label="券类型" prop="ticketType"></el-table-column>
          <el-table-column min-width="150" label="券有效期" prop="ticketValidity"></el-table-column>
          <el-table-column label="券名称" prop="ticketName"></el-table-column>
          <el-table-column label="售价" prop="price"></el-table-column>
          <el-table-column min-width="100" label="操作">
            <template scope="scope">
              <!-- <el-button type="text" size="small" class="el-button__fix" :disabled="hasWriteOff" @click="showConfirmView()">{{hasWriteOff ? '已核销': '核销'}}</el-button> -->
              <el-button type="text" size="small" class="el-button__fix" :disabled="hasWriteOff" @click="showConfirmView()">{{writeoffStatus}}</el-button>

            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="确认核销口碑券？" :visible.sync="confirmView" custom-class="mydialog" top="20%" :show-close="false">
      <div slot="footer" class="dialog-footer-center">
        <el-button type="text" size="small" class="btn confirm" @click="confirmWriteoff()">确定核销</el-button>
        <el-button type="text" size="small" class="btn" @click="confirmView = flase">取消核销</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import config from 'config';
import qs from 'qs';
export default {
  data () {
    return {
      ticketCode: '',
      hasWriteOff: false,
      confirmView: false,
      haveData: false,
      writeoffStatus: '核销',
      ticketDate: [{
        ticketCode: '',
        ticketType: '商品券',
        ticketValidity: '',
        ticketName: '',
        price: ''
      }]
    }
  },
  methods: {
    showConfirmView () {
      this.confirmView = true
    },
    getTicketInfo () {
      axios.get(`${config.host}/merchant/koubei/ticket/info`, {
        params: {
          ticket_code: this.ticketCode,
          format: 'cors'
        }
      }).then((res) => {
        let data = res.data
        if (data.respcd === config.code.OK) {
          this.haveData = true
          this.ticketDate[0].ticketCode = this.ticketCode
          this.ticketDate[0].ticketValidity = data.data.effect_date + ' - ' + data.data.expire_date
          this.ticketDate[0].ticketName = data.data.ticket_name
          this.ticketDate[0].price = data.data.current_price + '元'
          if (data.data.ticket_status === 'EFFECTIVE') {
            this.hasWriteOff = false
          } else {
            this.hasWriteOff = true
            this.$message.error(data.data.status_desc)
            if (data.data.ticket_status === 'USED') {
              this.writeoffStatus = '已核销'
            } else {
              this.writeoffStatus = '无法核销'
            }
          }
        } else {
          this.haveData = false
          this.$message.error(data.respmsg)
        }
      })
    },
    confirmWriteoff () {
      this.confirmView = false
      axios.post(`${config.host}/merchant/koubei/ticket/use`, qs.stringify({
        ticket_code: this.ticketCode,
        format: 'cors'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then((res) => {
        let data = res.data;
        if (data.respcd === config.code.OK) {
          this.$message({
            type: 'success',
            message: '核销成功'
          });
          this.hasWriteOff = true
        } else {
          this.$message.error(data.respmsg);
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.info__title {
  width: 40px;
  margin-right: 20px;
  color: #000;
}
.panel-select-input-240 {
  width: 240px;
  margin-right: 15px;
}
.button {
  width: 108px;
  height: 36px;
  line-height: 36px;
  background-color: #FE9B20;
  color: #fff;
  text-align: center;
  font-size: 14px;
  border: none;
  outline: none;
  border-radius: 3px;
  cursor: pointer;
  &:active {
    background-color: #ffb457;
  }
}
.dialog-footer-center {
  display: flex;
  justify-content: space-around;
  .btn {
    width: 120px;
    height: 40px;
    text-align: center;
    font-size: 14px;
    color: #fff;
    background-color: #FE9B20;
  }
  .confirm {
    background-color: #7ED321;
  }
}
</style>
