;(function($) {
	var defaults = {
		// Classes
		sliderClass: 'ckslider',
		controlNextClass: 'ckslider-controls-next',
		controlPrevClass: 'ckslider-controls-prev',
		activeClass: 'ckslider-active',
		visibleClass: 'ckslider-visible',
		nextSlideClass: 'ckslider-next',
		prevSlideClass: 'ckslider-prev',
		slidingVisibleClass: 'ckslider-slide-visible',
		paginateClass: 'ckslider-paginate',

		showPaginate: true,

		// Transition stuff
		automate: true, // Automatically rotate images
		slideTimer: 10, // seconds
		transition: 'fade',
		slideTransition: 'slideout',
		transitionSpeed: 300, // miliseconds

		// Touch stuffs
		enableTouch: true,
		hideControlsOnTouchScreen: false,
		touchSnapBackTime: 100,
		touchSnapSlideTime: 200,
		touchSnapPixelReq: 150 // Number of pixels to slide or snap back
	};

	var ckSlider = function(el, options) {
		this.el = el;
		this.options = $.extend({}, defaults, options);

		this.init();
	};

	ckSlider.prototype.startTimer = function() {
		var cks = this;

		if(cks.options.automate === true && cks.el.children('ul').children('li').length > 1) {
			window.clearTimeout(cks.event);
			cks.event = window.setTimeout(function() {
				cks.slideNext();
			}, cks.options.slideTimer * 1000);
		}
	};

	ckSlider.prototype.init = function() {
		var slideLen = this.el.children('ul').children('li').length;

		if(slideLen > 1) {
			this.createControls();
			this.createPaginate();
		}

		this.setFirstSlide();
		this.animating = false;
		this.startTimer();
	};

	ckSlider.prototype.setFirstSlide = function() {
		var cks = this,
			$first = null,
			$next =null,
			$prev = null;
		if($('.' + this.options.activeClass).length === 0) {
			$first = this.el.children('ul').children('li').first();
		} else {
			$first = $('.' + this.options.activeClass).first();
		}

		// remove the active class of all siblings
		$first.addClass(this.options.activeClass)
				.addClass(this.options.visibleClass)
				.siblings().removeClass(this.options.activeClass);

		$next = $first.next();
		if($next.length === 0) {
			$next = this.el.children('ul').children('li').first();
		}

		$prev = $first.prev();
		if($prev.length === 0) {
			$prev = this.el.children('ul').children('li').last();
		}

		$next.addClass(this.options.nextSlideClass)	
				.addClass(this.options.activeClass);
		$prev.addClass(this.options.prevSlideClass)
				.addClass(this.options.activeClass);

		this.updatePaginate();
	};

	// Create the controls and append it to our element
	// only if it does not exist already. Also, do not
	// create controls if touch screen is being used
	// and the option is set to not use controls on touch
	// screen.
	ckSlider.prototype.createControls = function() {
		var cks = this;
		if(this.options.hideControlsOnTouchScreen === false || this.isTouchScreen() === false) {
			// Exit if 1 or less slider
			if(this.el.children('ul').children('li').length <= 1) return false;

			if(this.el.find('.' + this.options.controlNextClass).length === 0) {
				$('<div>').addClass(this.options.controlNextClass).appendTo(this.el);
				$('<div>').addClass(this.options.controlPrevClass).appendTo(this.el);
			}

			var $next = this.el.find('.' + this.options.controlNextClass),
				$prev = this.el.find('.' + this.options.controlPrevClass);

			$next.on('click', function() {
				if(cks.animating === false) {
					cks.animating = true;
					cks.slideNext();
				}
			});

			$prev.on('click', function() {
				if(cks.animating === false) {
					cks.animating = true;
					cks.slidePrev();
				}
			});
		}

		if(this.options.enableTouch === true && this.isTouchScreen() === true) {
			this.initTouchFunctions();
		}
	};

	ckSlider.prototype.createPaginate = function() {
		var cks = this;

		function animatePaginate(el) {
			var $this = el;
			console.log($(this));
			if(!$this.hasClass(cks.options.activeClass) && cks.animating === false) {
				var $prev = $this.prev(),
					place = 1;

				cks.animating = true;

				if($prev.length !== 0) {
					do {
						$prev = $prev.prev();
						place += 1;
					} while ($prev.length !== 0);
				} else {
					place = 1;
				}

				// var $curSlide = $('.' + cks.el.children('ul').find('.' + cks.options.activeClass)),
				// 	curPlace = 1;
				// if($curSlide.length !== 0) {
				// 	do {
				// 		$prev = $prev.prev();
				// 		place += 1;
				// 	} while ($prev.length !== 0);
				// } else {
				// 	place = 1;
				// }

				$this.siblings().removeClass(cks.options.activeClass);
				$this.parent().children(':nth-child(' + place + ')').addClass(cks.options.activeClass);

				var $visible = $('.' + cks.options.visibleClass),
					$next = cks.el.children('ul').children(':nth-child(' + place + ')');

				$next.show();

				function finishTransition() {
					var $nextSlide = $next.next(),
						$prevSlide = $next.prev(),
						$curPrev = cks.el.children('ul').find('.' + cks.options.prevSlideClass),
						$curNext = cks.el.children('ul').find('.' + cks.options.nextSlideClass);

					$curPrev.removeClass(cks.options.activeClass)
							.removeClass(cks.options.prevSlideClass);
					$curNext.removeClass(cks.options.activeClass)
							.removeClass(cks.options.nextSlideClass);

					$visible.removeClass(cks.options.visibleClass)
						.removeClass(cks.options.activeClass);
					$next.addClass(cks.options.visibleClass)
						.addClass(cks.options.activeClass)
						.removeClass(cks.options.slidingVisibleClass);

					if($nextSlide.length === 0) {
						$nextSlide = cks.el.children('ul').children('li').first();
					}
					if($prevSlide.lenght === 0) {
						$prevSlide = cks.el.children('ul').children('li').last();
					}

					$nextSlide.removeAttr('class');
					$prevSlide.removeAttr('class');
					$nextSlide.addClass(cks.options.activeClass)
						.addClass(cks.options.nextSlideClass)
						.siblings().removeClass(cks.options.nextSlideClass);
					$prevSlide.addClass(cks.options.activeClass)
						.addClass(cks.options.prevSlideClass)
						.siblings().removeClass(cks.options.prevSlideClass);

					cks.animating = false;
				}

				$next.addClass(cks.options.slidingVisibleClass)
						.addClass(cks.options.activeClass)
				if(cks.options.transition === 'slideout') {

				} else if(cks.options.transition === 'slide') {

				} else {
					// Default fade

					$visible.fadeOut(cks.options.transitionSpeed, function() {
						finishTransition();
					});
				}
			}
		}

		if(this.options.showPaginate === true) {
			if(this.el.find('.' + this.options.paginateClass).length === 0) {
				var $paginate = $('<div>'),
					$ul = $('<ul>'),
					i = 0,
					len = this.el.children('ul').children('li').length;
				$paginate.addClass(this.options.paginateClass);
				for(i = 0; i < len; i++) {
					$ul.append('<li>');
				}
				$ul.on('click', 'li', function() {
					animatePaginate($(this));
				});
				$paginate.append($ul);
				this.el.append($paginate);
			} else {
				var $ul = this.el.find('.' + this.options.paginateClass);
				$ul.on('click', 'li', function() {
					animatePaginate($(this));
				});
			}
		}
	};

	ckSlider.prototype.updatePaginate = function(direction) {
		var cks = this,
			$curSlide = $('.' + this.options.visibleClass),
			place = 1,
			$prev = $curSlide.prev(),
			$next = $curSlide.next();

		if($prev.length !== 0) {
			do {
				$prev = $prev.prev();
				place += 1;
			} while($prev.length > 0);
		} else {
			place = 1;
		}

		if(direction !== undefined) {
			place += direction;
			if(place > $curSlide.siblings().length + 1) {
				place = 1;
			}
			if(place < 1) {
				place = $curSlide.siblings().length + 1;
			}
		}
		$('.' + this.options.paginateClass + ' li:nth-child(' + place + ')').addClass(this.options.activeClass)
			.siblings().removeClass(this.options.activeClass);
	};

	ckSlider.prototype.slideVisibleBack = function() {
		$('.' + this.options.visibleClass).animate({
			left: 0
		}, {
			duration: this.options.touchSnapBackTime
		});
	};

	// Slides the slide off screen if slide over enough
	ckSlider.prototype.slideSlideOver = function(direction) {
		var cks = this,
			$visible = this.el.find('.' + this.options.visibleClass);
		if(direction === 1) {
			$visible.animate({
				left: '100%'
			}, {
				duration: this.options.touchSnapSlideTime,
				complete: function() {
					var $prev = $('.' + cks.options.prevSlideClass).addClass(cks.options.visibleClass),
						$next = $('.' + cks.options.nextSlideClass).removeClass(cks.options.nextSlideClass).removeClass(cks.options.activeClass),
						$prevprev = null;

					$visible.removeClass(cks.options.visibleClass)
							.addClass(cks.options.nextSlideClass)
							.css('left', '0');

					$prev.removeClass(cks.options.prevSlideClass);
					$prev.removeClass(cks.options.slidingVisibleClass);
					$prevprev = $prev.prev();
					if($prevprev.length === 0) {
						$prevprev = cks.el.children('ul').children('li').last();
					}
					$prevprev.addClass(cks.options.prevSlideClass)
							.addClass(cks.options.activeClass);
				}
			});
		} else {
			$visible.animate({
				left: '-100%'
			}, {
				duration: this.options.touchSnapSlideTime,
				complete: function() {
					var $next = $('.' + cks.options.nextSlideClass).addClass(cks.options.visibleClass),
						$prev = $('.' + cks.options.prevSlideClass).removeClass(cks.options.prevSlideClass).removeClass(cks.options.activeClass),
						$nextnext = null;

					$visible.removeClass(cks.options.visibleClass)
							.addClass(cks.options.prevSlideClass)
							.css('left', '0');

					$next.removeClass(cks.options.nextSlideClass);
					$next.removeClass(cks.options.slidingVisibleClass);
					$nextnext = $next.next();
					if($nextnext.length === 0) {
						$nextnext = cks.el.children('ul').children('li').first();
					}
					$nextnext.addClass(cks.options.nextSlideClass)
							.addClass(cks.options.activeClass);
				}
			});
		}
	};

	ckSlider.prototype.isTouchScreen = function() {
		return !!('ontouchstart' in window);
	};

	ckSlider.prototype.slideNext = function() {
		var $next = $('.' + this.options.nextSlideClass),
			$visible = $('.' + this.options.visibleClass),
			$prev = $('.' + this.options.prevSlideClass),
			cks = this,
			$curPage = $('.' + this.options.paginateClass).children(this.options.activeClass),
			$nextPage = $curPage.next();

		// Reset the timer
		cks.startTimer();

		$next.addClass(this.options.slidingVisibleClass);

		if($nextPage.lenght === 0) {
			$('.' + this.options.paginateClass).children('li').first();
		}
		$curPage.removeClass(this.options.activeClass);
		$nextPage.addClass(this.options.activeClass);

		function finishSlide() {
			$prev.removeAttr('class');
			$visible.removeAttr('class')
					.addClass(cks.options.prevSlideClass)
					.addClass(cks.options.activeClass);
			$next.addClass(cks.options.visibleClass)
				.removeClass(cks.options.nextSlideClass)
				.removeClass(cks.options.slidingVisibleClass);

			var $newnext = $next.next();
			if($newnext.length === 0) {
				$newnext = cks.el.children('ul').children('li').first();
			}
			$newnext.addClass(cks.options.activeClass)
					.addClass(cks.options.nextSlideClass);

			cks.animating = false;
		}

		cks.updatePaginate(1);
		if(this.options.transition === 'slideout') {
			$next.css('left', '0px');
			$visible.animate({
				left: "-100%"
			}, {
				duration: cks.options.transitionSpeed,
				complete: function() {
					finishSlide();
				}
			});
		} else if(this.options.transition === 'slide') {
			$next.css('left', '100%');
			$next.animate({
				left: '0'
			}, {
				duration: cks.options.transitionSpeed
			});
			$visible.animate({
				left: '-100%'
			}, {
				duration: cks.options.transitionSpeed,
				complete: function() {
					finishSlide();
				}
			});
		} else {
			$next.show();
			$visible.fadeOut(this.options.transitionSpeed, function() {
				finishSlide();
			});
		}
	};

	ckSlider.prototype.slidePrev = function() {
		var $prev = $('.' + this.options.prevSlideClass),
			$visible = $('.' + this.options.visibleClass),
			$next = $('.' + this.options.nextSlideClass),
			cks = this;

		// Reset the timer
		cks.startTimer();

		$prev.addClass(this.options.slidingVisibleClass);
		$prev.show();

		function finishSlide() {
			$next.removeAttr('class');
			$visible.removeAttr('class')
					.addClass(cks.options.nextSlideClass)
					.addClass(cks.options.activeClass);
			$prev.addClass(cks.options.visibleClass)
				.removeClass(cks.options.prevSlideClass)
				.removeClass(cks.options.slidingVisibleClass);

			var $newprev = $prev.prev();
			if($newprev.length === 0) {
				$newprev = $('.' + cks.options.sliderClass).children('ul').children('li').last();
			}
			$newprev.addClass(cks.options.activeClass)
					.addClass(cks.options.prevSlideClass);

			cks.animating = false;
		}

		cks.updatePaginate(-1);
		if(this.options.transition === 'slideout') {
			$prev.css('left', '0');
			$visible.animate({
				left: '100%'
			}, {
				duration: cks.options.transitionSpeed,
				complete: function() {
					finishSlide();
				}
			});
		} else if(this.options.transition === 'slide') {
			$prev.css('left', '-100%');
			$prev.animate({
				left: '0'
			}, {
				duration: cks.options.transitionSpeed
			});
			$visible.animate({
				left: '100%'
			}, {
				duration: cks.options.transitionSpeed,
				complete: function() {
					finishSlide();
				}
			});
		} else {
			// Default to fade
			$prev.show();
			$visible.fadeOut(this.options.transitionSpeed, function() {
				finishSlide();
			});
		}
	};

	// Set up the touch functions
	ckSlider.prototype.initTouchFunctions = function() {
		var cks = this;
		cks.el.on('touchstart', function(e) {
			e.preventDefault();
			if(e.originalEvent.touches) {
				cks.options.startX = e.originalEvent.touches[0].pageX;
			} else {
				cks.options.startX = e.pageX;
			}
			cks.options.moveX = cks.options.startX;

			$(document).on('touchmove', function(e) {
				var leftX = 0;

				if(cks.options.startX >= 0) {
					e.preventDefault();
					if(e.originalEvent.touches) {
						leftX = 0 - (cks.options.startX - e.originalEvent.touches[0].pageX);
						cks.options.moveX = e.originalEvent.touches[0].pageX;
					} else {
						leftX = 0 - (cks.options.startX - e.pageX);
						cks.options.moveX = e.pageX;
					}

					if(leftX > 0) {
						$('.' + cks.options.nextSlideClass).removeClass(cks.options.slidingVisibleClass);
						$('.' + cks.options.prevSlideClass).addClass(cks.options.slidingVisibleClass);
					} else if(leftX < 0) {
						$('.' + cks.options.nextSlideClass).addClass(cks.options.slidingVisibleClass);
						$('.' + cks.options.prevSlideClass).removeClass(cks.options.slidingVisibleClass);
					} else {
						$('.' + cks.options.nextSlideClass).removeClass(cks.options.slidingVisibleClass);
						$('.' + cks.options.prevSlideClass).removeClass(cks.options.slidingVisibleClass);
					}

					$('.' + cks.options.visibleClass).css({
						left: leftX
					});
				}
			});

			$(document).on('touchend', function(e) {
				e.preventDefault();
				if(cks.options.moveX - cks.options.startX > cks.options.touchSnapPixelReq) {
					cks.slideSlideOver(1);
				} else if(cks.options.startX - cks.options.moveX > cks.options.touchSnapPixelReq) {
					cks.slideSlideOver(-1);
				} else {
					cks.slideVisibleBack();
				}
				cks.options.moveX = 0;
				cks.options.startX = -1;
			});
		});
	};

	$.fn.ckslider = function(options) {
		var ckslider = new ckSlider($(this), options);
	};
	
})(jQuery);