
(function(){
angular.module( 'sunshine.login', [
        'ui.router'
    ])


.config(function config( $stateProvider ) {
    $stateProvider.state( 'login', {
        url: '/login',
        views: {
            "main": {
                controller: 'LoginCtrl',
                templateUrl: 'login/login.tpl.html'
            }
        },
        data:{ pageTitle: 'Login', authorizedRoles: ['Everyone'] }
    });
})

.controller('LoginCtrl', function ($scope, $rootScope, Login, Authentication) {
  var self = this;
    self.email = Authentication.user;
    self.password = '';
    self.login = Login;

    self.login_status = "Please Login...";
})

.factory("Login", ["$window", "UserAuth", "Authentication", "$location", "$rootScope",
    function($window, UserAuth, Authentication, $location, $rootScope){
  var login = function(email, password){
    var self = this;

    UserAuth.logout();

    if (email !== undefined && password !== undefined) {
     UserAuth.login(email, password)
     .success(function(data) {

       Authentication.isLogged = true;
       Authentication.user = data.user;
       Authentication.userRoles = data.roles;
       Authentication.usersDept = data.users_dept;

       console.log("Step 1 - Login in");
       console.log(data);

       //Fetch users details on refresh
       $window.sessionStorage.token = data.token;
       $window.sessionStorage.user = data.user;
       $window.sessionStorage.userRoles = data.roles;
       $window.sessionStorage.usersDept = data.users_dept;
       console.log("Step 2 = set session variables");
       console.log($window.sessionStorage);

       $location.path("/edit");

     }).error(function(obj) {
       console.log("error in login");
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
