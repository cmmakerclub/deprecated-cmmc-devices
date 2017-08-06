function isValidJson(e){try{JSON.parse(e)}catch(t){return!1}return!0}!function(){"use strict";angular.module("cmmcDevices",["ngAnimate","ngCookies","ngSanitize","ui.router","ngMaterial","ngStorage"])}(),angular.module("cmmcDevices").directive("sidebarMqttConfig",function(){return{templateUrl:"app/main/partials/sidebar.html",restrict:"E",link:function(e,t,n){}}});var buildToggler=function(e,t,n,i){var o=function(){t(e).toggle().then(function(){i.debug("toggle "+e+" is done")})};return n.debounce(o,200)},getObjectSize=function(e){return Object.keys(e).length||0};!function(){"use strict";function e(e,o,a,c,r,l,d,s,u,m){function g(e,t,n,i){e.devices=i,e.deviceUUID=n,e.hide=function(e){t.hide(e)},e.cancel=function(){t.cancel()}}g.$inject=["$scope","$mdDialog","deviceUUID","devices"];var f=angular.extend(this,{devices:{},LWT:{ALL:{},DEAD:{},ONLINE:{}},LWT_COUNT:{ALL:0,DEAD:0,ONLINE:0}});o.toggleRight=buildToggler("right",d,s,m),angular.extend(o,{data:{cb_auth:!1,cb_clientId:!1,ssl:!1}}),o.closeNav=function(){m.debug("close nave"),d("right").close().then(function(){o.config=angular.extend({},o.storage.config)})},o.closeAndSaveNewConfig=function(e){m.debug("close & save"),d("right").close().then(function(){o.storage.config=e,o.disconnect(),o.connect()})},angular.extend(o,{onlineStatus:"ALL",filterDevice:{name:""},$scope:{filterDevice:{}}}),o.showDetail=function(e,t){u.show({controller:g,templateUrl:"app/main/partials/detail.html",parent:angular.element(document.body),targetEvent:e,clickOutsideToClose:!0,locals:{deviceUUID:t,devices:o.allDevices}}).then(function(){},function(){m.info("You cancelled the dialog.")})},o.reset=function(){r.$reset(),window.location.reload()},o.allDevices=function(){return f.devices};var v=function(){f.LWT_COUNT.ALL=getObjectSize(f.LWT.ALL),f.LWT_COUNT.ONLINE=getObjectSize(f.LWT.ONLINE),f.LWT_COUNT.DEAD=getObjectSize(f.LWT.DEAD),angular.forEach(f.LWT.DEAD,function(e,t){f.devices[t]&&(f.devices[t].status="DEAD")}),angular.forEach(f.LWT.ONLINE,function(e,t){f.devices[t]&&(f.devices[t].status="ONLINE")})};o.connect=function(){m.debug("[0] CONNECT ... "),o.status="CONNECTING...",c.create(o.config).then(function(){return c.connect()}).then(function(){var e=o.config.prefix;c.subscribe(e+"/+/status"),c.subscribe(e+"/+/lwt")}).then(function(t){return c.on("message",function(t,o,a){var c,r,l,d;n(e,t,o).then(function(e){return""===e[0]&&e.shift(),m.info(e),e}).then(function(t){if(c=t,r=c[1],l=c[2],m.debug("action: ",l,r),"lwt"==l){m.debug(o);var n=o.split("|");return d=n[0],"lwt"}return"status"==l?i(e,o):void 0}).then(function(e){"lwt"==e?(delete f.LWT.DEAD[r],delete f.LWT.ONLINE[r],f.LWT.ALL[r]=o,f.LWT[d][r]=o,v()):e&&e.d&&(e.status="ONLINE",f.devices[r]=e,v())})["catch"](function(e){m.debug("ERROR: ",e)})}),t}).then(function(e){o.status="READY",o._client=e})["catch"](function(e){o.failed=!0,o.status=e.errorMessage})},o.disconnect=function(){m.debug("CALLING DISCONNECT..."),o._client&&o._client.disconnect()};var p=function(e){return o.storage.isFirstTime};o.storage=r.$default({isFirstTime:!0}),o.config=angular.extend({},t),p(o.config)?(a(function(){d("right").open(),o.storage.isFirstTime=!1,r.$apply()},2e3),o.connect()):o.connect()}e.$inject=["$q","$scope","$timeout","myMqtt","$localStorage","$sessionStorage","$mdSidenav","$mdUtil","$mdDialog","$log"],angular.module("cmmcDevices").factory("myMqtt",["mqttwsProvider",function(e){return e({})}]).controller("MainController",e);var t={host:"128.199.232.29",port:8083,prefix:"CMMC",clientId:"CMMC-"+100*Math.random()},n=function(e,t,n){var i=e.defer();return i.resolve(t.split("/")),i.promise},i=function(e,t){var n,i=e.defer();try{n=JSON.parse(t),i.resolve(n)}catch(o){i.reject(o)}return i.promise}}(),function(){"use strict";function e(){function e(e){var t=this;t.relativeDate=e(t.creationDate).fromNow()}e.$inject=["moment"];var t={restrict:"E",templateUrl:"app/components/navbar/navbar.html",scope:{creationDate:"="},controller:e,controllerAs:"vm",bindToController:!0};return t}angular.module("cmmcDevices").directive("myNavBar",e)}(),angular.module("cmmcDevices").filter("status",function(){return function(e,t){if("ALL"==t)return e;var n={};return angular.forEach(e,function(e,i){e.status==t&&(n[i]=e)}),n}}).filter("name",function(){return function(e,t){var n={};return angular.forEach(e,function(e,i){e.d&&e.d.myName&&e.d.myName.toLowerCase().indexOf(t.toLowerCase())>-1&&(n[i]=e)}),n}}).filter("isEmpty",function(){var e;return function(t){for(e in t)if(t.hasOwnProperty(e))return!1;return!0}}),angular.module("cmmcDevices").controller("aboutCtrl",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("cmmcDevices").provider("mqttwsProvider",function(){this.$get=["$q","$window","$log",function(e,t,n){var i=function(e){var t=new Date;return e+"."+t.getTime()};return function(t){var o,a,c,r=!1,l=!0,d={},s={};return{on:function(e,t){d[e]=t},addListener:function(e,t){d[e]=t},create:function(t){var r=e.defer();return t=angular.extend(s,t),o=t.host,a=parseInt(t.port,10),n.debug("CREATE",t),t.clientId||(t.clientId=i("RANDOM"),n.debug("PROVIDER"," clientId = ",t.clientId)),c=new Paho.MQTT.Client(o,a,t.clientId),r.resolve(c),r.promise},subscribe:function(t,n){var i=e.defer();return n=n||{qos:0},n.onSuccess=function(){i.resolve(c)},c.subscribe(t,n),i.promise},connect:function(){var t=e.defer(),i=function(){var e=d.connected||function(){n.debug("[69] DEFAULT CONNECTED..")};e.call(null,arguments),n.debug("[Provider] onSuccess","MQTT CONNECTED.."),t.resolve(arguments)},o=function(e){n.info("[86]..FAILED....",e),t.reject(e)},a={timeout:10,useSSL:r,mqttVersion:3,cleanSession:l,onSuccess:i,onFailure:o};return n.debug("[101] PROVIDER","OPTIONS",s),s.username&&angular.extend(a,{username:s.username,password:s.password}),n.debug("MQTT CONNECTION OPTIONS = ",a),c.onMessageArrived=function(e){try{var t=e.destinationName,i=e.payloadString,o=d.message||angular.noop;o.apply(null,[t,i,e])}catch(a){n.info("[error] skipped. still running..",a)}},c.onConnectionLost=function(e){console.log("onConnection Lost ",e)},c.connect(a),t.promise}}}}]}),function(){"use strict";function e(e){e.debug("runBlock end")}e.$inject=["$log"],angular.module("cmmcDevices").run(e)}(),function(){"use strict";function e(e,t){e.state("home",{url:"/",templateUrl:"app/main/partials/main.html",controller:"MainController",controllerAs:"main"}).state("about",{url:"/about",templateUrl:"app/about/partials/about.html",controller:"aboutCtrl",controllerAs:"about"}),t.otherwise("/")}e.$inject=["$stateProvider","$urlRouterProvider"],angular.module("cmmcDevices").config(e)}(),function(){"use strict";angular.module("cmmcDevices").constant("toastr",toastr).constant("moment",moment)}(),function(){"use strict";function e(e,t,n){e.debugEnabled(!1),t.options.timeOut=3e3,t.options.positionClass="toast-top-right",t.options.preventDuplicates=!0,t.options.progressBar=!0,n.theme("default").primaryPalette("indigo").accentPalette("orange")}e.$inject=["$logProvider","toastr","$mdThemingProvider"],angular.module("cmmcDevices").config(e)}(),angular.module("cmmcDevices").run(["$templateCache",function(e){e.put("app/about/partials/about.html","<md-content layout-fill><header><my-nav-bar creationdate=main.creationDate></my-nav-bar></header><md-content>CMMC Devices has been developed by CMMC, credit to @allfake24, @nazt :)</md-content></md-content>"),e.put("app/main/partials/_form_item.html",'<md-input-container><label>Host</label> <input ng-model=config.host required></md-input-container><md-input-container><label>Port</label> <input ng-model=config.port required></md-input-container><md-input-container><label>Prefix</label> <input ng-model=config.prefix required></md-input-container><md-input-container ng-show=data.cb_auth><label>Username</label> <input ng-model=config.username name=cmmc-username></md-input-container><md-input-container ng-show=data.cb_auth><label>Password</label> <input ng-model=config.password name=cmmc-password></md-input-container><md-input-container ng-show=data.cb_clientId><label>clientId</label> <input ng-model=config.clientId type=text required></md-input-container><div class=cmmc-checkboxes flex=100><md-checkbox aria-labelledby=label ng-model=data.cb_auth aria-label="Checkbox 2" class="md-warn md-align-top-left">username & password</md-checkbox></div><div class=cmmc-checkboxes flex=100><md-checkbox ng-model=data.cb_clientId aria-label=ClientId class="md-warn md-align-top-left">clientId</md-checkbox></div><div class=cmmc-checkboxes flex=100><md-checkbox ng-init="data.ssl=false" ng-model=data.ssl aria-label=SSL class="md-warn md-align-top-left">SSL</md-checkbox></div>'),e.put("app/main/partials/detail.html",'<md-dialog flex=60><md-toolbar><div class=md-toolbar-tools><h2>{{ devices()[deviceUUID].d.myName }}</h2><span flex></span></div></md-toolbar><md-dialog-content layout-padding><h3>d</h3><div ng-repeat="(key, value) in devices()[deviceUUID].d" layout=row><div flex=40>{{ key }}</div><div flex=60>{{ value }}</div></div><h3>info</h3><div ng-repeat="(key, value) in devices()[deviceUUID].info" layout=row><div flex=40>{{ key }}</div><div flex=60>{{ value }}</div></div></md-dialog-content></md-dialog>'),e.put("app/main/partials/firstPopup.html","<md-dialog flex=40 layout-padding=10 aria-label=config-dialog><md-toolbar><div class=md-toolbar-tools><h2>Config</h2><span flex></span></div></md-toolbar><md-dialog-content md-dynamic-height><form name=newConfig ng-submit=save(config)><div ng-include=\"'app/main/partials/_form_item.html'\"></div><md-input-container><md-button class=md-raised ng-click=closeAndSaveNewConfig(config)>Save</md-button></md-input-container></form></md-dialog-content></md-dialog>"),e.put("app/main/partials/main.html",'<md-content layout-fill><header><my-nav-bar creationdate=main.creationDate></my-nav-bar></header><section class=main-section md-dynamic-height><div layout=row layout-align="end center"><div layout=row flex=100 layout-align="end bottom"><md-input-container class=md-block flex-gt-sm><label>Filter device</label> <input ng-model=filterDevice.name></md-input-container><md-input-container><md-select aria-label="online status" name=onlineStatus ng-model=onlineStatus required><md-option value=ALL>ALL DEVICES ({{ main.LWT_COUNT.ALL }})</md-option><md-option value=ONLINE>ONLINE ({{ main.LWT_COUNT.ONLINE }})</md-option><md-option value=DEAD>DEAD ({{ main.LWT_COUNT.DEAD }})</md-option></md-select></md-input-container><md-button ng-click=toggleRight() class=md-primary>Config</md-button><md-button ng-click=reset() class=md-danger>RESET</md-button></div><sidebar-mqtt-config></sidebar-mqtt-config></div><md-content flex layout-padding layout-align=center>{{ status }}</md-content><md-grid-list md-cols-xs=1 md-cols-sm=2 md-cols-md=2 md-cols-gt-md=4 md-row-height-gt-md=1:1 md-row-height=2:2 md-gutter=12px md-gutter-gt-sm=8px><md-grid-tile md-rowspan=1 md-colspan=1 ng-class=device.status ng-repeat="(key, device) in main.devices | name:filterDevice.name | status:onlineStatus | orderBy:\'status\'"><md-card ng-class=main.LWT[device.info.client_id] class=item><md-content layout-padding><div layout=row><div flex=100><b>{{device.d.myName}}</b></div></div><div layout=row><div flex=40>ip</div><div flex=60>{{ device.info.ip }}</div></div><div layout=row><div flex=40>heap</div><div flex=60>{{device.d.heap/1000}} kB</div></div><div layout=row><div flex=40>run time</div><div flex=60>{{ ((device.d.millis/1000*24)/(86400)).toFixed(5) }} hours</div></div><div layout=row><div flex=40>prefix</div><div flex=60>{{device.info.prefix}}/{{ device.info.device_id || device.d.device_id }}/status</div></div><div class=md-actions layout=row layout-align="end center"><md-button ng-click="showDetail($event, key)">Detail</md-button></div></md-content></md-card></md-grid-tile></md-grid-list></section></md-content>'),e.put("app/main/partials/sidebar.html",'<section><md-sidenav md-dynamic-height class="md-sidenav-right md-whiteframe-z2" md-component-id=right layout-align="start center"><md-toolbar class=md-theme-light layout=row layout-align="center center">Configuration</md-toolbar><md-content layout-padding class=autoScroll md-dynamic-height><div ng-include="\'app/main/partials/_form_item.html\'"></div><md-input-container><md-button class=md-raised ng-click=closeAndSaveNewConfig(config)>Save</md-button><md-button class="md-raised md-warn" ng-click=closeNav()>Cancel</md-button></md-input-container></md-content></md-sidenav></section>'),e.put("app/components/navbar/navbar.html",'<md-toolbar layout=row layout-align="center center"><md-button href=https://cmmakerclub.com>CMMC Devices</md-button><section flex layout=row layout-align="left center"><md-button href="#/" class=md-raised>Devices</md-button><md-button href=#/about class=md-raised>About</md-button></section></md-toolbar>')}]);