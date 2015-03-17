angular.module('cc.slide.menu', [])
.factory('ccButtonSvc', ['ccMenuSvc', function(ccMenuSvc){

  var show_hide =
  function(){
    var placement = ccMenuSvc.getPlacement();
    var menu = angular.element(document.querySelector('.cc-menu'));
    var content = angular.element(document.querySelector('.cc-content'));
    var current_size = ccMenuSvc.getCurrentSize();

    if(menu.hasClass('cc-menu-close')){ //open menu and push content
      menu.removeClass('cc-menu-close');
      menu.addClass('cc-menu-open');
      switch (placement) {
        case "left":
         content.css('margin-left', current_size + "px")
          break;
        // case "right":
        //   content.css('margin-right', current_size + "px")
        //   console.log('right');
        //   break;
        // case "top":
        //   content.css('margin-top', current_size + "px")
        //   break;
        // case "bottom":
        //   content.css('margin-bottom', current_size + "px")
        //   break;
        }
    }else{ //close menu and push content
      menu.removeClass('cc-menu-open');
      menu.addClass('cc-menu-close');

      //content.css('margin', '0px');

    }
  }

  return{
    toggle: function(){
        var menu = angular.element(document.querySelector('.cc-menu'));
        //var content = angular.element(document.querySelector('.cc-content'));

        if(menu.hasClass('cc-media-start-closed')){
          menu.removeClass('cc-media-start-closed');
          menu.addClass('cc-menu-close');
          menu.addClass('cc-menu-open');
        }

        if(menu.hasClass('cc-menu-close')){
          menu.removeClass('cc-menu-close');
          menu.addClass('cc-menu-open');
        // content.css('width', 'calc(100% - ' + ccMenuSvc.getWidth() + ')');

        }else{
          menu.removeClass('cc-menu-open');
          menu.addClass('cc-menu-close');
        //   content.css('width', '100%');

        }
    },
    buttonHide: function(elem){elem.addClass('cc-button-hide'); elem.removeClass('cc-button-show');},
    buttonShow:function(elem){elem.addClass('cc-button-show'); elem.removeClass('cc-button-hide');},
    containerClose: function(e, win_width, win_height){
      var placement = ccMenuSvc.getPlacement();
      var current_size = ccMenuSvc.getCurrentSize();
      var is_menu_click = true;
      var is_menu_button = e.target.attributes.getNamedItem('cc-button');

      // exit if the click event if from the menu button
      if(is_menu_button != null) return ;

      //is this click event from the menu?
      if(e.x >= current_size){
        is_menu_click = false;
      }

      // if(e.y > current_size && placement == 'top'){
      //   is_menu_click = false;
      // }
      //
      // if(e.x < (win_width - current_size) && placement == 'right'){
      //   is_menu_click = false;
      // }
      //
      // if(e.y  < (win_height - current_size) && placement == 'bottom'){
      //   is_menu_click = false;
      // }

      // show or hide menu and push content if click is not from menu
      if(!is_menu_click){
        show_hide();
      }
    }
  }
}])

.factory('ccContentSvc', function(){
  return{
    pushContent: function(elem, currSize){
      var w  = currSize + 10 //account for left padding in stylesheet
      elem.css('width', 'calc(100% - ' + w + 'px)');

    },
    fullContent: function(elem){
      elem.css('width', '100%');
    }
  }
})
.factory('ccMenuSvc', function(){
  // ---------------- DEFAULTS --------------//
  var width = '320px';
  var height = '150px';
  var placement = 'left';
  var current_size = '';

  return {
    getWidth: function(){return width;},
    setWidth: function(val){
                    if(typeof val !== 'undefined') {
                      width = val;
                      current_size = parseInt(width);
                    }
                },
    getHeight: function(){return height;},
    setHeight: function(val){
                    if(typeof val !== 'undefined'){
                      height = val;
                      current_size = parseInt(height);
                    }
                },
    getPlacement: function(){return placement;},
    setPlacement: function(val){if(typeof val !== 'undefined') placement = val.toLowerCase()},
    getCurrentSize: function(){return current_size;},
    closeMenu: function(elem){ elem.addClass('cc-menu-close'); elem.removeClass('cc-menu-open');},
    openMenu: function(elem){elem.addClass('cc-menu-close'); elem.removeClass('cc-menu-close');}
  }
})
.directive('ccContent', ['ccMenuSvc', 'ccContentSvc', '$window', 'Debounce', function (ccMenuSvc, ccContentSvc, $window, Debounce) {
  return {
    restrict: 'E',
    scope: true,
    link: function (scope, elem, attrs) {
      elem.addClass('cc-content');

      if($window.innerWidth > 690){
          ccContentSvc.pushContent(elem, ccMenuSvc.getCurrentSize());
      }else{
          ccContentSvc.fullContent(elem);
      }

      //for responsiveness
      angular.element($window).bind('resize', Debounce.debounce(function() {
        // must apply since the browser resize event is not seen by the digest process
        scope.$apply(function() {
          if($window.innerWidth > 690){
            ccContentSvc.pushContent(elem, ccMenuSvc.getCurrentSize());
          }else{
            ccContentSvc.fullContent(elem);
          }
        });
      }, 50));
    }
  }
}])
.directive('ccMenu', ['ccMenuSvc', 'ccButtonSvc', '$window', 'Debounce', function (ccMenuSvc, ccButtonSvc, $window, Debounce) {
  return {
    restrict: 'E',
    scope: {
      ccWidth: '@',
      ccHeight:'@',
      ccPlacement: '@'
      },
      link: function (scope, elem, attrs) {

        ccMenuSvc.setWidth(scope.ccWidth);
        ccMenuSvc.setHeight(scope.ccHeight);
        ccMenuSvc.setPlacement(scope.ccPlacement);

        elem.addClass('cc-menu');

        if($window.innerWidth > 690){
         elem.removeClass('cc-menu-mobile');
          ccMenuSvc.openMenu(elem);
        }else{
          elem.addClass('cc-menu-mobile');
          ccMenuSvc.closeMenu(elem);
        }

        //menu placement
        switch ( ccMenuSvc.getPlacement()) {
          case "right":
            elem.addClass('cc-menu-vertical cc-menu-right');
            elem.css('width', ccMenuSvc.getWidth());
            break;
          // case "right":
          //   elem.addClass('cc-menu-vertical cc-menu-right');
          //   x = angular.element(document.querySelectorAll('.cc_menu-right'));
          //   elem.css('width', ccMenuSvc.getWidth());
          //   break;
          // case "top":
          //   elem.addClass('cc-menu-horizontal cc-menu-top');
          //   elem.css('width', ccMenuSvc.getWidth());
          //   break;
          // case "bottom":
          //   elem.addClass('cc-menu-horizontal cc-menu-bottom');
          //   elem.css('width', ccMenuSvc.getWidth());
          //   break;
        }

          //for responsiveness
          angular.element($window).bind('resize', Debounce.debounce(function() {
            // must apply since the browser resize event is not seen by the digest process
            scope.$apply(function() {
              if($window.innerWidth > 690){
                elem.removeClass('cc-menu-mobile');
                ccMenuSvc.openMenu(elem);
              }else{
                elem.addClass('cc-menu-mobile');
                ccMenuSvc.closeMenu(elem);
              }

            });
          }, 50));
       }
     }
  }])
  .directive('ccButton', ['ccButtonSvc', 'ccMenuSvc', '$window', 'Debounce',
        function (ccButtonSvc, ccMenuSvc, $window, Debounce) {
    return {
      restrict : 'AE',
      scope: true,
      link: function(scope, elem, attr){

        elem.bind('click', ccButtonSvc.toggle);
        elem.addClass('cc-button');

        //add click event to close the menu when area outside menu is clicked
        body = angular.element(document.querySelectorAll('body'));
        var win_width = $window.innerWidth;
        var win_height = $window.innerHeight;

        if(win_width > 690){
          ccButtonSvc.buttonHide(elem);
        }else{
          ccButtonSvc.buttonShow(elem);
        }

        //for responsiveness
        angular.element($window).bind('resize', Debounce.debounce(function() {
          // must apply since the browser resize event is not seen by the digest process
          scope.$apply(function() {
              if($window.innerWidth > 690){
                ccButtonSvc.buttonHide(elem);
              }else{
                ccButtonSvc.buttonShow(elem);
              }

          });
        }, 50));

      }
    };
  }])
;
