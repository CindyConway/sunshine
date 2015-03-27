(function(){
angular.module( 'sunshine.auth_svcs', [])
.factory('Authentication', function($window) {
  var auth = {
    isLogged: false,
    check: function() {
      if ($window.sessionStorage.token && $window.sessionStorage.user) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
        delete this.user;
      }
    }
  };

  return auth;
})

.factory('UserAuth', function($window, $location, $http, Authentication, GlobalVariables) {
  return {
    login: function(email, password) {
      var url = GlobalVariables.api_url + "/v1/login";
      return $http.post(url, {
        "email": email,
        "pwrd": password
      });
    },
    logout: function() {

      if (Authentication.isLogged) {

        Authentication.isLogged = false;
        delete Authentication.user;
        delete Authentication.userRole;

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.user;
        delete $window.sessionStorage.userRole;

        $location.path("/home");
      }

    }
  };
})

.factory('TokenInterceptor', function($q, $window) {
  return {
    request: function(config) {
    //  console.log(config);
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers['X-Access-Token'] = $window.sessionStorage.token;
        config.headers['X-Key'] = $window.sessionStorage.user;
        config.headers['Content-Type'] = "application/json";
      }
      return config || $q.when(config);
    },

    response: function(response) {
      //console.log(response);
      return response || $q.when(response);
    }
  };
})
;
})();
