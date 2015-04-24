angular.module( 'sunshine.schedule', ['ui.router'])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'schedule', {
        url: '/schedule/:schedule_id',
        ncyBreadcrumb: {
          label: 'Home'
        },
        views: {
            "main": {
                controller: 'ScheduleCtrl',
                templateUrl: 'schedule/schedule.tpl.html'
            }
        },
        data:{ pageTitle: 'Schedule', authorizedRoles: ['printer'], footer:false }
    });
})

.controller('ScheduleCtrl', function ScheduleController( $scope, Schedule, GlobalVariables, $stateParams) {
  //This areas of the application is used to build pdfs
    var self = this;
    self._id = $stateParams.schedule_id;

    Schedule.get_draft(self._id).then(function (data){
        self.draft =  data.draft;
        self.isNotLocked = self.draft.status != "Locked";
    });
})

;
