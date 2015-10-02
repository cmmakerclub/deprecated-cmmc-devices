!function(){"use strict";angular.module("gulpAngularMqttWs",["ngAnimate","ngCookies","ngTouch","ngSanitize","ui.router","ngMaterial","ngStorage"])}(),angular.module("gulpAngularMqttWs").directive("sidebarNetpieConfig",function(){return{templateUrl:"app/netpie/partials/sidebar.html",scope:{config:"=config"},restrict:"E",link:function(e,t,n){console.log(e)}}}),angular.module("gulpAngularMqttWs").controller("netpieCtrl",["$mdUtil","$mdSidenav","$scope","$http","$localStorage","$mdToast",function(e,t,n,a,i,o){var d=function(n){var a=e.debounce(function(){t(n).toggle().then(function(){console.log("toggle "+n+" is done")})},200);return a};n.toggleRight=d("right"),n.storage=i.$default({netpie:{appKey:"2syAvlZPSExXY3M",appSecret:"p5OMOHvdvFaTYSoAx1pvEUZNtD2EW6",appId:"HelloChiangMaiMakerClub"},netpieApp:[]}),n.config={netpie:{appKey:"2syAvlZPSExXY3M",appSecret:"p5OMOHvdvFaTYSoAx1pvEUZNtD2EW6",appId:"HelloChiangMaiMakerClub"}},console.log(n.config),n.setGear=function(e){n.config.netpie=e},n.getMqttPass=function(e){console.log("GETTING MQTT AUTH");var t="https://netpie-api.herokuapp.com/api/";t+=e.appKey+"/",t+=e.appSecret+"/",t+=e.appId,t+="?callback=JSON_CALLBACK",console.log(t),a.jsonp(t).success(function(t){console.log(t),n.data=t,n.loading=!1,n.appSuccess="Success";var a=!0;if(angular.forEach(n.storage.netpieApp,function(i,o){if(i.appId==e.appId&&i.appSecret==e.appSecret&&i.appKey==e.appKey){var d={};d.appId=i.appId,d.appKey=i.appKey,d.appSecret=i.appSecret;var r=angular.extend(d,t);n.storage.netpieApp[o].microgears.push(r),a=!1,console.log(r)}}),a){var i=angular.extend({},e,t);e.microgears=[],e.microgears.push(i),n.storage.netpieApp.push(e)}}).error(function(){console.log("FAILED",arguments),n.loading=!1,n.appError="Failed: "+arguments[1]+" "+arguments[0]})}}]),angular.module("gulpAngularMqttWs").directive("sidebarMqttConfig",function(){return{templateUrl:"app/main/partials/sidebar.html",restrict:"E",link:function(e,t,n){}}}),function(){"use strict";function e(e,t,n,a,i,o,d,r){function l(e,t,n,a){e.devices=a,e.deviceUUID=n,e.hide=function(e){t.hide(e)},e.cancel=function(){t.cancel()}}function c(e,t){e.config={host:"gearbroker.netpie.io",port:8083},e.save=function(e){t.hide(e)}}var s=this;s.devices={},s.LWT={};var m=function(e){var t=d.debounce(function(){o(e).toggle().then(function(){console.log("toggle "+e+" is done")})},200);return t};e.toggleRight=m("right"),e.storage=a.$default({config:{}}),e.closeNav=function(){o("right").close().then(function(){e.config=angular.extend({},e.storage.config)})},e.closeAndSaveNewConfig=function(t){o("right").close().then(function(){e.storage.config=t,e.connect()})},e.config=angular.extend({},e.storage.config),e.onlineStatus="ALL",e.filterDevice={},e.filterDevice.name="";var u=function(){var t=function(t,n){var a=JSON.parse(n),i=a.info&&a.info.id,o=a.d&&a.d.id;a.status=s.LWT[o||i]||"ONLINE"||"UNKNOWN",a.online="DEAD"!==a.status,s.devices[o||i]=a,delete s.devices.undefined,e.$apply()};n.on("message",t)};e.showDetail=function(t,n){r.show({controller:l,templateUrl:"app/main/partials/detail.html",parent:angular.element(document.body),targetEvent:t,clickOutsideToClose:!0,locals:{deviceUUID:n,devices:e.allDevices}}).then(function(){},function(){e.status="You cancelled the dialog."})};var p=function(){return null!=e.config.host&&""!=e.config.host?!1:!0};e.showFirstPopup=function(t){p()&&r.show({controller:c,templateUrl:"app/main/partials/firstPopup.html",parent:angular.element(document.body),targetEvent:t,clickOutsideToClose:!1}).then(function(t){e.config=t,e.storage.config=t,o("right").open()},function(){e.connect()})};e.allDevices=function(){return s.devices},e.connect=function(){u(),s.devices={},angular.forEach(e.config,function(t,n){""==e.config[n]&&delete e.config[n]}),n.create(e.config).then(n.connect()).then(n.subscribe("/HelloChiangMaiMakerClub/gearname/#")).then(function(){console.log("ALL DONE")})},e.disconnect=function(){},l.$inject=["$scope","$mdDialog","deviceUUID","devices"],c.$inject=["$scope","$mdDialog"],p()||e.connect()}var t={};angular.module("gulpAngularMqttWs").factory("myMqtt",["mqttwsProvider",function(e){var n=e(t);return n}]).controller("MainController",e),e.$inject=["$scope","$timeout","myMqtt","$localStorage","$sessionStorage","$mdSidenav","$mdUtil","$mdDialog"]}(),function(){"use strict";function e(){function e(e){var t=this;t.relativeDate=e(t.creationDate).fromNow()}var t={restrict:"E",templateUrl:"app/components/navbar/navbar.html",scope:{creationDate:"="},controller:e,controllerAs:"vm",bindToController:!0};return e.$inject=["moment"],t}angular.module("gulpAngularMqttWs").directive("acmeNavbar",e)}(),angular.module("gulpAngularMqttWs").filter("status",function(){return function(e,t){if("ALL"==t)return e;var n={};return angular.forEach(e,function(e,a){e.status==t&&(n[a]=e)}),n}}).filter("name",function(){return function(e,t){var n={};return angular.forEach(e,function(e,a){e.d.myName.toLowerCase().indexOf(t.toLowerCase())>-1&&(n[a]=e)}),n}}).filter("isEmpty",function(){var e;return function(t){for(e in t)if(t.hasOwnProperty(e))return!1;return!0}}),angular.module("gulpAngularMqttWs").controller("aboutCtrl",["$scope",function(e){e.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("gulpAngularMqttWs").provider("mqttwsProvider",function(){this.$get=["$q","$window",function(e,t){return function(t){var n,a,i,o=!1,d=!1,r={},l={},c={on:function(e,t){r[e]=t},addListener:function(e,t){r[e]=t},subscribe:function(t,n){return n=n||{qos:0},function(){var a=e.defer(),o=function(){a.resolve(i)};return n.onSuccess=o,i.subscribe(t,n),console.log("SUB",t,n),a.promise}},create:function(t){var o=e.defer();return t=angular.extend(l,t),n=t.host,a=parseInt(t.port,10),console.log("CRESATE",t),i=new Paho.MQTT.Client(n,a,t.clientId),o.resolve(i),o.promise},connect:function(){return function(){var t=e.defer(),n=function(){var e=r.connected||function(){};console.log("CONNECTED"),e.call(null,arguments),t.resolve(arguments)},a=function(e){console.log(e),t.reject(e)},c={timeout:3,useSSL:o,mqttVersion:3,cleanSession:d,onSuccess:n,onFailure:a};return console.log(l),l.username&&(c.userName=l.username,c.password=l.password),i.connect(c),i.onMessageArrived=function(e){var t=e.destinationName,n=e.payloadString,a=r.message||function(){};a.apply(null,[t,n,e]);var i=r[t.toString()]||function(){};i.apply(null,[n,e])},t.promise}}};return c}}]}),function(){"use strict";function e(e){e.debug("runBlock end")}angular.module("gulpAngularMqttWs").run(e),e.$inject=["$log"]}(),function(){"use strict";function e(e,t){e.state("home",{url:"/",templateUrl:"app/main/partials/main.html",controller:"MainController",controllerAs:"main"}).state("netpie",{url:"/netpie",templateUrl:"app/netpie/partials/netpie.html",controller:"netpieCtrl",controllerAs:"netpie"}).state("about",{url:"/about",templateUrl:"app/about/partials/about.html",controller:"aboutCtrl",controllerAs:"about"}),t.otherwise("/")}angular.module("gulpAngularMqttWs").config(e),e.$inject=["$stateProvider","$urlRouterProvider"]}(),function(){"use strict";angular.module("gulpAngularMqttWs").constant("toastr",toastr).constant("moment",moment)}(),function(){"use strict";function e(e,t,n){e.debugEnabled(!0),t.options.timeOut=3e3,t.options.positionClass="toast-top-right",t.options.preventDuplicates=!0,t.options.progressBar=!0}angular.module("gulpAngularMqttWs").config(e),e.$inject=["$logProvider","toastr","$mdThemingProvider"]}(),angular.module("gulpAngularMqttWs").run(["$templateCache",function(e){e.put("app/about/partials/about.html",'<div layout="column" layout-fill="" class="nat-wrapper"><md-content layout-padding=""><header><acme-navbar creationdate="main.creationDate"></acme-navbar></header>ABOUT</md-content></div>'),e.put("app/components/navbar/navbar.html",'<md-toolbar layout="row" layout-align="center center"><md-button href="https://github.com/Swiip/generator-gulp-angular">CMMC Devices</md-button><section flex="" layout="row" layout-align="left center"><md-button href="#/" class="md-raised">Home</md-button><md-button href="#/netpie" class="md-raised">Generator</md-button><md-button href="#/about" class="md-raised">About</md-button></section></md-toolbar>'),e.put("app/main/partials/detail.html",'<md-dialog flex="60"><md-toolbar><div class="md-toolbar-tools"><h2>{{ devices()[deviceUUID].d.myName }}</h2><span flex=""></span></div></md-toolbar><md-dialog-content md-dynamic-height=""><md-list class="a"><md-subheader class="md-no-sticky">DATA</md-subheader><md-list-item class="md-2-line" ng-repeat="(key, value) in devices()[deviceUUID].d"><img ng-src="{{item.face}}?{{$index}}" class="md-avatar" alt="{{item.who}}"><div class="md-list-item-text" layout="column"><h3>{{ key }}</h3><p>{{ value }}</p></div></md-list-item></md-list><md-divider></md-divider><md-list class="b"><md-subheader class="md-no-sticky">INFO</md-subheader><md-list-item class="md-2-line" ng-repeat="(key, value) in devices()[deviceUUID].info"><md-icon md-svg-icon="communication:phone" ng-if="$index === 0"></md-icon><div class="md-list-item-text" ng-class="{\'md-offset\': $index != 0 }"><h3>{{ key }}</h3><p>{{ value }}</p></div></md-list-item></md-list></md-dialog-content></md-dialog>'),e.put("app/main/partials/firstPopup.html",'<md-dialog flex="60"><md-toolbar><div class="md-toolbar-tools"><h2>Hello Gear</h2><span flex=""></span></div></md-toolbar><md-dialog-content md-dynamic-height=""><form name="newConfig" ng-submit="save(config)"><md-input-container><label>Host</label> <input ng-model="config.host" required=""></md-input-container><md-input-container><label>Port</label> <input ng-model="config.port" required=""></md-input-container><md-input-container><label>clientId</label> <input ng-model="config.clientId" required="" type="clientId"></md-input-container><md-input-container ng-show="data.cb_auth"><label>Username</label> <input ng-model="config.username"></md-input-container><md-input-container ng-show="data.cb_auth"><label>Password</label> <input ng-model="config.password" type="password"></md-input-container><md-checkbox ng-init="data.cb_auth=false" ng-model="data.cb_auth" aria-label="Checkbox 2" class="md-warn md-align-top-left">username & password</md-checkbox><md-input-container><md-button class="md-raised md-primary">Save</md-button></md-input-container></form></md-dialog-content></md-dialog>'),e.put("app/main/partials/main.html",'<div layout="column" layout-fill="" class="nat-wrapper"><md-content layout-padding=""><header><acme-navbar creationdate="main.creationDate"></acme-navbar></header><section class="jumbotron"><div layout="row" layout-align="end center"><md-input-container><label>Filter by name</label> <input ng-model="filterDevice.name"></md-input-container><md-input-container><label>Status</label><md-select name="onlineStatus" ng-model="onlineStatus" required=""><md-optgroup label="Status"><md-option value="ALL">All</md-option><md-option value="ONLINE">Online</md-option><md-option value="DEAD">Offline</md-option></md-optgroup></md-select></md-input-container><md-button ng-click="toggleRight()" class="md-primary">Config</md-button><sidebar-mqtt-config></sidebar-mqtt-config></div><div class="techs" layout-align="center"><md-card ng-class="device.status" ng-repeat="(key, device) in main.devices | name:filterDevice.name | status:onlineStatus | orderBy:\'status\'"><div class="thumbnail"><div class="caption"><h3>{{ device.d.myName }} - {{ device.status }}</h3><div ng-show="{{ device.info.id !=\'\' || device.d.id != \'\'}}">{{ device.info.id || device.d.id }}</div><div>{{ device.d.ip }}</div><div>{{ device.d.seconds }} ({{ device.d.subscription }})</div><div>{{ device.info.sensor || device.d.sensor || "?" }}</div><div ng-show="{{device.online}}">{{ device.info.id || device.d.id }}/status</div></div></div><div class="md-actions" layout="row" layout-align="end center"><md-button ng-click="showDetail($event, key)">Detail</md-button></div></md-card></div></section><div ng-init="showFirstPopup($event)"></div></md-content></div>'),e.put("app/main/partials/sidebar.html",'<section><md-sidenav class="md-sidenav-right md-whiteframe-z2" md-component-id="right" layout-align="start center"><md-toolbar class="md-theme-light" layout="row" layout-align="center center">Config</md-toolbar><md-content layout-padding="" class="autoScroll"><form ng-submit="closeAndSaveNewConfig(config)"><md-input-container><label>Host</label> <input ng-model="config.host" required=""></md-input-container><md-input-container><label>Port</label> <input ng-model="config.port" required=""></md-input-container><md-input-container ng-show="data.cb_auth"><label>Username</label> <input ng-model="config.username"></md-input-container><md-input-container ng-show="data.cb_auth"><label>Password</label> <input ng-model="config.password" type="password"></md-input-container><md-input-container ng-show="data.cb_clientId"><label>clientId</label> <input ng-model="config.clientId" type="clientId" required=""></md-input-container><md-checkbox ng-init="data.cb_auth=false" ng-model="data.cb_auth" aria-label="Checkbox 2" class="md-warn md-align-top-left">username & password</md-checkbox><md-checkbox ng-model="data.cb_clientId" aria-label="Checkbox 2" class="md-warn md-align-top-left">clientId</md-checkbox><md-input-container><md-button class="md-raised">Save</md-button></md-input-container></form><md-input-container><md-button class="md-raised md-warn" ng-click="closeNav()">Cancel</md-button></md-input-container></md-content></md-sidenav></section>'),e.put("app/netpie/partials/netpie.html",'<div layout="column" layout-fill="" class="nat-wrapper"><md-content layout-padding=""><header><acme-navbar creationdate="main.creationDate"></acme-navbar></header><md-button class="md-primary" ng-click="addApp = true">New App</md-button><md-button ng-click="toggleRight()" class="md-primary">Config</md-button><form name="app" style="width:70%" ng-show="addApp" ng-submit="loading = true; getMqttPass(newApp)"><md-input-container flex=""><label>AppID</label> <input required="" ng-model="newApp.appId" name="appId"><div ng-messages="app.appId.$error"><div ng-message="required">This is required.</div></div></md-input-container><md-input-container flex=""><label>App Key</label> <input required="" name="appKey" ng-model="newApp.appKey"><div ng-messages="app.appKey.$error"><div ng-message="required">This is required.</div></div></md-input-container><md-input-container flex=""><label>App Secret</label> <input required="" name="appSecret" ng-model="newApp.appSecret"><div ng-messages="app.appSecret.$error"><div ng-message="required">This is required.</div></div></md-input-container><div class="" ng-show="loading == false" ng-init="loading = false"><div ng-show="appError">{{ appError }}</div><md-button class="md-raised">Add</md-button><md-button class="md-raised md-warn" ng-click="addApp = false">Cancel</md-button></div><div><md-progress-circular md-mode="indeterminate" ng-show="loading"></md-progress-circular></div></form><div><md-content class="md-padding"><md-tabs md-selected="selectedIndex" md-border-bottom="" md-autoselect="" md-dynamic-height=""><md-tab ng-repeat="app in storage.netpieApp" label="{{app.appId}}"><div class="tab{{$index%4}}"><md-toolbar class="md-theme-light">App overview</md-toolbar><md-content layout-fill=""><md-list><md-subheader class="md-no-sticky">MASTER</md-subheader><md-list-item class="md-3-line"><md-card class="md-list-item-text"><div>Id : {{ app.appId }}</div><div>Key : {{ app.appKey }}</div><div>Secret : {{ app.appSecret }}</div></md-card></md-list-item></md-list></md-content><md-toolbar class="md-theme-light"><md-subheader class="md-no-sticky">MICRO GEARS</md-subheader><md-button class="md-fab md-mini" aria-label="Eat cake" ng-click="getMqttPass(app)">Add</md-button></md-toolbar><md-content><md-list-item class="md-3-line" ng-repeat="microgear in app.microgears"><md-card class="md-list-item-text" layout="column"><div>#define MQTT_USERNAME&nbsp; &nbsp; &nbsp; {{microgear.username}}</div><div>#define MQTT_PASSWORD&nbsp; &nbsp; &nbsp; {{microgear.password}}</div><div>#define MQTT_CLIENT_ID&nbsp; &nbsp; &nbsp; &nbsp; {{microgear.clientId}}</div><div>#define MQTT_PREFIX&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "/HelloChiangMaiMakerClub/gearname"</div></md-card><md-button class="md-raised" ng-click="setGear(microgear)">Use this Gear</md-button></md-list-item></md-content></div></md-tab></md-tabs></md-content></div></md-content><sidebar-netpie-config config="config.netpie"><section>{{config}}<md-button ng-click="toggleRight()" class="md-primary">Config</md-button><sidebar-netpie-config config="config.netpie"></sidebar-netpie-config></section><section>Hello</section><a href="#" ng-click="getMqttPass()">NETPIE</a> <code width="80%">{{ Object.keys(data) }}</code></sidebar-netpie-config></div>'),e.put("app/netpie/partials/sidebar.html",'<section><md-sidenav class="md-sidenav-right md-whiteframe-z2" md-component-id="right" layout-align="start center"><md-toolbar class="md-theme-light" layout="row" layout-align="center center">Config</md-toolbar><md-content layout-padding="" class="autoScroll"><md-input-container><label>appKey</label> <input ng-model="config.appKey"></md-input-container><md-input-container><label>appSecret</label> <input ng-model="config.appSecret"></md-input-container><md-input-container><label>appId</label> <input ng-model="config.appId"></md-input-container><md-input-container><label>topic</label> <input ng-model="config.topic"></md-input-container><md-input-container><md-button class="md-raised" ng-click="save()">Save</md-button></md-input-container><md-input-container><md-button class="md-raised md-warn" ng-click="cancel()">Cancel</md-button></md-input-container></md-content></md-sidenav></section>')}]);