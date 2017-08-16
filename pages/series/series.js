// pages/seriesColligate/seriesColligate.js
let app = getApp(),
  util = require('../../utils/util.js');
Page({
  data: {
    //车系标题名称
    titleName: '子类车系综述页',
    //车系信息 子类id && 车系id && 品牌id
    seriesInfo: {},
    //车系ID
    seriesId:'',
    //卡车图片信息
    truckImageData: {},
    //当前定位的城市
    myRegion: {},
    //是否重置选择地区弹层
    resetLocationPop: false,
    //选择的城市信息
    locationInfo: {
      provinceName: '全国',
      provinceId: '',
      cityName: '',
      cityId: '',
    },
    // 车型列表数据
    modelList:[],
    //当前状态 在售 || 未发布 || 停售
    sellState: '',
    //当前状态 4*2 || 6*2 || 6*4
    optionState:['','',''],
    //车型列表显示数量
    modelListNumber:10,
    //加入对比状态
    compareState: {},
    //对比的数量
    compareNumber: '',
    //存储的对比数据
    compareTask: {},
    //地区热门列表
    hotModelList:[],
    // 经销商列表
    dealerList:[],
    //其他人还关注列表
    otherData:[],
    //错误弹层是否显示和提示
    errPop:false,
    errText:'',
    //回到页面顶部
    goTop:'',

    //是否显示选择地区
    selectLocationPop:false,

    //导航列表
    indexNav: [],
    //搜索内容
    searchContent:'',
    //定位常用地区S
    hotLocation: [],
    //地区列表
    locationList: [],
    //城市列表
    cityList: [],
    //是否显示城市列表
    cityListPop: false,
    //选中的nav
    navInfo: "",
    //显示选中的nav
    navInfoShow: false,
    //搜索结果列表数据
    searchResultData: [],
    searchResultPop: false,
  },
  onShow: function (options) {
    //如果有停售车型缓存，删除
    wx.getStorage({
      key: 'footerPriceShow',
      success: res => {
        wx.removeStorage({
          key: 'footerPriceShow',
        })
      },
    })

    //获取对比存储数据
    this.getCompareTask();
  },
  onLoad: function (options) {

    // 来源为分享的 更新数据
    app.updateDataForShare(options, this, () => {
      //转发进来
      // let seriesInfo = JSON.parse(options.seriesInfo);
      // this.setData({
      //   //车系信息
      //   seriesInfo: seriesInfo,
      //   //车系id
      //   seriesId: seriesInfo.F_SubCategoryId,
      // })

      //请求标题信息 && 图片信息
      this.getSeriesInfo();

      //请求地址列表信息 && 其他人还关注信息
      this.getOtherData();

      //请求车型列表数据
      this.getProductLidt();

      //请求经销商数据
      // this.getDealer();

      //定位当前地区
      this.getLocation();
    }, () => {
      //正常进入页面
      //读取保存的品牌 && 车系信息
      wx.getStorage({
        key: 'seriesInfo',
        success: ele => {
          console.log(ele, 'ele')
          if (ele.errMsg == 'getStorage:ok') {
            let seriesInfo = ele.data

            this.setData({
              //车系信息
              seriesInfo: seriesInfo,
              //车系id
              seriesId: seriesInfo.F_SubCategoryId,
            })

            //请求标题信息 && 图片信息
            this.getSeriesInfo();

            //请求地址列表信息 && 其他人还关注信息
            this.getOtherData();

            //请求车型列表数据
            this.getProductLidt();

            //请求经销商数据
            // this.getDealer();
          }

          //定位当前地区
          this.getLocation();
        },
        fail: () => {
          this.setData({
            errText: '网络错误~',
            errPop: true
          })
        }
      })
    })

    wx.getStorage({
      key: "locationInfo",
      complete: res => {
        if (res.data) {
          //设置选中地区
          this.setData({
            locationInfo: res.data
          })
        }

        //请求经销商数据
        this.getDealer();

        console.log(this.data.locationInfo, 'this.data.locationInfo')
        //请求地区热门车型
        this.getHotModel(true)
      }
    })

    //请求热门地区 && 价格
    // this.getHotModel();

    // 判断有没有缓存省份数据 ？ 直接读取缓存 ： 发送请求，请求省份数据
    wx.getStorage({
      key: 'provinceData',
      success: (res) => {
        // this.cancelLoading();
        let data = res.data
        //设置省份和indexNav数据
        this.setData({
          indexNav: data.indexNav,
          locationList: data.list
        })
      },
      //如果没有数据，那么发送请求
      fail: () => {
        //请求省份数据
        wx.request({
          url: 'https://dealer-api.360che.com/inquiryprice/Dealer/getProvinceListAZ.aspx',
          data: {},
          success: (res) => {
            if (res.errMsg == 'request:ok') {
              // this.cancelLoading();

              //设置省份和indexNav数据
              this.setData({
                indexNav: res.data.indexNav,
                locationList: res.data.list
              })
              //缓存省份的数据
              wx.setStorage({
                key: "provinceData",
                data: res.data
              })
            }
          }
        })
      }
    })
    //查看有没有常用地区
    wx.getStorage({
      key: 'hotLocation',
      success: (res) => {
        //查看是否有定位地区
        if (this.data.myRegion.cityname) {
          //查看现在存储的是否是6个
          if (res.data.length == 6) {
            res.data.splice(1, 1)
          }
        }
        this.setData({
          hotLocation: res.data
        })
        console.log(this.data.hotLocation, 'hotLocationhotLocationhotLocationhotLocation')
      }
    })

  },
  //请求标题信息 && 图片信息
  getSeriesInfo(){
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/series/info&subCateId=' + this.data.seriesInfo.F_SubCategoryId + '&seriesId=' + this.data.seriesInfo.F_SeriesId,
      success: res => {
        if (res.errMsg == 'request:ok') {

          // 标题
          wx.setNavigationBarTitle({
            title: res.data.h1
          })
          app.globalData.shareTitle = res.data.h1

          // 卡车图片信息
          let truckImageData = {};
          truckImageData.imgSrc = res.data.imgSrc;
          //如果图片为空
          if (!truckImageData.imgSrc) {
            truckImageData.notImg = true;
          }
          truckImageData.imgTotal = res.data.imgTotal;
          truckImageData.priceScope = res.data.priceScope;
          truckImageData.rank = res.data.rank;
          truckImageData.imgUrl = res.data.imgUrl;

          this.setData({
            // 标题名称
            titleName: res.data.h1,
            // 图片信息
            truckImageData: truckImageData
          })
        }
      }
    })
  },

  //获取其他人还关注信息
  getOtherData(){
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/series/other&subCateId=' + this.data.seriesInfo.F_SubCategoryId + '&seriesId=' + this.data.seriesInfo.F_SeriesId,
      success: res => {
        if (res.errMsg == 'request:ok') {

          let footerInfo = {};
          //热门车型id
          footerInfo.ProductId = res.data.askProId;
          //车系询底价人数
          footerInfo.askTotal = res.data.askNum;

          //存储询底价和人数信息
          wx.setStorage({
            key: 'askProId',
            data: footerInfo.ProductId
          })

          this.setData({
            //其他人还关注列表
            otherData: res.data.compete,
            //  车系询底价信息
            footerInfo: footerInfo,
          })
        }
      }
    })
  },

  //请求车型列表信息
  getProductLidt(){
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/series/price&subCateId=' + this.data.seriesInfo.F_SubCategoryId + '&seriesId=' + this.data.seriesInfo.F_SeriesId ,
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          this.setData({
            modelList: res.data,
          })
          // 判断当前状态  在售 && 停售 && 未上市
          let ishave = true;
          this.data.modelList.forEach((ele, index) => {
            if (this.data.modelList[index].list.length > 0 && ishave) {
              this.setData({
                sellState: index
              })
              ishave = false;
            }
          });

          //判断优先显示哪一个分类 4*2 && 6*2 && 6*4
          let islongest = true;
          let longest = '';
          //循环最外层标签
          this.data.modelList.forEach((ele, index) => {
            islongest = true;
            //循环状态下的list
            this.data.modelList[index].list.forEach((key, number) => {
              //定义状态，只循环一次，用第一条数据逐个对比之后的数据
              if (islongest) {
                islongest = false;

                //当车系id为空的时候 获取车系id并赋值
                if (!this.data.seriesId) {
                  this.setData({
                    seriesId: key[0].F_SubCategoryId
                  })
                }

                //获取存储对比数据 && 给元素赋值
                // if (this.data.compareTask[this.data.seriesId]) {
                //   let compareState = {};

                //   //循环存储的对比数据，渲染数据
                //   this.data.compareTask[this.data.seriesId].forEach((res, index) => {
                //       compareState[res] = '已加入'
                //   })
                //   this.setData({
                //     //获取对比的数量
                //     compareNumber: this.data.compareTask[this.data.seriesId].length,
                //     compareState: compareState
                //   })

                //   console.log(this.data.compareTask,'this.data.compareTaskthis.data.compareTask')
                // }

                //默认取第一条数据的length
                longest = this.data.modelList[index].list[number];
                //默认取第一条数据的key
                // this.$set(this.optionState, index, this.modelList[index].attrKey[number])
                let arr = this.data.optionState;
                arr[index] = this.data.modelList[index].attrKey[number];
                this.setData({
                  optionState: arr
                })

                //二次循环，去一一对比
                this.data.modelList[index].list.forEach((k, kNum) => {
                  //如果小于后面的length
                  if (this.data.modelList[index].attrKey[kNum] != 10) {
                    if (longest.length < this.data.modelList[index].list[kNum].length) {
                      //取后面的length比较长的数据
                      longest = this.data.modelList[index].list[kNum];
                      // this.$set(this.optionState, index, this.modelList[index].attrKey[kNum])
                      let arr = this.data.optionState;
                      arr[index] = this.data.modelList[index].attrKey[kNum];
                      this.setData({
                        optionState: arr
                      })
                    }
                  }
                })
              }
            })
          });
        }
      }
    })
  },


  //点击在售 停售 tab切换
  selectSellState(e){
    this.setData({
      sellState:e.target.dataset.index
    })
  },
  //点击加载更多
  loadMore(){
    this.setData({
      modelListNumber:this.data.modelListNumber += 10
    })
  },
  // 切换opation标签 4*2 && 6*2 && 6*4
  selectOpation(e){
    let index = e.currentTarget.dataset.index;
    let name = e.currentTarget.dataset.name;
    
    let optionState = this.data.optionState;

    optionState[index] = name;

    this.setData({
      optionState:optionState,
      //重置加载更多
      modelListNumber:10
    })
  },
  //进入车型页
  goProduct(e){
    console.log(e.currentTarget.dataset.item)
    wx.setStorage({
      key: 'productData',
      data: e.currentTarget.dataset.item,
      success:() => {
        wx.navigateTo({
          url: '../model/model'
        })
      }
    })
  },
  //请求地区热门车型
  getHotModel(clear){
    wx.request({
      url: app.ajaxurl + 'index.php?r=weex/series/district-price&subCateId=' + this.data.seriesId + '&seriesId=' + this.data.seriesInfo.F_SeriesId + '&proId=' + this.data.seriesInfo.proid + '&provinceId=' + this.data.locationInfo.provincesn + '&cityId=' + this.data.locationInfo.citysn ,
      success:res => {
         if (res.errMsg == 'request:ok'){
           this.setData({
            hotModelList:res.data
           })

          if(clear){
              //循环最外层标签
              let modelList = this.data.modelList;
                modelList.forEach((ele, index) => {
                  //如果数据的内容不为空
                  if (modelList[index].list.length > 0) {
                    modelList[index].list.forEach((key, keyNum) => {
                      //循环总列表
                      modelList[index].list[keyNum].forEach((data, number) => {
                          //重置热门地区和报价
                          modelList[index].list[keyNum][number].hotLocation = ''
                          modelList[index].list[keyNum][number].hotPrice = ''
                        })
                    })
                  }
              })
              this.setData({
                modelList: modelList
              })
            }

              //循环热门车型报价
            if (this.data.hotModelList.length) {
                this.data.hotModelList.forEach((hot, i) => {
                    //循环最外层标签
                    let modelList = this.data.modelList;
                    modelList.forEach((ele, index) => {
                      //如果数据的内容不为空
                      if (modelList[index].list.length > 0) {
                        modelList[index].list.forEach((key, keyNum) => {
                                //循环总列表
                                modelList[index].list[keyNum].forEach((data, number) => {

                                    //如果id相等
                                    if (data.F_ProductId == hot.productId) {
                                        console.log('xiangdeng')
                                        let unit = '起';
                                        if (hot.hot == 1) {
                                            unit = '';
                                            //是热门
                                            modelList[index].list[keyNum][number].hotLocation = '[' + this.data.locationInfo.cityname.split('市')[0] + '热门]'
                                        }

                                        //赋值价格
                                        modelList[index].list[keyNum][number].hotPrice =  hot.price + unit;

                                        // 保存去除掉的一个
                                        let hotprice = this.data.modelList[index].list[keyNum].splice(number, '1')[0];

                                        //重新把带价格的推到最上层
                                        modelList[index].list[keyNum].unshift(hotprice)
                                    }
                                })
                            })
                        }
                    })

                    //更新最新状态
                    this.setData({
                      modelList: modelList
                    })
                })
            }


         }
      }
    })
  },
  //请求经销商列表
  getDealer(){
    console.log(this.data.locationInfo,'this.data.location.Info')
    wx.request({
      url: app.ajaxurl + '/index.php?r=weex/series/dealer&subCateId=' + this.data.seriesId + '&seriesId=' + this.data.seriesInfo.F_SeriesId + '&provinceId=' + this.data.locationInfo.provincesn + '&cityId=' + this.data.locationInfo.citysn,
      success:res => {
        if(res.errMsg == 'request:ok'){
          this.setData({
            dealerList:res.data.list
          })
        }
      }
    })
  },
  //点击拨打电话
  makePhone(e){
    let phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  //关闭报错弹层
  closeErrPop(){
    this.setData({
      errPop:false,
      errText:'',
    })
  },
  //定位地区
  getLocation() {
    // 微信获取经纬度
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        var latitude = res.latitude;
        var longitude = res.longitude;

        // 获取当前位置省市
        wx.request({
          url: 'https://product.360che.com/index.php?r=m/ajax/location/pos&longitude=' + longitude + '&latitude=' + latitude,
          data: {},
          success: (res) => {
            if (res.errMsg == 'request:ok') {
              let myRegion = {};
              myRegion.provincename = res.data.province.name;
              myRegion.provincesn = res.data.province.id;

              myRegion.cityname = res.data.city.name;
              myRegion.citysn = res.data.city.id;

              if (myRegion.citysn == null) return ;

              // 设置定位地区
              this.setData({
                myRegion: myRegion
              })

              //存储定位城市
              wx.setStorage({
                key: "myRegion",
                data: myRegion
              })

              //获取有没有存储时间
              wx.getStorage({
                key: 'myDate',
                success: date => {
                  let present = new Date();
                  //查看距离上次定位是否超过两个小时
                  if (((present - new Date(date.data)) >= 2)) {
                    // 获取已经选择的城市
                    wx.getStorage({
                      key: 'locationInfo',
                      success: ele => {
                        //设置之前选择的地区
                        this.setData({
                          locationInfo: ele.data
                        })
                        

                        //查看选择地区和定位地区是否相等
                        if (this.data.locationInfo.citysn != this.data.myRegion.citysn) {
                          this.setData({
                            resetLocationPop: true
                          })
                        }
                      },
                      //调用失败或者没有存储已选择地区
                      fail: err => {
                        wx.showToast({
                          title: '失败',
                          icon: 'success',
                          duration: 2000
                        })
                        //调用存储定位地区
                        this.setMyRegion();
                      }
                    })
                  }
                },
                fail:err => {
                  this.setMyRegion();
                }
              })
              // //存储常用定位地区列表
              // wx.getStorage({
              //   key: 'hotLocation',
              //   success: function (res) {
              //     let data = res.data;
              //     console.log(data[0],'data[0]')
              //     cosnole.log(this.data.myRegion.data,'myRegion.data')
              //     // if (data[0].citysn != this.data.myRegion.data.citysn) {
              //     //   data.shift();
              //     //   data.unshift(myRegion.data);
              //     //   wx.setStorage({
              //     //     key: "hotLocation",
              //     //     data: arr
              //     //   })
              //     // }
              //   },
              //   fail: function () {
              //     let arr = [];
              //     arr.push(myRegion)
              //     wx.setStorage({
              //       key: "hotLocation",
              //       data: arr
              //     })
              //   }
              // })
            }
          }
        })
      },
      fail:ele => {
        //请求经销商列表
        this.getDealer();
      }
    })
  },
  // 点击选择城市
  goSelectLocation() {
    this.setData({
      selectLocationPop: true
    })
  },
  backSelectLocation(){
    this.setData({
      //选择城市
      cityListPop: false,
      //关闭选择地区弹层
      selectLocationPop: false,
      //取消搜索状态
      searchResultPop:false,
      //删除搜索内容
      searchContent: '',
      //清空搜索结果
      searchResultData: []
    })
  },
  //存储定位城市数据
  setMyRegion() {
    this.setData({
      //赋值选择地区为定位地区
      locationInfo: this.data.myRegion,
    })

    //重新请求经销商数据
    this.getDealer();

    //请求热门地区 && 价格
    // this.getHotModel(true);

    //存储定位地区 && 选择地区
    wx.setStorage({
      key: 'myRegion',
      data:this.data.myRegion
    })

    wx.setStorage({
      key: 'locationInfo',
      data: this.data.myRegion
    })

    //存储定位时间
    let date = new Date();
    wx.setStorage({
      key: 'myDate',
      data: date,
    })
    
    //请求地区热门车型
    this.getHotModel(true)
  },
  //取消更换新地区
  okSwitchLocation(){
    this.setData({
      resetLocationPop:false
    })
  },
  //确认更换最新地区
  cancelSwitchLocation(){
    //更换最新地区
    this.setMyRegion();

    this.setData({
      resetLocationPop:false
    })
  },
  alert(text,image){
    wx.showToast({
      title: text,
      icon: 'success',
      image: image,
      duration: 2000
    })
  },
  //进入配置 || 图片页面
  goUrl(e){
    console.log('111111')
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  goFooterPrice(e){
    let productId = e.currentTarget.dataset.productid;
    let dealerInfo = e.currentTarget.dataset.dealerinfo;
    let otherData = e.currentTarget.dataset.otherdata;

    //经销商询底价
    if (dealerInfo){
      wx.setStorage({
        key: 'priceProductId',
        data: dealerInfo.askProId,
        success:() => {
          wx.setStorage({
            key: 'dealerId',
            data: dealerInfo.dealerId,
            success:() => {
              wx.navigateTo({
                url: '../footerPrice/footerPrice',
              })
            }
          })
        }
      })
      return 
    }

    //其他询底价
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
  //获取对比信息
  getCompareTask(){
    //获取对比信息
    wx.getStorage({
      key: 'compareTask',
      success: res => {

        let compareNumber = '';
        let compareState = {};
        if (res.data[this.data.seriesId]) {
          compareNumber = res.data[this.data.seriesId].length;
          //循环数据，改变状态
          res.data[this.data.seriesId].forEach(ele => {
            compareState[ele] = '已加入'
          })
        }

        this.setData({
          //对比的缓存
          compareTask: res.data,
          //对比的数量
          compareNumber: compareNumber,
          //对比的状态
          compareState: compareState
        })
      },
    })
  },
  //点击加入对比
  compare(e){
    let productId = e.currentTarget.dataset.productid;
    //获取对比的缓存
    wx.getStorage({
      key: 'compareTask',
      complete:ele => {
        //如果有数据
        if(ele.data){
          console.log(ele.data,'ele.data')
          let compareTask = ele.data; 
          let compareState = this.data.compareState;
          //如果有车系id存储
          if (compareTask[this.data.seriesId]) {
            if (this.data.compareState[productId]) {  //取消
              //循环已保存的数组 && 删除掉
              compareTask[this.data.seriesId].forEach((ele, index) => {
                if (ele == productId) {
                  //清除当前车型id的存储
                  compareTask[this.data.seriesId].splice(index, index + 1);
                  //取消对比的状态
                  compareState[productId] = '';

                  this.setData({
                    //更新对比状态的数量
                    compareNumber: --this.data.compareNumber,
                    //更新对比的状态
                    compareState: compareState,
                    //更新缓存对比的数据
                    compareTask: compareTask
                  })
                  //重新存储缓存数据
                  wx.setStorage({
                    key: 'compareTask',
                    data: compareTask,
                  })
                }
              });
            }else{  //加入
              console.log(this.data.compareTask)
              //最多对比两项
              if (compareTask[this.data.seriesId].length >= 2){
                // this.alert('只能对比两款车型')
                this.setData({
                  errText: '只能对比两款车型',
                  errPop: true
                })
              }else{
                //添加对比的id
                compareTask[this.data.seriesId].push(productId)
                //添加对比的状态
                compareState[productId] = '已加入'

                //更新数据
                this.setData({
                  //缓存对比的数据
                  compareTask: compareTask,
                  //对比的状态
                  compareState: compareState,
                  //对比的数量
                  compareNumber: ++this.data.compareNumber
                })

                //重新存储数据
                wx.setStorage({
                  key: 'compareTask',
                  data: compareTask,
                })
              }
            }
          }else{
            compareTask[this.data.seriesId] = [];
            compareTask[this.data.seriesId].push(productId);

            //加入对比
            let compareState = this.data.compareState;
            compareState[productId] = '已加入';

            // 状态更新
            this.setData({
              //添加对比的数量
              compareNumber: this.data.compareNumber += 1,
              //加入对比
              compareState: compareState,
            })

            // 数据存储
            wx.setStorage({
              key: 'compareTask',
              data: compareTask,
            })
          }

        } else {
          //如果没有存储过数据

          //未获取到存储，第一次存储
          let compareTask = {};
          compareTask[this.data.seriesId] = [];
          compareTask[this.data.seriesId].push(productId);
          
          //加入对比
          let compareState = this.data.compareState;
          compareState[productId] = '已加入';

          // 状态更新
          this.setData({
            //添加对比的数量
            compareNumber: this.data.compareNumber += 1,
            //加入对比
            compareState: compareState,
          })

          // 数据存储
          wx.setStorage({
            key: 'compareTask',
            data: compareTask,
          })
        }
      }
    })
  },
  // 点击进入其他车系
  goOtherSeries(e){
    let item = e.currentTarget.dataset.item;
    console.log(item)

    this.setData({
      //重新赋值车系信息
      seriesInfo:item.info,
      //回到页面顶部
      goTop:'goTop'
    })

    //请求标题信息 && 图片信息
    this.getSeriesInfo();

    //请求地址列表信息 && 其他人还关注信息
    this.getOtherData();

    //请求车型列表数据
    this.getProductLidt();

    //重新请求经销商数据
    this.getDealer();

    //重新存储车系信息
    wx.setStorage({
      key: 'seriesInfo',
      data: item.info,
    })

    //请求地区热门车型
    this.getHotModel(true)
  },
  //点击对比按钮进入对比页面
  goCompare() {
      //读取对比数据
      wx.getStorage({
        key: 'compareTask',
        success: res => {
          let compareTask = res.data;
          //获取对比需要的信息
          wx.getStorage({
            key: 'compareData',
            complete:ele => {
              let data = {};
              if(ele.data){
                data = ele.data
              }
              //赋值给对比数据
              data[this.data.seriesId] = compareTask[this.data.seriesId];

              compareTask[this.data.seriesId] = [];

              this.setData({
                compareTask: compareTask,
                compareState:{},
                compareNumber:0,
              })

              //存储对比信息数据
              wx.setStorage({
                key: 'compareData',
                data: data,
                success: () => {
                    //存储加入对比数据
                    wx.setStorage({
                      key: 'compareTask',
                      data: compareTask,
                      success:() => {
                        wx.navigateTo({
                          url: '../contrast/contrast',
                        })
                      }
                    })
                }
              })
            }
          })
        },
      })
  },
  //触摸导航列表
  indexNav(e) {
    // console.log(e)
    console.log(e.target.dataset.index)
    this.setData({
      navInfo: e.target.dataset.index,
      navInfoShow: true
    })
    let time = setTimeout(() => {
      clearTimeout(time)
      this.setData({
        navInfoShow: false
      })
    }, 500)
  },
  //搜索框获取焦点
  searching() {
    this.setData({
      searchResultPop: true
    })
  },
  //取消搜索
  cancelSearch(){
    this.setData({
      searchResultPop:false,
      searchContent: '',
      searchResultData: []
    })
  },
  //清空输入框内容
  clearContent(e) {
    console.log(e.detail)
    e.detail = { value: '' }
  },
  //输入搜素内容，
  searchResult(e) {
    console.log(e.detail.value)
    wx.request({
      url: 'https://product.360che.com/index.php?r=weex/series/get-search-region&value=' + encodeURIComponent(e.detail.value),
      success: (res) => {
        console.log(res)
        if (res.errMsg == 'request:ok' && res.data.info == 'ok') {
          console.log(res.data, 'res.data')
          this.setData({
            searchResultData: res.data.data,
          })
          console.log(this.data.searchResultData, 'searchResultDatasearchResultData')
        }
      }
    })
  },
  //选择省份，请求城市列表
  selectProvince(e) {

    let locationInfo = e.currentTarget.dataset;
    locationInfo.cityname = '';
    locationInfo.citysn = '';
    //设置选中地区信息
    this.setData({
      locationInfo: locationInfo
    })
    console.log(this.data.locationInfo)
    //存储已选择的城市
    wx.setStorage({
      key: "locationInfo",
      data: this.data.locationInfo
    })

    //请求地区热门车型
    this.getHotModel(true)

    wx.request({
      url: 'https://product.360che.com/index.php?r=app/series/city-list&provinceId=' + this.data.locationInfo.provincesn,
      success: (res) => {
        if (res.errMsg == 'request:ok') {
          let cityList = [];
          if(res.data !== null){
            cityList = res.data.data
          }
          //给城市列表赋值  显示城市列表
          this.setData({
            cityList: cityList,
            cityListPop: true
          })
        }
      }
    })
    console.log(this.data.locationInfo)
  },
  //选择城市弹窗
  selectCity(e) {
    let locationInfo = this.data.locationInfo;
    locationInfo.cityname = e.currentTarget.dataset.cityname;
    locationInfo.citysn = e.currentTarget.dataset.citysn;
    this.setData({
      locationInfo: locationInfo,
      //选择城市
      cityListPop: false,
      //关闭选择地区弹层
      selectLocationPop: false,
    })

    //请求经销商数据
    this.getDealer();

    //存储已选择的城市
    wx.setStorage({
      key: "locationInfo",
      data: this.data.locationInfo
    })

    //请求地区热门车型
    this.getHotModel(true)

    if (this.data.myRegion.citysn == e.currentTarget.dataset.citysn) return ;

    //存储常用地区
    this.storageLocation();

    //返回询底价页面
    // wx.navigateBack()
  },
  //点击搜素结果列表或者定位地区
  speedySelectLocation(e) {
    //赋值
    this.setData({
      locationInfo: e.currentTarget.dataset,
      //选择城市
      cityListPop: false,
      //关闭选择地区弹层
      selectLocationPop: false,
      //关闭搜素结果列表
      searchResultPop:false,
      //删除搜索内容
      searchContent: '',
      //清空搜索结果
      searchResultData: []
    })

    //存储已选择的城市
    wx.setStorage({
      key: "locationInfo",
      data: this.data.locationInfo
    })

    //请求经销商数据
    this.getDealer();

    //返回询底价页面
    // wx.navigateBack()

    //请求地区热门车型
    this.getHotModel(true)
  },
  //隐藏选择城市列表弹层
  cityPopHide() {
    this.setData({
      cityListPop: false
    })
  },
  showLoading: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    });
  },
  cancelLoading: function () {
    wx.hideToast();
  },
  //存储常用地区
  storageLocation() {
    wx.getStorage({
      key: 'hotLocation',
      success: (res) => {
        let data = res.data;
        
        let ishave = true;
        for (let i = 0; i < data.length; i++) {
          if (data[i].citysn == this.data.locationInfo.citysn && ishave) {
            ishave = false;
          }
        }
        if (ishave) {
          let number = 6;
          //如果有定位地区，那么只能存储5个，否则可以存储6个
          if (this.data.myRegion.cityname) {
            number = 5;
          }
          if (data.length >= number) {
            data.splice(0, 1);
          }
          data.push(this.data.locationInfo)
          wx.setStorage({
            key: 'hotLocation',
            data: data,
          })
          
          this.setData({
            hotLocation:data
          })
        }
      },
      //如果没有地区存储
      fail: () => {
        let arr = [];
        arr.push(this.data.locationInfo)
        wx.setStorage({
          key: 'hotLocation',
          data: arr,
        })
        this.setData({
          hotLocation: arr
        })
      },
    })
  },
  //转发
  onShareAppMessage: function (res) {
    return app.shareCurrentPage(['seriesInfo'], this)
  }
})