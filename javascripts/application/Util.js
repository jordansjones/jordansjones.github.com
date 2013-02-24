define(function(require) {

	var easel = require("easel");

	return {
		// Dimensions
		'height': 800,
		'width': 940,

		// Framerate
		'framerate': 60,
		'frameinterval': 10,
		'speedPerTick': .75,

		// Text
		fontNormal: "13px 'Helvetica Neue', Helvetica, Arial, sans-serif",
		fontBold: "bold 13px 'Helvetica Neue', Helvetica, Arial, sans-serif",
		fontColor: "#ffffff",

		// Functions

		rand: function (min, max) {
			return Math.random() * (max - min) + min;
		},

		randInt: function (min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		randPoint: function () {
			var x = this.rand(0, this.width);
			var y = this.rand(0, this.height);
			return new easel.Point(x, y);
		}
	};

});
