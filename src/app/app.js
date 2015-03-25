(function(){
// App wide dependencies
angular
.module( 'sunshine', [
  'templates-app',
  'templates-common',
  'sunshine.home',
  'sunshine.login',
  'sunshine.console',
  'sunshine.global_svcs',
  'sunshine.global_utils',
  'sunshine.search',
  'sunshine.agency',
  'sunshine.schedule',
  'sunshine.edit',
  'sunshine.tip',
  'ui.router',
  'angularUtils.directives.dirPagination',
  'ui.bootstrap',
  'ui.unique',
  'cc.slide.menu',
  'paper.input',
  'checklist-model',
  'ngSanitize',
  'angular-ellipsis',
  'cgBusy',
  'ncy-angular-breadcrumb',
  'debounce'
])

.config(function($breadcrumbProvider) {
  $breadcrumbProvider.setOptions({
    prefixStateName: 'home',
    template: 'bootstrap3'
  });
})

.config(function ($httpProvider) {
  //$httpProvider.responseInterceptors.push('HttpInterceptor');
  $httpProvider.interceptors.push('HttpInterceptor');
  var spinnerFunction = function spinnerFunction(data, headersGetter) {
  var search_button = angular.element(document.querySelector('.fa-search'));
     search_button.removeClass('fa-search');
     search_button.addClass('fa-spinner');
     search_button.addClass('fa-spin');

    return data;
  };

  $httpProvider.defaults.transformRequest.push(spinnerFunction);
})

.config( function ( $provide, $stateProvider, $urlRouterProvider){
  $urlRouterProvider.otherwise( '/home' );
}, function(USER_ROLESProvider){} )
//Using the main application's run method to execute any code after services have been started
.run( function run ($rootScope, AUTH_EVENTS, AuthService) {

//    $rootScope.$on('$stateChangeStart', function (event, next) {
//        var authorizedRoles = next.data.authorizedRoles;
//
//        //route permits anonymous users
//        if (authorizedRoles.indexOf("anonymous") !== -1){
//            return;
//        }
//
//        // Route requires authentication and authorization check
//        if (!AuthService.isAuthorized(authorizedRoles)) {
//
//            //prevent routing
//            event.preventDefault();
//
//            if (AuthService.isAuthenticated()) {
//                // user is not allowed
//                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
//            } else {
//                // user is not logged in
//                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
//            }
//        }
//    });
})
.provider('UserRoles', function()  {
    var roles = {
        anon: 'anonymous',
        admin: 'admin',
        editor: 'editor',
        guest: 'guest'};
    this.$get = function() {
        return roles;
    };
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location,
  $rootScope, AuthService, UserRoles, GlobalVariables ) {
    $scope.GlobalVariables = GlobalVariables;
    $rootScope.API_URL = 'http://localhost:1971';
    $rootScope.USERS_DEPT_ID = '54331f1023fe388f037119c6';
    GlobalVariables.user_dept = '550c50ce4e4472c01bf2c2f4'; //Board of Supervisors

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if ( angular.isDefined( toState.data.pageTitle ) ) {
          $scope.pageTitle = toState.data.pageTitle ;
        }
    });

    $scope.currentUser = null;
    $scope.userRoles = UserRoles;
    $scope.isAuthorized = AuthService.isAuthorized;

    $scope.setCurrentUser = function (user) {
      $scope.currentUser = user;
    };
});

// ============= JS added globally ===================]
//extend all arrays to have a unique function
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) {
            return true;
        }
    }
    return false;
};
Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};
Array.prototype.nulless = function() {
    var arr = [];

    for(var i = 0; i < this.length; i++){
      if(this[i] != null){
        arr.push(this[i]);
      }
    }

    return arr;
};

String.prototype.visualLength = function()
{
    var ruler = document.getElementById("ruler");
    ruler.innerHTML = this;
    return ruler.offsetWidth;
};
//[===================================================]

})();
