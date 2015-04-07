(function(){
// App wide dependencies
angular
.module( 'sunshine', [
  'templates-app',
  'templates-common',
  'sunshine.home',
  'sunshine.login',
  'sunshine.global_svcs',
  'sunshine.global_utils',
  'sunshine.search',
  'sunshine.agency',
  'sunshine.schedule',
  'sunshine.edit',
  'sunshine.user',
  'sunshine.tip',
  'sunshine.tip_picker',
  'sunshine.auth_svcs',
  'sunshine.admin',
  //'sunshine.test',
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

.run(function($rootScope, $window, $location, Authentication, $state) {


  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

    Authentication.check();

    //This is the damned pdf printing. Still need to figue out security
    if(toState.data.authorizedRoles.indexOf("printer") > -1){
        return;
    }


    //This is a public page, allow routing
    if(toState.data.authorizedRoles.indexOf("Everyone") > -1){
        return;
    }

    //Is user logged in (account for page refresh)
    if (!Authentication.isLogged){
      Authentication.check();
    }

     if(!Authentication.isLogged){
       event.preventDefault();
       $state.go('login');
       return;
     }

    if(toState.data.authorizedRoles.indexOf("Administrator") > -1 ){
      if(Authentication.userRoles.indexOf("Administrator") > -1 ){
        return;
      }
    }

    if(toState.data.authorizedRoles.indexOf("Publisher") > -1){
      if(Authentication.userRoles.indexOf("Publisher") > -1 ){
        return;
      }
    }

    if(toState.data.authorizedRoles.indexOf("Editor") > -1){
      if(Authentication.userRoles.indexOf("Editor") > -1){
        return;
      }
    }

    // Route unauthorized for user
    event.preventDefault();
    $state.go('admin.login');
    return;

  });
})

.config(function($breadcrumbProvider) {
  $breadcrumbProvider.setOptions({
    prefixStateName: 'home',
    template: 'bootstrap3'
  });
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('HttpInterceptor');
  $httpProvider.interceptors.push('TokenInterceptor');

  var spinnerFunction = function spinnerFunction(data, headersGetter) {
  var search_button = angular.element(document.querySelector('.fa-search'));
     search_button.removeClass('fa-search');
     search_button.addClass('fa-spinner');
     search_button.addClass('fa-spin');

    return data;
  };

  $httpProvider.defaults.transformRequest.push(spinnerFunction);
})

// .config( function ( $provide, $stateProvider, $urlRouterProvider){
//   $urlRouterProvider.otherwise( '/home' );
// }, function(USER_ROLESProvider){} )
// //Using the main application's run method to execute any code after services have been started
// .run( function run ($rootScope) {
//
// })

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Login, UserAuth, $window,
  $rootScope, GlobalVariables ) {
    $scope.GlobalVariables = GlobalVariables;
  //  $rootScope.API_URL = 'http://localhost:1971';
  //  $rootScope.USERS_DEPT_ID = '54331f1023fe388f037119c6';
  //  GlobalVariables.user_dept = '550c50ce4e4472c01bf2c2f4'; //Board of Supervisors

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if ( angular.isDefined( toState.data.pageTitle ) ) {
          $scope.pageTitle = toState.data.pageTitle ;
        }
    });
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
