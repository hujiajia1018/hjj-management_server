<template>
  <div class="merchandise" v-loading="loading">
    <div class="banner_wrapper">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="panel">
      <div class="panel-header panel-header__fix">
        <div class="panel-select-group">
          <span class="panel-header__desc">上传引导</span>
        </div>
      </div>
      <div class="panel-body steps">
        <div>
          <p class="step">step<span>1</span></p>
          <p class="step-text">下载批量导入数据所用的 Excel 模板</p>
          <a class="banner-btn" href="https://sh.qfpay.com/static/excel/example.xlsx" download>
            <i class="icon-download"></i>
            <span class="banner-btn__desc">下载模板</span>
          </a>
        </div>
        <div>
          <p class="step">step<span>2</span></p>
          <p class="step-text">仔细阅读模版中说明，按照模版要求填写完模版后，将模板文件拖入下方上传区域</p>
        </div>
        <div>
          <p class="step">step<span>3</span></p>
          <p class="step-text">如模版中有错误数据导致导入失败，请下载错误数据，修改后重新上传</p>
        </div>
        <div>
          <p class="step">step<span>4</span></p>
          <p class="step-text">上传成功的菜品将显示在下面的列表中，点击图片可更换这些图片</p>
        </div>
      </div>
      <div class="panel-body tip" v-if="state">
        <p class="color-green" v-if="uploadInfo.no_error">成功上传 {{ uploadInfo.success }} 件商品</p>
        <div v-else>
          <p class="color-red" >共发现 {{ uploadInfo.fails }} 条错误数据</p>
          <a class="banner-btn" :href="downloadUrl" download>
            <i class="icon-download"></i>
            <span class="banner-btn__desc">下载错误数据</span>
          </a>
        </div>
      </div>
      <div class="panel-body">
        <el-upload
          class="upload-demo"
          v-loading="uploadLoading"
          :on-progress="startAvatarUpload"
          :show-file-list="false"
          :on-success="avatarSuccess"
          :on-error="avatarFailed"
          drag
          :action="uploadUrl"
          accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">请将填写完成的模板文件拖放到此区域,或<em>点击上传</em></div>
        </el-upload>
      </div>

      <div class="panel-body">
        <div class="myform_wrapper">
          <div class="panel">
            <div class="panel-body">
              <el-table
                :data="merchantData.list"
                style="width: 100%"
                row-class-name="el-table__row_fix"
                v-loading="loading">
                <el-table-column label="ID" prop="id" min-width="150"></el-table-column>
                <el-table-column label="图片" min-width="100">
                  <template scope="scope">
                    <img v-if="scope.row.img" :src="scope.row.img" alt="" width="44" height="44" />
                    <el-button v-else :id="'img-id-' + scope.row.id" size="small" type="primary">上传图片</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="商品名称" min-width="150" prop="name">
                </el-table-column>
                <el-table-column label="商品状态">
                  <template scope="scope">
                    <span :class="[ scope.row.available === 1 ? 'color-green' : 'color-orange' ]">{{ scope.row.available_str }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="品类" prop="cate_name">
                </el-table-column>
                <el-table-column label="品类状态" >
                  <template scope="scope">
                    <span :class="[scope.row.cate_available === 1 ? 'color-green' : 'color-orange']">{{ scope.row.cate_available_str }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="pagination_wrapper" v-if="merchantData.count >= 10">
              <el-pagination
                ref="page"
                layout="total, sizes, prev, pager, next, jumper"
                :page-size="pageSize"
                @size-change="handleSizeChange"
                :total="merchantData.count"
                @current-change="currentChange"
                :current-page="currentPage">
              </el-pagination>
            </div>
            <div class="table_placeholder" v-else></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import qs from 'qs';
  import config from 'config';
  /*eslint-disable spaced-comment,no-undef,camelcase,no-unused-vars*/

  export default {
    data() {
      return {
        loading: false,
        uploadLoading: false,
        state: false,
        pageSize: 10,
        currentPage: 1,
        merchantData: {},
        rowInfo: {},
        uploadInfo: {},
        uploadUrl: `${config.host}goods/upload`,
        downloadUrl: `${config.host}/goods/error_download`
      }
    },
    computed: {
      basicParams() {
        return {
          start: this.currentPage - 1,
          length: this.pageSize
        };
      }
    },

    created() {
        this.getData();
    },

    methods: {
      getData() {
        this.loading = true;
        axios.get(`${config.host}/goods/list`, {
          params: this.basicParams
        }).then((res) => {
          this.loading = false;
          let data = res.data;
          if(data.respcd === config.code.OK) {
            this.merchantData = data.data;
            let list = this.merchantData.list || [];
            this.$nextTick(function () {
              for(let item of list) {
                if(!item.img) {
                  this.imgUpload(item.unionid, item.id);
                }
              }
            })
          } else {
            this.$message.error(data.resperr);
          }
        }).catch(() => {
          this.loading = false;
          this.$message.error('获取商品列表失败');
        });
      },
      // 改变size
      handleSizeChange(size = 10) {
        this.pageSize = size;
        this.currentChange(1);
      },

      // 改变当前页
      currentChange(current) {
        if (!current && this.currentPage !== 1) {
          this.currentPage = 1;
          return;
        }
        if (current) {
          this.currentPage = current;
          this.getData();
        }
      },

      // 开始上传
      startAvatarUpload() {
        this.state = false;
        this.uploadLoading = true;
      },

      // 上传成功
      avatarSuccess(res, file) {
        if (res.respcd === config.code.OK) {
          this.state = true;
          this.uploadLoading = false;
          this.$message({
            type: 'success',
            message: '上传成功'
          });
          this.uploadInfo = res.data;
          this.handleSizeChange();
        } else {
          this.uploadLoading = false;
          this.$message.error(res.resperr);
        }
      },

      // 上传失败
      avatarFailed(err, file) {
        this.uploadLoading = false;
        this.$message.error(err);
        console.log(file);
      },

      // 图片上传，先获取token，key
      imgUpload(uid, id) {
        axios.get(`https://openapi.qfpay.com/tool/v1/qiniu_token`, {
          params: {
            appcode:	'40F12F92A55747B8AD759E05968A331D',
            func:	'upload',
            format:	'cors'
          }
        }).then((res) => {
          let _this = this;
          let reps = res.data;
          if (reps.respcd === config.code.OK) {
            var uploader = Qiniu.uploader({
              runtimes: 'html5,flash,html4',    // 上传模式,依次退化
              keyValue: reps.data.key,
              browse_button: 'img-id-' + id,       // 上传选择的点选按钮，**必需**
              uptoken: reps.data.token,
              // uptoken : '', // 若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
              // unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
              // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
              domain: 'https://o95yi3b1h.qnssl.com/',   // bucket 域名，下载资源时用到，**必需**
              get_new_uptoken: true,  // 设置上传文件的时候是否每次都重新获取新的token
              // container: id,           // 上传区域DOM ID，默认是browser_button的父元素，
              max_file_size: '10mb',           // 最大文件体积限制
              // flash_swf_url: './flash/Moxie.swf',  // 引入flash,相对路径
              max_retries: 3,                   // 上传失败最大重试次数
              dragdrop: true,                   // 开启可拖曳上传
              drop_element: 'img-id-' + id,        // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
              chunk_size: '4mb',                // 分块上传时，每片的体积
              auto_start: true,                 // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
              init: {
                'FilesAdded': function (up, files) {
                  // eslint-disable-next-line
                  plupload.each(files, function (file) {
                    // 文件添加进队列后,处理相关的事情
                  })
                },
                'BeforeUpload': function (up, file) {
                  // 每个文件上传前,处理相关的事情
                },
                'UploadProgress': function (up, file) {
                },
                'FileUploaded': function (up, file, info) {
                  let domain = up.getOption('domain');
                  let re = JSON.parse(info);
                  let sourceLink = domain + re.key;  // 获取上传成功后的文件的Url

                  axios.post(`${config.host}/goods/setimg`, qs.stringify({
                      unionid: uid,
                      img: sourceLink
                    }),
                    {
                      headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                      }
                    }).then((rp) => {
                    let data = rp.data;
                    if(data.respcd === config.code.OK) {
                      _this.$message({
                        type: 'success',
                        message: '添加商品图片成功'
                      });
                      _this.handleSizeChange();
                    } else {
                      _this.$message.error('添加图片失败' + data.resperr);
                    }
                  }).catch(() => {
                    _this.$message.error('添加图片失败');
                  })

                },
                'Error': function (up, err, errTip) {
                  // 上传出错时,处理相关的事情
                  _this.$message.error(errTip);
                  // document.querySelector('#img_upload').removeClass('spinner')
                },
                'UploadComplete': function () {
                  // 队列文件处理完毕后,处理相关的事情
                },
                'Key': function (up, file) {
                  // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                  // 该配置必须要在 unique_names: false , save_key: false 时才生效
                  let key = up.getOption('keyValue')
                  return key;
                }
              }
            })
          }else {
            _this.$message.error(res.resperr);
          }
        }).catch(() => {
          console.log('请求失败')
        })

      }
    }
  };
</script>

<style lang="scss">
  .merchandise {
    .steps {
      display: flex;
      &>div {
        margin: 0 40px;
        flex: 1;
      }
      .step {
        font-size: 20px;
        color: #a7a9ae;
        border-bottom: 2px solid #fe9b20;
        span {
          font-size: 34px;
          margin-left: 5px;
          color: #2f323a;
        }
      }
      .step-text {
        font-size: 15px;
        color: #262424;
        margin-top: 10px;
        line-height: 1.5;
      }
      .banner-btn {
        margin-top: 10px;
      }
    }

    .color-green{
      color: #7ED321;
    }
    .color-orange{
      color: #FE9B20;
    }
    .color-red{
      color: #FF0808;
    }
    .upload-demo {
      padding: 0 40px;

      .el-upload {
        display: block;
      }
      .el-upload-dragger {
        width: 100%;
        border-width: 2px;
      }
    }
    .tip {
      p {
        text-align: center;
        margin: 5px 0;
      }
      a {
        margin: auto;
      }
    }
  }

</style>
