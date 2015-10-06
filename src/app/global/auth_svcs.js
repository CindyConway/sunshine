(function(){
angular.module( 'sunshine.auth_svcs', [])
.factory('Authentication', function($window) {
  var auth = {
    isLogged: false,
    check: function() {
      if ($window.sessionStorage.token && $window.sessionStorage.user) {
        this.isLogged = true;
        this.userRoles = $window.sessionStorage.userRoles;
        this.user = $window.sessionStorage.user;
        this.token = $window.sessionStorage.token;
        this.usersDept = $window.sessionStorage.usersDept;
        this.selDept = $window.sessionStorage.selDept;
        this.selDeptName = $window.sessionStorage.selDeptName;
        this.searchTerms = $window.sessionStorage.searchTerms;

      } else {
        this.isLogged = false;
        delete this.user;
        delete this.token;
        delete this.userRoles;
        delete this.userDept;
        delete this.selDept;
        delete this.selDeptName;
        delete this.searchTerms;
      }
    },
    setValue: function(key, value){
      $window.sessionStorage[key] = value;
      this[key] = value;
    }
  };

  return auth;
})

.factory('UserAuth', function($window, $location, $http, Authentication, SunshineConfig) {
  return {
    login: function(email, password) {
      var url = SunshineConfig.api_url + "/v1/login";
      return $http.post(url, {
        "email": email,
        "pwrd": password
      })
      .success(function(data, status, headers, config){
        return data;
      })
      .error(function(data, status, headers, config){
        return data;
      });
    },
    logout: function() {

      if (Authentication.isLogged) {

        Authentication.isLogged = false;

        delete Authentication.userRole;
        delete Authentication.usersDept;
        delete Authentication.selDept;
        delete Authentication.usersDeptName;
        delete Authentication.user;
        delete Authentication.searchTerms;

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.userRole;
        delete $window.sessionStorage.userDept;
        delete $window.sessionStorage.selDept;
        delete $window.sessionStorage.userDeptName;
        delete $window.sessionStorage.user;
        delete $window.sessionStorage.searchTerms;

        $location.path("/home");
      }

    }
  };
})

.factory('TokenInterceptor', function($q, $window) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers['X-Access-Token'] = $window.sessionStorage.token;
        config.headers['X-Key'] = $window.sessionStorage.user;
        config.headers['Content-Type'] = "application/json";
      }
      return config || $q.when(config);
    },

    response: function(response) {
      return response || $q.when(response);
    }
  };
})
;
})();
