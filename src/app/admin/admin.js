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
      '<li><a href="#" ng-show="allowAdmin"><i class="fa fa-user"></i>All Users</a></li>',
      '<li class="divider"></li> ',
      '<li><a href="#" ng-click="logout()"><i class="fa fa-sign-out"></i>Logout</a></li>',
      '</ul> ',
      '</div>',
      '<div class="admin-title">',
      '<div class="county">City &amp; County of San Francisco</div>',
      '<div class="IOR">Index <span class="small-italic">of</span> Records</div>',
      '</div>',
      '</div>'];
    $templateCache.put('adminHeader',  template.join('\n'));
}])

.directive('ccAdminHeader', ['$window', 'Debounce', 'Authentication', 'UserAuth', '$templateCache',

  function ($window, Debounce, Authentication, UserAuth, $templateCache) {
  return {
    restrict : 'A',
    scope: true,
    template: $templateCache.get('adminHeader'),
    link: function(scope, elem, attr){
        scope.user = Authentication.user;
        scope.isLogged = Authentication.isLogged;
        scope.allowPublisher = false;
        scope.allowAdmin = false;
        scope.log = UserAuth.logout;

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
;
})();
