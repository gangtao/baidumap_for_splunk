# Baidu Map plugin for Splunk

### Installation and Build
Baidu map custom visualization for Splunk, to install the app, 
replace window.BMAP_AUTHENTIC_KEY with your key from file Baidu_Map_Visualization_App/appserver/static/visualizations/baidumap/src/mapapi.js  refer to http://lbsyun.baidu.com/apiconsole/key?application=key
and run below commands:
```
export SPLUNK_HOME
cp Baidu_Map_Visualization_App $SPLUNK_HOME/etc/apps
cd $SPLUNK_HOME/etc/apps/Baidu_Map_Visualization_App/appserver/static/visualizations
npm install
npm run build
```

