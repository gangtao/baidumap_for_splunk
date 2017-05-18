/*
 * Visualization source
 */
define([
        'jquery',
        'underscore',
        'api/SplunkVisualizationBase',
        'api/SplunkVisualizationUtils',
        // Add required assets to this list
        'mapapi',
        'echarts',
        'd3',
        'bmap/bmap'
    ],
    function(
        $,
        _,
        SplunkVisualizationBase,
        vizUtils,
        BMapAPI,
        echarts,
        d3,
        BMapSource
    ) {

        // Extend from SplunkVisualizationBase
        return SplunkVisualizationBase.extend({

            initialize: function() {
                SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
                // Save this.$el for convenience
                this.$el = $(this.el);
                // Initialization logic goes here
                this._echarts = undefined;
                this._data = undefined;
            },

            // Optionally implement to format data returned from search. 
            // The returned object will be passed to updateView as 'data'
            formatData: function(data) {
                if (data.fields.length == 0) {
                    return undefined;
                }

                var config = this.getCurrentConfig();
                console.log(data);

                var option = {
                    // 加载 bmap 组件
                    bmap: {
                        // 百度地图中心经纬度
                        center: [120.13066322374, 30.240018034923],
                        // 百度地图缩放
                        zoom: 5,
                        // 是否开启拖拽缩放，可以只设置 'scale' 或者 'move'
                        roam: true,
                        // 百度地图的自定义样式，见 http://developer.baidu.com/map/jsdevelop-11.htm
                        mapStyle: {
                            //TODO : add formatter for the map styles
                            styleJson: [{
                                'featureType': 'water',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#d1d1d1'
                                }
                            }, {
                                'featureType': 'land',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#f3f3f3'
                                }
                            }, {
                                'featureType': 'railway',
                                'elementType': 'all',
                                'stylers': {
                                    'visibility': 'off'
                                }
                            }, {
                                'featureType': 'highway',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#fdfdfd'
                                }
                            }, {
                                'featureType': 'highway',
                                'elementType': 'labels',
                                'stylers': {
                                    'visibility': 'off'
                                }
                            }, {
                                'featureType': 'arterial',
                                'elementType': 'geometry',
                                'stylers': {
                                    'color': '#fefefe'
                                }
                            }, {
                                'featureType': 'arterial',
                                'elementType': 'geometry.fill',
                                'stylers': {
                                    'color': '#fefefe'
                                }
                            }, {
                                'featureType': 'poi',
                                'elementType': 'all',
                                'stylers': {
                                    'visibility': 'off'
                                }
                            }, {
                                'featureType': 'green',
                                'elementType': 'all',
                                'stylers': {
                                    'visibility': 'off'
                                }
                            }, {
                                'featureType': 'subway',
                                'elementType': 'all',
                                'stylers': {
                                    'visibility': 'off'
                                }
                            }, {
                                'featureType': 'manmade',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#d1d1d1'
                                }
                            }, {
                                'featureType': 'local',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#d1d1d1'
                                }
                            }, {
                                'featureType': 'arterial',
                                'elementType': 'labels',
                                'stylers': {
                                    'visibility': 'off'
                                }
                            }, {
                                'featureType': 'boundary',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#fefefe'
                                }
                            }, {
                                'featureType': 'building',
                                'elementType': 'all',
                                'stylers': {
                                    'color': '#d1d1d1'
                                }
                            }, {
                                'featureType': 'label',
                                'elementType': 'labels.text.fill',
                                'stylers': {
                                    'color': '#999999'
                                }
                            }]
                        }
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    visualMap: [],
                    series: []
                }

                return this._buildMapOption(data, config, option);
            },

            // Implement updateView to render a visualization.
            //  'data' will be the data object returned from formatData or from the search
            //  'config' will be the configuration property object
            updateView: function(data, config) {
                if (data == undefined) {
                    return;
                }

                console.log(data);
                //console.log(JSON.stringify(data));
                this._echarts = echarts.init(this.el);;
                this._data = data;
                this._echarts.setOption(this._data);

                var bmap = this._echarts.getModel().getComponent('bmap').getBMap();

                if (config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.mapTypeControlShow"] == "true") {
                    bmap.addControl(new BMap.MapTypeControl()); //地图控件
                }

                if (config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.mapNavigationControlShow"] == "true") {
                    bmap.addControl(new BMap.NavigationControl()); // 缩放控件
                }

                if (config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.mapScaleControlShow"] == "true") {
                    bmap.addControl(new BMap.ScaleControl()); // 比例尺
                }
            },

            // Search data params
            getInitialDataParams: function() {
                return ({
                    outputMode: SplunkVisualizationBase.COLUMN_MAJOR_OUTPUT_MODE,
                    count: 10000
                });
            },

            // Override to respond to re-sizing events
            reflow: function() {
                //TODO : handle resize of both map and charts
                /*
                if (this._echarts) {
                    this._echarts.resize();
                }
                */
            },

            // convert text to an array of index numbers
            _text2binding: function(text) {
                if (text.trim().length == 0) {
                    return [];
                }

                var list = text.split(",");
                var result = [];
                list.map(function(t) {
                    result.push(parseInt(t));
                });
                return result
            },

            _buildMapOption: function(data, config, option) {
                var locationBinding = this._text2binding(config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.locationBinding"]);
                var dataSizeBinding = this._text2binding(config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.dataSizeBinding"]);
                var dataColorBinding = this._text2binding(config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.dataColorBinding"]);

                if (locationBinding.length != 2) {
                    console.log("scatter on geo need longtitue and latitude bindings");
                    return option;
                }

                var col = {};
                col.data = [];
                col.type = 'scatter';
                col.coordinateSystem = 'bmap';

                var dataSizeBindingIndex = undefined;
                var dataColorBindingIndex = undefined;

                //Caculating binding indexes, default already bind to lang/lat of locationBinding
                var index = 2;
                if (dataSizeBinding.length > 0) {
                    dataSizeBindingIndex = index;
                    index = index + 1;
                }
                if (dataColorBinding.length > 0) {
                    dataColorBindingIndex = index;
                    index = index + 1;
                }

                var i = 0,
                    length = data.columns[locationBinding[0]].length;
                for (; i < length; i++) {
                    var location = [data.columns[locationBinding[0]][i], data.columns[locationBinding[1]][i]];
                    var values = [];
                    if (dataSizeBinding.length > 0) {
                        values.push(data.columns[dataSizeBinding[0]][i]);
                    }

                    if (dataColorBinding.length > 0) {
                        values.push(data.columns[dataColorBinding[0]][i]);
                    }

                    var item = location.concat(values);
                    col.data.push(item);
                }

                var center = [];
                var d_long = data.columns[locationBinding[0]].map(function(item) {
                    return parseFloat(item);
                });
                var d_lat = data.columns[locationBinding[1]].map(function(item) {
                    return parseFloat(item);
                });

                center[0] = (d3.max(d_long) + d3.min(d_long)) / 2;
                center[1] = (d3.max(d_lat) + d3.min(d_lat)) / 2;
                option.bmap.center = center;

                if (dataSizeBinding.length > 0) {
                    this._bindSize(dataSizeBindingIndex, data.columns[dataSizeBinding[0]], option, config);
                }

                if (dataColorBinding.length > 0) {
                    this._bindColor(dataColorBindingIndex, data.columns[dataColorBinding[0]], option, config);
                }

                option.series.push(col);

                return option;
            },

            _bindSize: function(bindIndex, data, option, config) {
                var sizeMax = parseInt(config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.dataSizeMax"]);
                var sizeMin = parseInt(config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.dataSizeMin"]);


                var map = {};
                map.min = d3.min(data.map(function(item) {
                    return parseFloat(item);
                }));
                map.max = d3.max(data.map(function(item) {
                    return parseFloat(item);
                }));
                map.range = [map.min, map.max];
                map.calculable = true;
                map.realtime = true;
                map.dimension = bindIndex;
                map.inRange = { symbolSize: [sizeMin, sizeMax] };
                map.left = "right";
                map.top = "top";
                option.visualMap.push(map);
            },

            _bindColor: function(bindIndex, data, option, config) {
                var colorHigh = config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.colorHigh"];
                var colorMedium = config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.colorMedium"];
                var colorLow = config["display.visualizations.custom.Baidu_Map_Visualization_App.baidumap.colorLow"];

                if ($.isNumeric(data[0])) {
                    var map = {};
                    map.dimension = bindIndex;
                    map.min = d3.min(data.map(function(item) {
                        return parseFloat(item);
                    }));
                    map.max = d3.max(data.map(function(item) {
                        return parseFloat(item);
                    }));
                    map.range = [map.min, map.max];
                    map.calculable = true;
                    map.realtime = true;
                    map.inRange = { color: [colorLow, colorMedium, colorHigh] };
                    map.left = "right";
                    map.top = "bottom";
                    option.visualMap.push(map);
                } else {
                    var map = {};
                    map.dimension = bindIndex;
                    map.categories = data.filter(function(value, index, self) {
                        return self.indexOf(value) === index;
                    });
                    map.inRange = { color: d3.schemeCategory10 };
                    map.left = "right";
                    map.top = "bottom";
                    option.visualMap.push(map);
                }
            }
        });
    });
