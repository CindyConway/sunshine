(function(){
angular.module( 'sunshine.admin', [
        'ui.router',
        'ui.bootstrap'
    ])

.run(['$templateCache', function($templateCache) {
 var template = [
      '<div>',
      //'<div id="main-admin-menu" class="btn-group right" dropdown ng-if="user">',
      '<div id="main-admin-menu" class="btn-group right" dropdown ng-if="isLogged">',
      '<button type="button" class="btn btn-default dropdown-toggle">',
      '{{user}}<span class="fa fa-bars"></span>',
      '</button>',
      '<ul  class="dropdown-menu" role="menu">',
      '<li><a href="#" ng-show="allowPublisher"><i class="fa fa-tachometer"></i>Dashboard</a></li>',
      '<li><a href="#" ng-click="tip_edit()" ng-show="allowAdmin"><i class="fa fa-check"></i>Recommendations</a></li>',
      '<li><a href="#" ng-click="add_schedule()" ng-show="allowAdmin"><i class="fa fa-plus-square"></i>New Schedule</a></li>',
      '<li class="divider"></li> ',
      '<li><a href="#" ng-show="allowAdmin"><i class="fa fa-user"></i>Users</a></li>',
      '<li class="divider"></li> ',
      '<li><a href="#" ng-click="logout()"><i class="fa fa-sign-out"></i>Logout</a></li>',
      '</ul> ',
      '</div>',
      '<div class="admin-title">',
      '<div class="county">City &amp; County of San Francisco</div>',
      '<div class="IOR">Index <span class="small-italic">to</span> Records</div>',
      '</div>',
      '</div>'];
    $templateCache.put('adminHeader',  template.join('\n'));
}])

.factory("ScheduleAdd", ["Department", "Debounce", "HttpQueue", "Authentication", "$state",
  function(Department, Debounce, HttpQueue, Authentication, $state){

  var add = Debounce.debounce(function(){
            var self = this;
            Department.add()
            .then(function(data){
                Authentication.setValue("selDept", data._id);
                Authentication.setValue("selDeptName", data.draft.department);

              $state.go('edit', {}, {reload: true});

              });
          },667, false, "saving");

  return add;
}])

.factory("TipEditGo",["$state", function($state){
  var  go_picker = function(){
    var self = this;
    $state.go('tip');
  };
  return go_picker;
}])

.directive('ccAdminHeader', ['$window', 'Debounce', 'Authentication', 'UserAuth', '$templateCache', 'TipEditGo',
'ScheduleAdd',
  function ($window, Debounce, Authentication, UserAuth, $templateCache, TipEditGo, ScheduleAdd) {
  return {
    restrict : 'A',
    scope: true,
    template: $templateCache.get('adminHeader'),
    link: function(scope, elem, attr){
        scope.user = Authentication.user;
        scope.isLogged = Authentication.isLogged;
        scope.allowPublisher = false;
        scope.allowAdmin = false;
        scope.logout = UserAuth.logout;
        scope.tip_edit = TipEditGo;
        scope.add_schedule = ScheduleAdd;

        scope.$watch(function () {
                return Authentication.userRoles;
          }, function (newVal, oldVal) {
              if(newVal){
                scope.allowAdmin = newVal.indexOf("Administrator") > -1;
                scope.allowPublisher = newVal.indexOf("Publisher") > -1;
              }
          }, true);

        scope.$watch(function () {
                return Authentication.user;
          }, function (newVal, oldVal) {
                scope.user = newVal;
          }, true);
      }
    };
}])
.directive("ccFillHeight", ["$window", "Debounce", function($window, Debounce){
  return{
    restrict: 'A',
    scope:true,
    link: function(scope, elem, attr){

          function setHeight (){
            var header_height = angular.element(document.querySelector('#admin-header'))[0].offsetHeight;
            elem.css("height", $window.innerHeight - header_height + "px");
            console.log($window.innerHeight - header_height + "px");
          }

          setHeight();

         angular.element($window).bind('resize', Debounce.debounce(function() {
           // must apply since the browser resize event is not seen by the digest process
           scope.$apply(function() {
             setHeight();
           });
         }, 50));
    }
  };
}])
;
})();
