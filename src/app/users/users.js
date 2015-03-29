(function(){
angular.module( 'sunshine.user', [
        'ui.router',
        'ui.bootstrap'
    ])

    .config(function config( $stateProvider ) {

        $stateProvider.state( 'user', {
            url: '/user',
            views: {
                "main": {
                    //controller: 'DashBoardCtrl',
                    templateUrl: 'users/users.tpl.html'
                }
            },
            data:{ pageTitle: 'Administration - users', authorizedRoles: ['Administrator'] }
        });
    })

    .controller( 'UserCtrl', function UserCtrl( User ) {
        var self = this;
        var user = {};
        user.first_name = "Ro";
        user.last_name = "Laren";
        user.email = "ro.laren@sfgov.org";
        user.pwrd = "RoLaren";

        self.signup = function(){
          User.signup(user)
          .then(function(err, data){
            console.log("first");
          });
        };

    })

;
})();
