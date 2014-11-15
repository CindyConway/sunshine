angular.module( 'sunshine.dashboard', [
        'ui.router',
        'ui.bootstrap'
    ])

    .config(function config( $stateProvider ) {

        $stateProvider.state( 'console.dashboard', {
            url: '/dashboard',
            views: {
                "console": {
                    //controller: 'DashBoardCtrl',
                    templateUrl: 'console/dashboard/dashboard.tpl.html'
                }
            },
            data:{ pageTitle: 'Administration - Dashboard', authorizedRoles: ['admin', 'editor', 'anonymous'] }
        });
    })

    .controller( 'DashboardCtrl', function DashboardCtrl( $scope ) {
        // This is simple a demo for UI Boostrap.

    })

;