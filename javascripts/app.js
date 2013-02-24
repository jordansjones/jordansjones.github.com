// Main app file.

// Configure Path aliases
require.config({
	urlArgs: "bust=" +  (new Date()).getTime(),
	paths: {
		"backbone": 	"vendor/backbone",
		"jquery": 		"vendor/jquery",
		"underscore": 	"vendor/underscore",
		"keymaster": 	"vendor/keymaster",
		"easel": "vendor/easeljs-NEXT.min",
		"tween": "vendor/tweenjs-NEXT.min", 

		// App
		'util': 		'application/Util'
	},
	shim: {
		"easel": {
			"exports": "createjs"
		},
		"tween": {
			"exports": "createjs"
		}
	}
});

requirejs(['jquery', 'application/main', 'util', "easel", "tween"], function ($, Main, Util, easel) {

	$(function () {
		var $window = $(window);
		var $document = $(document);
		var $wrapper = $('#stage-wrapper');
		var $stage = $('#stage-canvas');
		$stage
			.attr({
				'height': Util.height,
				'width': Util.width
			});

		var onResize = function () {
			var wHeight = $window.innerHeight();
			var height = $stage.innerHeight();

			var top = (wHeight - height) / 2;
			$stage.css({
				'top': top
			});
		};

		onResize();

		var main = new Main({
			canvas: $stage
		}).setElement($wrapper).render();

		$stage
			.fadeIn()
			.promise().then(function () {
				main.run();
			});

		$document.on('webkitvisibilitychange', function () {
			var isHidden = $document.attr('webkitHidden');
			if (isHidden && !easel.Ticker.getPaused())
				main.pause(true);
			// if (!isHidden && Ticker.getPaused() && !$("#play").hasClass("btn-warning"))
			// 	main.pause(false);
		});
		$window.on('resize', function (e) {
			onResize();
		});

		$("#reset").on('click', function (e) {
			if (e && e.preventDefault) e.preventDefault();

			main.reset();
		});
		$("#generate-single").on('click', function(e) {
			if (e && e.preventDefault) e.preventDefault();

			var $el = $(this);
			var isMultiple = $el.hasClass("btn-inverse");

			if (isMultiple)
				$el.removeClass("btn-inverse").addClass("btn-primary");
			else
				$el.addClass("btn-inverse").removeClass("btn-primary");

			main.$multipleObjectsPerClick = !isMultiple;
		});
		var $play = $("#play");
		$play.on('click', function (e) {
			if (e && e.preventDefault) e.preventDefault();
			var isPlaying = $play.hasClass("btn-success");
			main.pause(isPlaying);
		});

		main.on("paused", function (isPaused) {
			var $el = $play;
			if (isPaused) {
				$el.removeClass("btn-success").addClass("btn-warning");
			}
			else {
				$el.removeClass("btn-warning").addClass("btn-success");
			}
		});
	});
});
