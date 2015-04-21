(function () {
	'use strict';

	var module = angular.module('sticky', []);

	module.service("Bank", function(){
		var stickyLine;
		var width;
		var left;

		return{
			get_sticky_line: function(){
				return stickyLine;
			},
			set_sticky_line: function(sl){
				stickyLine = sl;
			},
			get_width : function(){
				return width;
			},
			set_width : function(w){
				width = w;
			},
			get_left : function(){
				return left;
			},
			set_left : function(lft){
				left = lft;
			}
		}
	})

	// Directive: sticky
	//
	module.directive('sticky', ["Bank", function(Bank) {
		return {
			restrict: 'A', // this directive can only be used as an attribute.
			link: linkFn
		};

		function linkFn($scope, $elem, $attrs) {
			var mediaQuery, stickyClass, bodyClass, elem, $window, $body,
				doc, initialCSS, initialStyle, isPositionFixed, isSticking,
				offset, anchor, prevOffset, matchMedia, clone, menu;

			isPositionFixed = false;
			isSticking      = false;

			matchMedia      = window.matchMedia;

			// elements
			$window = angular.element(window);
			$body   = angular.element(document.body);
			elem    = $elem[0];
			doc     = document.documentElement;

			// attributes
			mediaQuery  = $attrs.mediaQuery  || false;
			stickyClass = $attrs.stickyClass || '';
			bodyClass   = $attrs.bodyClass   || '';
			clone 			= $attrs.clone || false;
			menu				= $attrs.menu || false;

			initialStyle = $elem.attr('style');

			offset = typeof $attrs.offset === 'string' ?
				parseInt($attrs.offset.replace(/px;?/, '')) :
				0;

			anchor = typeof $attrs.anchor === 'string' ?
				$attrs.anchor.toLowerCase().trim()
				: 'top';


			// initial style
			initialCSS = {
				top:       $elem.css('top'),
				width:     $elem.css('width'),
				position:  $elem.css('position'),
				marginTop: $elem.css('margin-top'),
				cssLeft:   $elem.css('left')
			};

			if(menu){
				//left and width need to come from menu (not clone)
				//because the clone is taken out of the flow (position:fixed)
				Bank.set_width($elem[0].offsetWidth);
				Bank.set_left($elem[0].offsetLeft);
			}

			switch (anchor) {
				case 'top':
				case 'bottom':
					break;
				default:
					console.log('Unknown anchor '+anchor+', defaulting to top');
					anchor = 'top';
					break;
			}


			// Listeners
			//
			$window.on('scroll',  checkIfShouldStick);
			$window.on('resize',  $scope.$apply.bind($scope, onResize));
			$scope.$on('$destroy', onDestroy);

			function onResize() {
				if(menu){
					Bank.set_width($elem[0].offsetWidth);
					Bank.set_left($elem[0].offsetLeft);
				}

				checkIfShouldStick();

				// initialCSS.offsetWidth = elem.offsetWidth;
				// checkIfShouldStick();
				//
				// if(isSticking){
				// 	var parent = window.getComputedStyle(elem.parentElement, null),
				// 		initialOffsetWidth = elem.parentElement.offsetWidth -
				// 			parent.getPropertyValue('padding-right').replace('px', '') -
				// 			parent.getPropertyValue('padding-left').replace('px', '');
				//
				// 	$elem.css('width', initialOffsetWidth+'px');
				// }
			}

			function onDestroy() {
				$window.off('scroll', checkIfShouldStick);
				$window.off('resize', onResize);

				if ( bodyClass ) {
					$body.removeClass(bodyClass);
				}
			}


			// Watcher
			//
			if(menu){
				prevOffset = _getTopOffset(elem);
			}

			$scope.$watch( function() { // triggered on load and on digest cycle
				if ( isSticking ) return prevOffset;

				if(menu){
					prevOffset =
						(anchor === 'top') ?
							_getTopOffset(elem) :
							_getBottomOffset(elem);
				}

				return prevOffset;

			}, function(newVal, oldVal) {
				if ( newVal !== oldVal || typeof Bank.get_sticky_line() === 'undefined') {

					if(menu){
						Bank.set_sticky_line(newVal - offset);
						checkIfShouldStick();
					}
				}
			});

			// Methods
			//
			function checkIfShouldStick() {
				var scrollTop, shouldStick, scrollBottom, scrolledDistance;
				if ( mediaQuery && !matchMedia('('+mediaQuery+')').matches)
					return;

				if ( anchor === 'top' ) {
					scrolledDistance = window.pageYOffset || doc.scrollTop;
					scrollTop        = scrolledDistance  - (doc.clientTop || 0);
					shouldStick      = scrollTop >=  Bank.get_sticky_line();
				} else {
					scrollBottom     = window.pageYOffset + window.innerHeight;
					shouldStick      = scrollBottom <= Bank.get_sticky_line();
				}

				// Switch the sticky mode if the element crosses the sticky line
				if ( shouldStick && !isSticking ){
					stickElement();
				}else if ( !shouldStick && isSticking ){
					unstickElement();
				}
			}

			function stickElement() {
				var rect, absoluteLeft;

				rect = $elem[0].getBoundingClientRect();
				absoluteLeft = rect.left;

				initialCSS.offsetWidth = elem.offsetWidth;

				isSticking = true;

				if ( bodyClass ) {
					$body.addClass(bodyClass);
				}

				if ( stickyClass ) {
					$elem.addClass(stickyClass);
				}

				if(menu){
					$elem.addClass("not-visible");
					$elem.removeClass("is-visible");
				 }


				if(clone){
					$elem.removeClass("display-none");
					$elem.css({width: Bank.get_width() + 'px', left: Bank.get_left() + "px"});
				}

				if ( anchor === 'bottom' ) {
					$elem.css('margin-bottom', 0);
				}
			}

			function unstickElement() {

				$elem.attr('style', $elem.initialStyle);
				isSticking = false;

				if ( bodyClass ) {
					$body.removeClass(bodyClass);
				}

				if ( stickyClass ) {
					$elem.removeClass(stickyClass);
				}

				if(menu){
					$elem.addClass("is-visible");
					$elem.removeClass("not-visible");
				}

				if(clone){
					$elem.addClass("display-none");
				}
			}

			function _getTopOffset (element) {
				var pixels = 0;
				if (element.offsetParent) {
					do {
						pixels += element.offsetTop;
						element = element.offsetParent;
					} while (element);
				}

				return pixels;
			}

			function _getBottomOffset (element) {
				return element.offsetTop + element.clientHeight;
			}
		}

	}]);

	// Shiv: matchMedia
	//
	window.matchMedia = window.matchMedia || (function() {
		var warning = 'angular-sticky: This browser does not support '+
			'matchMedia, therefore the minWidth option will not work on '+
			'this browser. Polyfill matchMedia to fix this issue.';

		if ( window.console && console.warn ) {
			console.warn(warning);
		}

		return function() {
			return {
				matches: true
			};
		};
	}());

}());
