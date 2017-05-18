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

### Usage
Sample data can be found in the Baidu_Map_Visualization_App/samples folder, add those data into Splunk and try following visualizations.

#### Scatter on Map
   * SPL
		```
		source="police_killings.csv" | table latitude,longitude,p_income 
		```
   * Binding -> Longitude and Latitude Binding = 1,0 (longitude,latitude)
   * Binding -> Data Size Binding = 2
   * Binding -> Data Color Binding = 2

