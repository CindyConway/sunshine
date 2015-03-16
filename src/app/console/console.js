angular.module( 'sunshine.console', [
        'ui.router',
        'ui.bootstrap',
        'sunshine.dashboard',
        'sunshine.users',
        'sunshine.edit',
        'sunshine.tip'
    ])

    .config(function config( $stateProvider) {

        $stateProvider.state( 'console', {
            url: '/console',
            views: {
                "main": {
                    controller: 'ConsoleCtrl',
                    templateUrl: 'console/console.tpl.html'
                }
            },
            data:{ pageTitle: 'Administration', authorizedRoles: ['admin', 'editor', 'anonymous'] }
        });

})
    .controller('ConsoleCtrl', function ConsoleCtrl( $scope,$rootScope, $state, $location, Department) {
        var DeptList = {};

        Department.get_draft().then(function (data){
          draft_depts = data;
          $scope.draft_depts = data;
        });

        Department.get_adopted().then(function (data){
          $adopted_depts = data;
          $scope.adopted_depts = data;
        });

        $scope.changed_draft_dept = function () {
          if (typeof $scope.selected_draft_dept != 'undefined'){
            $rootScope.selected_draft_dept = $scope.selected_draft_dept._id;
          }
          $state.go('console.edit');
        };

        $scope.changed_adopted_dept = function () {
          if (typeof $scope.selected_adopted_dept != 'undefined'){
            $rootScope.selected_adopted_dept = $scope.selected_adopted_dept._id;
          }
          $state.go('console.adopted');
        };

//TO DO Add ability to naviagate to the published version of a schedule
//        $scope.changeStatePublished = function (department) {
//            $scope.dept_list =  DeptList;
//            $state.go('console.schedule');
//        };
    })
;
