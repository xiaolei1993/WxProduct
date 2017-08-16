// pages/seriesPhoto/seriesPhoto.js
let app = getApp(),
    util = require('../../utils/util.js');
Page({
    data: {
        //车系信息数据
        seriesInfo:{},
        // 车型信息数据
        productData:{},
        //车型id
        productId: '',
        // 车型名称
        allName: '',
        //车型简称
        proName: '',
        // 图片列表数据
        photoData: {},
        //换车型弹层是否显示
        switchModelPop: false,
        //换车型弹层数据
        switchModelData: {},
        // 没有换车型数据
        notSwitchModel: false,
        //正在加载中状态
        loading: false,
        //是否正在请求数据
        loadData: false,
        //如果没有图片
        noImg: false,
        //是否是推荐车型
        isRecommend: false,
        // 询底价人数
        askPriceNum: '',
        //询底价车型id
        priceProductId: '',
        //该车型是否是停售
        footerPriceShow: false,
    },
    onLoad: function(options) {
        // 来源为分享的 更新数据
        app.updateDataForShare(options, this , () => {
          //转发

          //请求图片页面信息数据
          this.getImgData()

          //请求页面换车型信息数据
          this.getSwitchData()

        },() => {
          //查看该车型是否是停售
          wx.getStorage({
            key: 'footerPriceShow',
            success: res => {
              this.setData({
                footerPriceShow: res.data
              })
            },
          })

          //获取车系信息
          wx.getStorage({
            key: 'productData',
            success: res => {
              this.setData({
                productData: res.data,
                productId: res.data.F_ProductId,
                priceProductId: res.data.F_ProductId
              })
            },
          })

          //获取车型信息
          wx.getStorage({
            key: 'seriesInfo',
            success: res => {
              this.setData({
                //车型id
                seriesInfo:res.data,
              })

              //请求图片页面信息数据
              this.getImgData()

              //请求页面换车型信息数据
              this.getSwitchData()
              //请求车型图片列表数据
              // wx.request({
              //   url: app.ajaxurl + '/index.php?r=api/getweekpicturelist&subCateId=' + ele.data.F_SubCategoryId + '&seriesId=' + ele.data.F_SeriesId + '&typeId=' + this.data.typeId + '&productId=' + this.data.ProductId,
              //   success:res => {
              //     console.log(res)
              //   }
              // })
            },
          })
        })

    },
      //请求页面换车型信息数据
    getSwitchData(){
      let ajaxUrl = app.ajaxurl + 'index.php?r=weex/product/get-product-picture-change-list&subId=' + this.data.seriesInfo.F_SubCategoryId + '&seriesId=' + this.data.seriesInfo.F_SeriesId;
      if (this.data.productId) {
        ajaxUrl += '&proId=' + this.data.productId
      }
      wx.request({
        url: ajaxUrl,
        success: res => {
          if (res.errMsg == 'request:ok' && res.data.status != 2) {
            let switchModelData = {};
            //换车型列表数据
            switchModelData.priceList = res.data.priceList;
            //换车型标题数据
            switchModelData.attrList = res.data.attrList

            //当前显示的是哪一个
            if (res.data.paramName) {
              switchModelData.paramName = res.data.paramName;
            } else {
              //判断哪一个的length最长显示哪一个
              let paramName = '';
              let has = true;
              res.data.priceList.forEach((item, index) => {
                if (has) {
                  has = false;
                  paramName = res.data.attrList[index];
                  res.data.priceList.forEach((r, i) => {
                    if (res.data.priceList[index].list.length < res.data.priceList[i].list.length) {
                      paramName = res.data.attrList[i];
                    }
                  })

                }
              })
              switchModelData.paramName = paramName
            }

            //更新数据
            this.setData({
              switchModelData: switchModelData
            })
            console.log(switchModelData, 'switchModelDataswitchModelData')
          } else {
            //没有换车型数据
            this.setData({
              notSwitchModel: true,
            })
          }
        }
      })
    },
    getImgData(switchModel) {
        // 如果是换车型 那么type为全部
        if (switchModel) {
            let photoData = this.data.photoData;
            photoData.typeId = 0;
            this.setData({
                photoData: photoData
            })
        }

        let ajaxUrl = app.ajaxurl + 'index.php?r=api/getweekpicturelist&subCateId=' + this.data.seriesInfo.F_SubCategoryId + '&seriesId=' + this.data.seriesInfo.F_SeriesId + '&productId=' + this.data.productId;

        //查看是否有详细分类id
        if (this.data.photoData.typeId) {
            ajaxUrl += '&typeId=' + this.data.photoData.typeId
        }

        wx.request({
            url: ajaxUrl,
            success: res => {
                if (res.errMsg == 'request:ok' && res.data.info != 'error') {
                    console.log(res.data)

                    //车型名称
                    let allName = res.data.allName;
                    let proName = res.data.proName;

                    //页面标题只运行一次
                    // if (!this.data.allName) {
                        // 标题
                        wx.setNavigationBarTitle({
                            title: allName
                        })
                        app.globalData.shareTitle = allName
                    // }

                    //图片内容选项
                    let photoData = this.data.photoData;

                    //tab标题
                    console.log(res,'resresres')
                    photoData.options = res.data.data.tab;

                    //默认显示全部
                    if (!photoData.typeId) {
                        photoData.typeId = 0;
                    }

                    //默认从第二页开始加载
                    photoData.page = 2;

                    //存储图片页面的tab标题
                    wx.setStorage({
                        key: 'PhotoTabName',
                        data: photoData.options,
                    })

                    //图片内容
                    photoData.content = res.data.data.list;

                    //更新内容
                    this.setData({
                        //车型名称
                        allName: allName,
                        proName: proName,
                        //图片数据
                        photoData: photoData,
                        //没有图片内容
                        noImg: false,
                        getImgData: res.data.getImgData,
                        //设置询底价数量
                        askPriceNum: res.data.askPriceNum,
                        //询底价车型
                        priceProductId: res.data.recommendId,
                    })

                    console.log(this.data.proName)

                    //如果是推荐，给推荐车型id赋值
                    this.setData({
                        isRecommend: res.data.isRecommend,
                        productId: res.data.recommendId
                    })

                } else {
                    this.setData({
                        //没有图片内容
                        noImg: true,
                    })
                    // 标题
                    wx.setNavigationBarTitle({
                        title: res.data.allName
                    })
                    app.globalData.shareTitle = res.data.allName
                }
            }
        })
    },
    // 点击换车型
    changeTruck() {
        this.setData({
            switchModelPop: true
        })
    },

    back() {
        this.setData({
            switchModelPop: false
        })
    },
    //选择换车型条件选项
    selectModelOption(e) {
        let name = e.currentTarget.dataset.name;
        let switchModelData = this.data.switchModelData;
        switchModelData.paramName = name;
        this.setData({
            switchModelData: switchModelData
        })
    },
    //点击换车型，重新请求车型页面信息
    goSwitchModel(e) {
        console.log(e.currentTarget.dataset.item)
        this.setData({
            productId: e.currentTarget.dataset.item.F_ProductId,
            switchModelPop: false
        })
        this.getImgData('switchModel')
    },
    //点击图片详细分类
    detailed(e) {
        console.log(e.currentTarget.dataset.type)
        let photoData = this.data.photoData;
        photoData.typeId = e.currentTarget.dataset.type
        this.setData({
            photoData: photoData,
            loadData: false,
        })
        this.getImgData();
    },
    //滚动加载更多
    loadData() {

        // 如果页面是全部的话，不加载更多,return掉
        if (this.data.photoData.typeId == 0 || this.data.noImg) {
            return
        }

        if (!this.data.loadData) {
            //设置显示loading
            this.setData({
                loading: true,
                loadData: true
            })

            //加载更多数据
            wx.request({
              url: app.ajaxurl + '/index.php?r=m/ajax/series/ajaxgetseriesimgmore&ajaxurl=%2Findex.php%3Fr%3Dm%2Fajax%2Fseries%2Fajaxgetseriesimgmore&seriesid=' + this.data.seriesInfo.F_SeriesId + '&subcateid=' + this.data.seriesInfo.F_SubCategoryId + '&typeid=' + this.data.photoData.typeId + '&productid=' + this.data.productId + '&page=' + this.data.photoData.page,
                success: ele => {
                    if (ele.data.status == 1) {
                        let photoData = this.data.photoData;
                        //数组合并
                        let arr = photoData.content[0].imgList.concat(ele.data.data);
                        photoData.content[0].imgList = arr;
                        photoData.page += 1;
                        //设置更新数据
                        this.setData({
                            photoData: photoData
                        })

                        this.setData({
                            loading: false,
                            loadData: false
                        })
                    } else {
                        this.setData({
                            // noImg:true
                            loadData: true,
                            loading: false,
                        })
                    }
                }
            })
        }
    },
    //点击图片 ，进入图片最终页面
    goImgInfo(e) {
        let typeId = e.currentTarget.dataset.typeid;
        let item = e.currentTarget.dataset.item;
        item.typeId = typeId;
        if (this.data.productId) {
            wx.setStorage({
                key: 'productId',
                data: this.data.productId,
            })
        }

        wx.setStorage({
            key: 'imgInfoData',
            data: item,
            success: res => {
                wx.navigateTo({
                    url: '../photoInfo/photoInfo',
                })
            }
        })
    },
    alert(text) {
        wx.showToast({
            title: text,
            icon: 'success',
            duration: 2000
        })
    },
    //进入询底价页面
    goFooterPrice(e) {
        let productId = e.currentTarget.dataset.productid;

        wx.setStorage({
            key: 'priceProductId',
            data: productId,
            success: () => {
                wx.navigateTo({
                    url: '../footerPrice/footerPrice',
                })
            }
        })
    },
    onShareAppMessage: function (res) {
      return app.shareCurrentPage(['seriesInfo','productData','photoData', 'productId','notSwitchModel','priceProductId','footerPriceShow'], this)
    }
})
