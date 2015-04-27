(function(){

angular.module( 'sunshine.contact_us', ['ui.router'])

.config(function config( $stateProvider, dialogsProvider ) {

  dialogsProvider.useFontAwesome();

  $stateProvider.state( 'contact', {
    url: '/contact',
    ncyBreadcrumb: {
      label: 'Contact Us'
    },
    views: {
      "main": {
        templateUrl: 'contact_us/contact_us.tpl.html'
      }
    },
    data:{ pageTitle: 'Contact Us', authorizedRoles: ['Everyone'], footer: true}
  });
})
;
})();
