
(function(){
angular.module( 'sunshine.login', [
        'ui.router'
    ])


.config(function config( $stateProvider ) {
    $stateProvider.state( 'login', {
        url: '/login',
        views: {
            "admin": {
                controller: 'LoginCtrl',
                templateUrl: 'login/login.tpl.html'
            }
        },
        data:{ pageTitle: 'Login', authorizedRoles: ['Everyone'] }
    });
})

.controller('LoginCtrl', function ($scope, $rootScope, Login ) {
  var self = this;

    self.login = Login;

    self.login_status = "Please Login...";
})

.factory("Login", ["$window", "UserAuth", "Authentication", "$location", "$rootScope",
    function($window, UserAuth, Authentication, $location, $rootScope){
  var login = function(email, password){
    var self = this;
    if (email !== undefined && password !== undefined) {
     UserAuth.login(email, password)
     .success(function(data) {

       Authentication.isLogged = true;
       Authentication.user = data.user;
       Authentication.userRoles = data.roles;
       Authentication.usersDept = data.users_dept;

       //Fetch users details on refresh
       $window.sessionStorage.token = data.token;
       $window.sessionStorage.user = data.user;
       $window.sessionStorage.userRoles = data.roles;
       $window.sessionStorage.usersDept = data.users_dept;

       $location.path("edit");

     }).error(function(obj) {

       self.login_status = "Login Failed";
       UserAuth.logout();
     });
   } else {
     alert('Invalid credentials');
   }

  };

  return login;

}])
;
})();
