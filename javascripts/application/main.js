define(['underscore', 'backbone', 'keymaster', 'util', './Circle', './QuadTree', './Stats', "easel"], function (_, Backbone, Keymaster, Util, Circle, Tree, Stats, easel) {

	return Backbone.View.extend({

		$bounds: null,
		$canvas: null,
		$stage: null,

		$stats: {reset: function (){}, onTick: function() {}},

		$objects: [],
		$multipleObjectsPerClick: true,
		$isReset: false,

		$tree: null,

		initialize: function (options) {
			_.bindAll(this, ["tick", "onMouseUp", "onUpArrow", "onDownArrow", "onSpaceBar", "onNumberKey"]);

			this.$canvas = options.canvas;
		},

		render: function () {
			this.$stage = new easel.Stage(this.$canvas.get(0));
			this.$stats = new Stats(this.$stage).render();
			this.$tree = new Tree(new easel.Rectangle(0, 0, Util.width, Util.height), false, 7);

			return this;
		},

		newCircle: function (xy) {
			var speed = Util.rand(.3, 1.25);
			var c = new Circle(xy, speed).render(this.$stage);
			this.$objects.push(c);
			this.$stats.onEntityCreated(c.$obj);
		},

		run: function () {
			this.$stage.addEventListener("stagemouseup", this.onMouseUp);
			Keymaster('up, pageup', this.onUpArrow);
			Keymaster('down, pagedown', this.onDownArrow);
			Keymaster('space', this.onSpaceBar);
			Keymaster('1, 2, 3, 4, 5, 6, 7, 8, 9, 0', this.onNumberKey);

			this.$stage.update();

			easel.Ticker.RAG = true;
			easel.Ticker.framerate = Util.framerate;

			easel.Ticker.addEventListener("tick", this.tick);

			return this;
		},

		pause: function (doPause) {
			easel.Ticker.paused = doPause;
			this.trigger("paused", doPause);
		},

		onSpaceBar: function () {
			this.pause(!easel.Ticker.paused);
			return false;
		},

		onUpArrow: function (e) {
			console.log("onUpArrow: %o", arguments);
			var count = (e.keyIdentifier === "PageUp" || e.key === "PageUp") ? 10 : 1;
			this.generateBalls(count);
			return false;
		},

		onDownArrow: function (e) {
			var count = (e.keyIdentifier === "PageDown" || e.key === "PageDown") ? 10 : 1;
			for (var i = 0; i < count; i++) {
				var o = this.$objects.pop();
				if (!o) return;

				o.destroy(this.$stage);
				this.$stats.onEntityRemoved(o.$obj);
				Circle.decrement();
			}
			return false;
		},

		onMouseUp: function(e) {
			if (!this.$stage.mouseInBounds) return;
			e.preventDefault();
			this.generateBalls(null, e);
		},

		onNumberKey: function(e) {
			if (!e || !e.keyCode || !_.isNumber(e.keyCode)) return;
			var num = e.keyCode - 48;
			if (num === 0) {
				this.reset();
			}
			else {
				this.generateBalls(num);
			}
			return false;
		},

		generateBalls: function(count, e) {
			count = count || (this.$multipleObjectsPerClick ? Util.randInt(2, 20) : 1);

			if (!e) {
				e = Util.randPoint(this.$stage);
			}
			var pos = {
				x: e.stageX || e.x,
				y: e.stageY || e.y
			};

			if (easel.Ticker.paused) return;

			for (var i = 0; i < count; i++) {
				this.newCircle(pos);
			}
		},

		tick: function (event) {
			if (this.$isReset) return;
			if (event.paused) return;

			for (var i = 0; i < this.$objects.length; i++) {
				if (this.$isReset) continue;
				if (!this.$objects[i]) continue;
				this.$objects[i].onTick(event);
			}

			this.updateTree();

			this.updateCollisions();

			this.$stats.onTick(event);

			this.$stage.update();
		},

		updateTree: function () {
			if (this.$tree == null) return;
			this.$tree.clear();
			this.$tree.insert(this.$objects);
		},

		reset: function () {
			for (var i = 0, size = this.$objects.length; i < size; i++) {
				this.$objects[i].destroy(this.$stage);
				this.$stats.onEntityRemoved(this.$objects[i].$obj);
			}
			this.$objects = [];
			Circle.reset();
		},

		updateCollisions: function () {
			for (var i = 0, size = this.$objects.length; i < size; i++) {
				var entity = this.$objects[i];
				var items = this.$tree.retrieve(entity);
				for (var j = 0, iSize = items.length; j < iSize; j++) {
					var otherEntity = items[j];

					if (entity == otherEntity) continue;
					if (entity.$isColliding && otherEntity.$isColliding) continue;

					var dx = entity.x - otherEntity.x;
					var dy = entity.y - otherEntity.y;
					var rad = entity.$radius + otherEntity.$radius;
					var isColliding = ((dx * dx) + (dy * dy)) < (rad * rad);

					if (!entity.$isColliding)
						entity.$isColliding = isColliding;

					if (!otherEntity.$isColliding)
						otherEntity.$isColliding = isColliding;
				}

			}
		}

	});

});
