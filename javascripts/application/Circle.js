define(['underscore', 'util',"easel"], function (_, Util, easel) {

	var CIRCLE_RADIUS = 15;
	var CIRCLE_DIAMETER = 2 * CIRCLE_RADIUS;
	var HALF_CIRCLE = CIRCLE_DIAMETER / 2;
	var circleXReset;

	var Bounds = new easel.Rectangle(HALF_CIRCLE, HALF_CIRCLE, Util.width - HALF_CIRCLE, Util.height - HALF_CIRCLE);

	var COUNT = 0;

	var Circle = function (xy) {
		this.$circle = null;
		this.$start = new easel.Point(xy.x, xy.y);
		this.$dest = null;
		this.$direction = null;
		this.$moving = false;
		this.$count = ++COUNT;
		this.$radius = CIRCLE_RADIUS;
		this.$isColliding = false;
		this.$iteration = 0;
		this.x = this.$start.x;
		this.y = this.$start.y;
	};

	_.extend(Circle.prototype, {

		newDestination: function (dest) {
			this.$dest = dest;

			this.$direction = this.normalize(this.subtract(this.$dest, this.$start));
			this.$moving = true;
		},

		newShape: function (fillColor) {
			var container = new easel.Container();

			var g = new easel.Graphics();
			g.setStrokeStyle(1);
			g.beginStroke(easel.Graphics.getRGB(255, 255, 255, .7));
			if (fillColor) {
				g.beginFill(fillColor);
			}
			g.drawCircle(0, 0, CIRCLE_RADIUS);
			container.addChild(new easel.Shape(g));

			var txt = new easel.Text(this.$count, Util.fontBold, Util.fontColor);
			txt.x = 0;
			txt.y = 0;
			txt.lineHeight = CIRCLE_DIAMETER;
			txt.textAlign = "center";
			txt.textBaseline = "middle";
			txt.maxWidth = CIRCLE_DIAMETER;
			container.addChild(txt);

			return container;
		},

		newFillColor: function () {
			var r = Util.randInt(0, 200);
			var g = Util.randInt(0, 200);
			var b = Util.randInt(0, 200);
			return easel.Graphics.getRGB(r, g, b, 1);
		},

		render: function(stage) {
			this.newDestination(Util.randPoint());

			var fillColor;
			if (this.$count > 1) {
				fillColor = this.newFillColor();
			}
			this.$circle = this.newShape(fillColor);
			this.$circle.x = this.$start.x;
			this.$circle.y = this.$start.y;

			stage.addChild(this.$circle);

			return this;
		},

		onTick: function (msElapsed) {
			if (!this.$moving) return;
			// if (this.$isColliding && this.$iteration > 50) {
			// 	this.$direction.x *= -1;
			// 	this.$direction.y *= -1;
			// }
			// else {
			// 	this.$iteration++;
			// }

			this.$circle.x += this.$direction.x * Util.speedPerTick * msElapsed;
			this.$circle.y += this.$direction.y * Util.speedPerTick * msElapsed;

			var x = this.$circle.x;
			var y = this.$circle.y;
			if (x > Bounds.width || x < Bounds.x) {
				this.$circle.x = (x > (Bounds.width / 2)) ? Bounds.width : Bounds.x;
				this.$direction.x *= -1;
				// change = true;
			}
			if (y > Bounds.height || y < Bounds.y) {
				this.$circle.y = (y > (Bounds.height / 2)) ? Bounds.height : Bounds.y;
				this.$direction.y *= -1;
				// change = true;
			}

			this.x = this.$circle.x;
			this.y = this.$circle.y;

			this.$isColliding = false;
		},

		reflect: function (vector, normal) {
			var d = this.dot(vector, normal);
			var x = vector.x - 2 * d * normal.x;
			var y = vector.y - 2 * d * normal.y;
			return new Point(x, y);
		},

		add: function(a, b) {
			return new easel.Point(a.x + b.x, a.y + b.y);
		},

		subtract: function(a, b) {
			return new easel.Point(a.x - b.x, a.y - b.y);
		},

		multiply: function(a, b) {
			return new easel.Point(a.x * b.x, a.y * b.y);
		},

		dot: function(a, b) {
			return (a.x * b.x) + (a.y * b.y);
		},

		length: function (a) {
			return Math.sqrt(a.x * a.x + a.y * a.y);
		},

		distance: function (a, b) {
			return this.length(new easel.Point(b.x - a.x, b.y - a.y));
		},

		normalize: function (a) {
			var len = this.length(a);
			return new easel.Point(a.x / len, a.y / len);
		}

	});

	Circle.reset = function () {
		COUNT = 0;
	};

	Circle.decrement = function () {
		COUNT--;
	};

	return Circle;

});
