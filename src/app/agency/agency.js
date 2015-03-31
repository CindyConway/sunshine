(function(){
angular.module( 'sunshine.agency', ['ui.router'])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'agency', {
    url: '/agency/:dept_id',
    ncyBreadcrumb: {
      label: 'Schedule Table'
    },
    views: {
      "main": {
        controller: 'AgencyCtrl',
        templateUrl: 'agency/agency.tpl.html'
      }
    },
    data:{ pageTitle: 'Schedule Table', authorizedRoles: ['Everyone'] }
  });

  $stateProvider.state( 'agency_list', {
    url: '/agency_list/:dept_id',
    ncyBreadcrumb: {
      label: 'Schedule List'
    },
    views: {
      "main": {
        controller: 'AgencyCtrl',
        templateUrl: 'agency/agency_list.tpl.html'
      }
    },
    data:{ pageTitle: 'Schedule List', authorizedRoles: ['Everyone'] }
  });
})

.controller( 'AgencyCtrl', function AgencyController(Schedule, $stateParams, GlobalVariables, Authentication) {
  var self = this;
  Authentication.selDept = $stateParams.dept_id;
  self.schedule_id = Authentication.selDept;
  self.adopted = {};
  self.records = {};

  self.category_fltr = '';
  self.title_fltr = '';
  self.retention_fltr = '';
  self.division_fltr = '';
  self.remarks_fltr = '';
  self.on_site_fltr = '';
  self.off_site_fltr = '';
  self.total_fltr = '';


  GlobalVariables.showFooter = true;

  self.agency_promise = Schedule.get_adopted(self.schedule_id)
  .then(function (data){
    self.adopted = data[0].adopted;
    self.records = self.adopted.record;

  });
})
;
})();
