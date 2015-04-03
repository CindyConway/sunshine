angular.module( 'paper.input', [])
.run(['$templateCache', function($templateCache) {
  $templateCache.put('paperInput',
    "<div ng-form=\"inputForm\"><div class=\"group paper-input\"><input type=\"{{ type }}\" ng-model=\"modelRef\" name=\"modelName\" ng-required=\"isRequired\"><span class=\"highlight\"></span><span class=\"bar\"></span><label class=\"{{ icon }}\"> {{ label }}</label></div></div>"
  );
}])
.directive('floating', function() {
  return {
    restrict: "A",
    scope:true,
    link: function(scope, elem, attrs){

      elem.bind('blur', function(e){
        var id = attrs.id;
        var nextLabel = angular.element(document.querySelector('#' + id + ' ~ label'));

        if(elem.val().length == 0){
          nextLabel.addClass('floating-label');

        }
      });

      elem.bind('focus', function(e){
        var id = attrs.id;
        var nextLabel = angular.element(document.querySelector('#' + id + ' ~ label'));
        nextLabel.removeClass('floating-label');

      });
    }
  };
})

.directive('paperInput', ['$templateCache', function ($templateCache) {
  return {
        restrict: 'E',
        scope:   {
            label: '@',
            type: '@',
            modelRef: '=',
            icon : '@'
        },
        template: $templateCache.get('paperInput'),
        link: function (scope, elem, attrs){

          scope.isRequired = angular.isDefined(attrs.required);
          scope.isDatepicker = angular.isDefined(attrs.date);
          scope.state = {
            opened : false
          };
        }
  }
}])

//Didn't add paper-checkbox or paper-date
;
