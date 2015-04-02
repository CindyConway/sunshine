(function(){
angular.module( 'sunshine.admin', [
        'ui.router',
        'ui.bootstrap'
    ])
.config(function config( $stateProvider ) {

    $stateProvider.state( 'admin', {
        url: '/admin',
        ncyBreadcrumb: {
          skip: true
        },
        views: {
            "main": {
                //controller: 'DashBoardCtrl',
                templateUrl: 'admin/admin.tpl.html'
            }
        },
        data:{ pageTitle: 'Administration',
        authorizedRoles: ['Administrator', 'Publisher', 'Editor'] }
    });
})

.controller("AdminCtrl", function(Authentication, UserAuth, $scope, $timeout){

  var self = this;
  self.user = Authentication.user;
  self.logout =  UserAuth.logout;
  self.allowPublisher = false;
  self.allowAdmin = false;



  $scope.$watch(function () {
          return Authentication.user;
    }, function (newVal, oldVal) {
          self.user = newVal;
    }, true);

    $scope.$watch(function () {
            return Authentication.userRoles;
      }, function (newVal, oldVal) {
          if(newVal){
            self.allowAdmin = newVal.indexOf("Administrator") > -1;
            self.allowPublisher = newVal.indexOf("Publisher") > -1;
          }
      }, true);

      $scope.$on('$viewContentLoaded', function(event) {
        $timeout(function() {
          console.log("view LOADED");
        },0);
      });
})
;
})();
