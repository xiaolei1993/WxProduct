// pages/model/model.js
let app = getApp(),
    util = require('../../utils/util.js');
Page({
    data: {
        //车系ID
        seriesId: '',
        // 车型id
        productId: '',
        //车系数据信息
        seriesInfo:{},
        //车型数据信息
        productData: {},
        //换车型弹层是否显示
        switchModelPop: false,
        //换车型弹层数据
        switchModelData: {},
        // 车型名称
        titleName: '',
        //卡车图片信息
        truckImageData: {},
        //本地经销商参考价
        areaPrice: [],
        //滚动到页面某个id
        scrollInfo: '',
        //查看相似车型数量
        gatherTotal: '',
        //参数配置数据
        parameterData: [],
        //相似车型可选配置数据
        examineSimliarData: {},
        //存储所选的筛选条件
        optionCondition: {},
        //地区热门列表
        hotModelList: [],
        // 经销商列表
        dealerList: [],
        //其他人还关注列表
        otherData: [],
        //其他人还关注列表换一批下表
        otherIndex: 0,
        //其他人还关注换一批按钮
        exchangeButton: true,
        //地区信息
        locationInfo: {
            provinceName: '全国',
            provincesn: '',
            cityName: '',
            citysn: '',
        },
        //加入对比状态
        compareState: {},
        //对比的数量
        compareNumber: '',
        //存储的对比数据
        compareTask: {},
        //询底价数量
        askTotal: '',
        //是否显示询底价
        footerPriceShow: false,
        //错误弹层是否显示和提示
        errPop: false,
        errText: '',

        //是否显示选择地区
        selectLocationPop: false,

        //导航列表
        indexNav: [],
        //搜索内容
        searchContent: '',
        //定位常用地区
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

    onShow: function(options) {

    },
    onLoad: function(options) {
        // 来源为分享的 更新数据
        app.updateDataForShare(options, this , () => {
          //转发进来的页面

          //请求换车型信息
          this.switchModel();

          //请求车型页面数据
          this.getProductData();
        },() => {
          //普通页面进来的页面

          // 获取车型车系信息
          wx.getStorage({
            key: 'productData',
            success: ele => {

              //设置车型信息数据
              this.setData({
                productData: ele.data,
                //车系id
                seriesId: ele.data.F_SubCategoryId,
                //车型id
                productId: ele.data.F_ProductId,
              })
              console.log(this.data.productData, 'this.data.productData222')
              //请求换车型信息
              this.switchModel();

              //请求车型页面数据
              this.getProductData();
            },
          })
          //获取车系信息
          wx.getStorage({
            key: 'seriesInfo',
            success: res => {
              this.setData({
                seriesInfo:res.data
              })
            },
          })
        })
        

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

        // 获取已选择地区
        wx.getStorage({
            key: 'locationInfo',
            complete: res => {
                if (res.data) {
                    //设置选中地区
                    this.setData({
                        locationInfo: res.data
                    })
                }
                //请求经销商数据
                this.getDealer();
            },
        })

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

        //查看定位城市
        wx.getStorage({
            key: 'myRegion',
            success: res => {
                this.setData({
                    myRegion: res.data
                })
            },
        })

        //查看有没有常用地区
        wx.getStorage({
            key: 'hotLocation',
            success: (res) => {
                //查看是否有定位地区
                console.log(this.data.myRegion)
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

        //调取当前所在地区
        //查看之前是否存储过
        // wx.getStorage({
        //   key: 'my_region',
        //   success: (res) => {
        //       // 如果存储过
        //       let data = res.data;
        //       let time = new Date().getTime()

        //       //获取当前时间是否大于之前存储时间的6小时 ？ 重新获取 ： 否则读取缓存数据
        //       if(((time - data.time)/1000/60/60) > 6){
        //         this.goSelectLocation();
        //       }else{
        //         this.setData({
        //           locationInfo:data.data
        //         })
        //         //请求经销商数据
        //         this.getDealer();
        //       }
        //   },
        //   fail: () => {
        //     this.getLocation();
        //   }
        // })

    },
    //请求车型页面数据信息
    getProductData(loading) {
        // 请求页面数据
        wx.request({
            url: app.ajaxurl + 'index.php?r=weex/product/price/&proId=' + this.data.productData.F_ProductId + '&provinceId=' + this.data.locationInfo.provincesn + '&cityId=' + this.data.locationInfo.citysn,
            success: ele => {
                if (ele.errMsg == 'request:ok') {
                  // 标题
                  console.log(ele.data, 'ele.data.proInfo')
                    wx.setNavigationBarTitle({
                        title: ele.data.proInfo.F_ProductName
                    })
                    app.globalData.shareTitle = ele.data.proInfo.F_ProductName

                    // 卡车图片信息
                    let truckImageData = {};
                    //图片数据
                    truckImageData.imgSrc = ele.data.proInfo.imgSrc;
                    //如果图片为空
                    if (!truckImageData.imgSrc) {
                        truckImageData.notImg = true;
                    }

                    truckImageData.rank = ele.data.rank;
                    truckImageData.imgTotal = ele.data.proInfo.F_ImagesCount;
                    truckImageData.price = ele.data.proInfo.F_Price;

                    //车型简称
                    let titleName = ele.data.proInfo.simName;
                    if (titleName == '') {
                        titleName = ele.data.proInfo.F_ProductName
                    }

                    //本地经销商参考价
                    let areaPrice = ele.data.areaPrice;

                    //相似车型可选配置数据
                    let examineSimliarData = {};
                    examineSimliarData.gatherKeys = ele.data.gatherKeys;
                    examineSimliarData.options = ele.data.gatherProParams;
                    examineSimliarData.content = ele.data.gatherProList;

                    //其他人还关注
                    let otherData = [];
                    otherData.push(ele.data.competeProduct);
                    //请求其他人还关注第二页信息
                    if (otherData[0].length) {
                        wx.request({
                            url: 'https://product.360che.com/index.php?r=api/getcompeteproduct&productId=' + this.data.productData.F_ProductId + '&num=2&size=5&isW=1&noCache=1',
                            success: res => {
                                if (res.data.info == 'ok') {
                                    otherData = otherData.concat(res.data.data);
                                    if (otherData.length < 2) {
                                        this.setData({
                                            exchangeButton: false
                                        })
                                    }
                                    //设置其他人还关注信息
                                    this.setData({
                                        otherData: otherData,
                                    })
                                }
                            }
                        })
                    }

                    let footerPriceShow = false;
                    //判断车型是不是停售
                    if (ele.data.proInfo.F_IsStopMake == 4) {
                        footerPriceShow = false;
                    } else {
                        footerPriceShow = true;
                    }

                    // //存储该车型是否是停售
                    wx.setStorage({
                        key: 'footerPriceShow',
                        data: footerPriceShow,
                    })

                    this.setData({
                        // 标题名称
                        titleName: titleName,
                        // 图片信息
                        truckImageData: truckImageData,
                        //本地经销商参考价
                        areaPrice: areaPrice,
                        //查看相似车型数量
                        gatherTotal: ele.data.gatherTotal,
                        //参数配置数据
                        parameterData: ele.data.mainParam,
                        // 相似车型可选配置数据
                        examineSimliarData: examineSimliarData,
                        //询底价数量
                        askTotal: ele.data.askNum,
                        //是否显示询底价
                        footerPriceShow: footerPriceShow
                    })

                    //调取热门地区车型
                    this.getHotModel();

                    if (loading) {
                        this.setData({
                            switchModelPop: false
                        })

                        //关闭loading
                        app.globalData.hideLoading();
                    }

                }
            }
        })
    },
    //请求换车型信息
    switchModel() {
        // 请求换车型弹层
        wx.request({
            url: app.ajaxurl + 'index.php?r=weex/product/get-product-change-list&subId=' + this.data.seriesId + '&seriesId=' + this.data.productData.F_SeriesId + '&proId=' + this.data.productData.F_ProductId,
            success: ele => {
                if (ele.errMsg == 'request:ok') {
                    let switchModelData = {};
                    //换车型列表数据
                    switchModelData.priceList = ele.data.priceList;
                    //换车型标题数据
                    switchModelData.attrList = ele.data.attrList

                    //当前显示的是哪一个
                    if (ele.data.paramName) {
                        switchModelData.paramName = ele.data.paramName;
                    } else {
                        //判断哪一个的length最长显示哪一个
                        let paramName = '';
                        let has = true;
                        ele.data.priceList.forEach((res, index) => {
                            if (has) {
                                has = false;
                                paramName = ele.data.attrList[index];
                                ele.data.priceList.forEach((r, i) => {
                                    if (ele.data.priceList[index].list.length < ele.data.priceList[i].list.length) {
                                        paramName = ele.data.attrList[i];
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
                }
            }
        })
    },
    //其他人还关注 点击换一批
    exchange() {
        let otherIndex = this.data.otherIndex;
        otherIndex++;

        if (otherIndex == this.data.otherData.length - 1) {
            this.setData({
                exchangeButton: false,
            })
        }
        this.setData({
            otherIndex: otherIndex,
        })
    },
    //进入配置 || 图片页面
    goUrl(e) {
        wx.navigateTo({
            url: e.currentTarget.dataset.url,
        })
    },
    //进入询底价页面
    goFooterPrice(e) {
        let productId = e.currentTarget.dataset.productid;
        let dealerInfo = e.currentTarget.dataset.dealerinfo;
        let otherData = e.currentTarget.dataset.otherdata;

        //经销商询底价
        if (dealerInfo) {
            wx.setStorage({
                key: 'priceProductId',
                data: dealerInfo.askProId,
                success: () => {
                    wx.setStorage({
                        key: 'dealerId',
                        data: dealerInfo.dealerId,
                        success: () => {
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
    //点击换车型，重新请求车型页面信息
    goSwitchModel(e) {

        //开启loading
        app.globalData.showLoading('正在加载');

        let productData = this.data.productData;
        productData.F_ProductId = e.currentTarget.dataset.item.F_ProductId

        this.setData({
            productData: productData,
            //重新赋值相似车型
            optionCondition: {},
            //返回页面顶部
            scrollInfo: 'goTop'
        })

        //请求车型信息数据
        this.getProductData(true);

        //请求换车型信息
        this.switchModel();

    },
    //选择相似车型条件选项
    selectOption(e) {
        let key = e.currentTarget.dataset.key;
        let value = e.currentTarget.dataset.value;

        let optionCondition = this.data.optionCondition;
        optionCondition[key] = value;

        //设置存储所选的筛选条件
        this.setData({
            optionCondition: optionCondition
        })
        console.log(this.data.optionCondition)
        //循环对比数据
        //循环数据
        this.data.examineSimliarData.content.forEach((data, index) => {
            //定义条件
            let isAccord = true;
            //循环筛选条件
            for (let ele in this.data.optionCondition) {
                if (isAccord) {
                    if (data[ele] == this.data.optionCondition[ele]) {
                        isAccord = true;
                    } else {
                        isAccord = false;
                    }
                }
            }
            let examineSimliarData = this.data.examineSimliarData;
            if (isAccord) {
                examineSimliarData.content[index].show = true;
            } else {
                examineSimliarData.content[index].show = false;
            }

            this.setData({
                examineSimliarData: examineSimliarData
            })
            console.log(this.data.examineSimliarData)
        });
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
    //查看相似车型
    examineSimilar() {
        this.setData({
            scrollInfo: 'examineSimilar'
        })
    },
    //请求经销商列表
    getDealer() {
        // console.log(this.data.locationInfo,'this.data.locationInfo')
        wx.request({
            url: app.ajaxurl + 'index.php?r=weex/series/dealer&subCateId=' + this.data.seriesId + '&seriesId=' + this.data.productData.F_SeriesId + '&proId=' + this.data.productData.F_ProductId + '&provinceId=' + this.data.locationInfo.provincesn + '&cityId=' + this.data.locationInfo.citysn,
            success: res => {
                if (res.errMsg == 'request:ok') {
                    this.setData({
                        dealerList: res.data.list
                    })
                }
            }
        })
    },
    //请求地区热门车型
    getHotModel() {
        console.log(this.data.examineSimliarData.content, 'examineSimliarData.content')
        wx.request({
            url: app.ajaxurl + 'index.php?r=weex/series/district-price&subCateId=' + this.data.seriesId + '&seriesId=' + this.data.productData.F_SeriesId + '&proId=' + this.data.productData.F_ProductId + '&provinceId=' + this.data.locationInfo.provincesn + '&cityId=' + this.data.locationInfo.citysn,
            success: res => {
                if (res.errMsg == 'request:ok') {
                    this.setData({
                        hotModelList: res.data
                    })
                    let examineSimliarData = this.data.examineSimliarData;

                    examineSimliarData.content.forEach((ele, index) => {

                        //重置热门地区和报价
                        ele.hotLocation = '';
                        ele.hotPrice = ''

                        //循环热门车型报价
                        if (this.data.hotModelList.length) {
                            this.data.hotModelList.forEach((hot, i) => {
                                //如果id相等
                                if (ele.F_ProductId == hot.productId) {
                                    //赋值价格
                                    ele.hotPrice = hot.price;
                                    //是热门
                                    if (hot.hot && hot.hot == 1) {
                                        ele.hotLocation = '[' + this.data.locationInfo.cityname.split('市')[0] + '热门]'
                                    }
                                    let hotprice = examineSimliarData.content.splice(index, '1')[0];
                                    examineSimliarData.content.unshift(hotprice)
                                }
                            })
                        }
                    });

                    this.setData({
                        examineSimliarData: examineSimliarData
                    })

                }
            }
        })
    },
    // 点击选择城市
    goSelectLocation() {
        this.setData({
            selectLocationPop: true
        })
    },
    backSelectLocation() {
        this.setData({
            //选择城市
            cityListPop: false,
            //关闭选择地区弹层
            selectLocationPop: false,
            //取消搜索状态
            searchResultPop: false,
            //删除搜索内容
            searchContent: '',
            //清空搜索结果
            searchResultData: []
        })
    },
    //点击 加入 || 取消对比
    compare(e) {
        let productId = e.target.dataset.productid;
        //获取对比的缓存
        wx.getStorage({
            key: 'compareTask',
            complete: ele => {
                //如果有数据
                if (ele.data) {
                    let compareTask = ele.data;
                    console.log(this.data.compareTask, 'compareTaskcompareTask')

                    console.log(compareTask, 'compareTaskcompareTask')
                    let compareState = this.data.compareState;
                    //如果有车系id存储
                    if (compareTask[this.data.seriesId]) {
                        if (this.data.compareState[productId]) { //取消
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
                        } else { //加入
                            console.log(this.data.compareTask, 'compareTaskcompareTask')
                            console.log(this.data.seriesId, 'this.data.seriesId')
                            console.log(compareTask, 'compareTaskcompareTask')

                            //最多对比两项
                            if (compareTask[this.data.seriesId].length >= 2) {
                                this.setData({
                                    errPop: true,
                                    errText: '只能对比两款车型',
                                })
                            } else {
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

                                console.log(this.data.compareState)

                                //重新存储数据
                                wx.setStorage({
                                    key: 'compareTask',
                                    data: compareTask,
                                })
                            }
                        }
                    } else {
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
                    console.log(this.data.seriesId, 'this.data.seriesId')

                    //加入对比
                    let compareState = this.data.compareState;
                    compareState[productId] = '已加入';

                    // 状态更新
                    this.setData({
                        //添加对比的数量
                        compareNumber: ++this.data.compareNumber,
                        //加入对比
                        compareState: compareState,
                        // compareTask: compareTask
                    })

                    // 数据存储
                    wx.setStorage({
                        key: 'compareTask',
                        data: compareTask,
                    })

                    console.log(this.data.compareState, 'this.data.compareState')
                }
            }
        })
    },
    // //定位地区
    // getLocation(){
    //   // 微信获取经纬度
    //   wx.getLocation({
    //       type: 'wgs84',
    //       success: res => {
    //         var latitude = res.latitude;
    //         var longitude = res.longitude;

    //         // 获取当前位置省市
    //         wx.request({
    //           url:'https://dealer-api.360che.com/inquiryprice/Dealer/getLocation.aspx',
    //           data:{},
    //           success:(res) => {
    //             if(res.errMsg == 'request:ok'){
    //               let my_region = {};
    //               my_region.time = new Date().getTime();
    //               my_region.data = res.data;

    //               this.setData({
    //                  locationInfo:res.data
    //               })
    //               //请求经销商数据
    //               this.getDealer();

    //               //存储定位城市
    //               wx.setStorage({
    //                 key:"my_region",
    //                 data:my_region
    //               })

    //               //存储常用定位地区列表
    //               wx.getStorage({
    //                 key: 'hotLocation',
    //                 success: function(res){
    //                   let data = res.data;
    //                   if(data[0].citysn != my_region.data.citysn){
    //                     data.shift();
    //                     data.unshift(my_region.data);
    //                     wx.setStorage({
    //                       key:"hotLocation",
    //                       data:arr
    //                     })
    //                   }
    //                 },
    //                 fail: function() {
    //                   let arr = [];
    //                   arr.push(my_region.data)
    //                   wx.setStorage({
    //                     key:"hotLocation",
    //                     data:arr
    //                   })
    //                 }
    //               })
    //             }
    //           }
    //         })
    //       }
    //     })
    // },
    //关闭报错弹层
    closeErrPop() {
        this.setData({
            errPop: false,
            errText: '',
        })
    },
    //点击拨打电话
    makePhone(e) {
        let phone = e.target.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone
        })
    },
    alert(text) {
        wx.showToast({
            title: text,
            icon: 'success',
            duration: 2000
        })
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
                    complete: ele => {
                        let data = {};
                        if (ele.data) {
                            data = ele.data
                        }
                        //赋值给对比数据
                        data[this.data.seriesId] = compareTask[this.data.seriesId];

                        compareTask[this.data.seriesId] = [];

                        this.setData({
                            compareTask: compareTask,
                            compareState: {},
                            compareNumber: 0,
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
                                    success: () => {
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
    // 触摸导航列表
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
    cancelSearch() {
        this.setData({
            searchResultPop: false,
            searchContent: '',
            searchResultData: []
        })
    },
    //清空输入框内容
    clearContent(e) {
        console.log(e.detail)
        e.detail = {
            value: ''
        }
    },
    //输入搜素内容，
    searchResult(e) {
        console.log(e.detail.value)
        wx.request({
            url: 'https://product.360che.com/index.php?r=weex/series/get-search-region&value=' + encodeURIComponent(e.detail.value),
            success: (res) => {
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
        //存储已选择的城市
        wx.setStorage({
            key: "locationInfo",
            data: this.data.locationInfo
        })

        //请求地区热门车型
        this.getHotModel()

        wx.request({
            url: 'https://product.360che.com/index.php?r=app/series/city-list&provinceId=' + this.data.locationInfo.provincesn,
            success: (res) => {
                if (res.errMsg == 'request:ok') {
                    let cityList = [];
                    if (res.data !== null) {
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

        //请求地区热门车型
        this.getHotModel()

        //存储已选择的城市
        wx.setStorage({
            key: "locationInfo",
            data: this.data.locationInfo
        })


        if (this.data.myRegion.citysn == e.currentTarget.dataset.citysn) return;

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
            searchResultPop: false,
            //删除搜索内容
            searchContent: '',
            //清空搜索结果
            searchResultData: []
        })

        //请求经销商数据
        this.getDealer();

        //请求地区热门车型
        this.getHotModel()

        //存储已选择的城市
        wx.setStorage({
            key: "locationInfo",
            data: this.data.locationInfo
        })

        //请求经销商数据
        this.getDealer();

        //返回询底价页面
        // wx.navigateBack()
    },
    //隐藏选择城市列表弹层
    cityPopHide() {
        this.setData({
            cityListPop: false
        })
    },
    showLoading: function() {
        wx.showToast({
            title: '加载中',
            icon: 'loading'
        });
    },
    cancelLoading: function() {
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
                        hotLocation: data
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
    onShareAppMessage: function (res) {
      return app.shareCurrentPage(['seriesInfo','productData', 'seriesId', 'productId'], this)
    }
})
