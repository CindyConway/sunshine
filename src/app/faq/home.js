(function(){
angular.module( 'sunshine.home', ['ui.router'])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    $stateProvider.state( 'home', {
        url: '/home',
        ncyBreadcrumb: {
          label: 'Home'
        },
        views: {
            "main": {
                controller: 'HomeCtrl',
                templateUrl: 'home/home.tpl.html'
            }
        },
        data:{ pageTitle: 'Home', authorizedRoles: ['anonymous'] }
    });
})

.controller('HomeCtrl', function HomeController( $scope, Department) {
    var self = this;
    Department.get_adopted().then(function (data){
        self.dept_list =  data;
    });
})

.controller('FormCtrl', function FormController( $scope, $state, Search ) {
  var self = this;

   $scope.submitSearch = function(){
     Search.set_terms (self.terms);
     $state.go('search');

  };
})
;
})();
