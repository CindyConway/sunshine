
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
        data:{ pageTitle: 'Login', authorizedRoles: ['anonymous'] }
    });
})


.controller('LoginCtrl', function ($scope, $rootScope, Login, DummyUser) {
  var self = this;
    self.email = DummyUser.email;
    self.password = DummyUser.password;
    self.login = Login;


})
.factory("Login", ["$window", "UserAuth", "Authentication", "$location",
    function($window, UserAuth, Authentication, $location){
  var login = function(email, password){

    if (email !== undefined && password !== undefined) {
     UserAuth.login(email, password).success(function(data) {
       console.log(data);
       Authentication.isLogged = true;
       Authentication.user = data.user;
       Authentication.userRole = data.roles;

       $window.sessionStorage.token = data.token;
       $window.sessionStorage.user = data.user; // to fetch the user details on refresh
       $window.sessionStorage.userRole = data.roles; // to fetch the user details on refresh

       $location.path("/edit");

     }).error(function(status) {
       alert('Oopsy something went wrong!');
     });
   } else {
     alert('Invalid credentials');
   }

  };

  return login;

}])
.value("DummyUser", {
    "email":"ro.laren@sfgov.org",
    "password":"RoLaren"
  }
)
;
})();
