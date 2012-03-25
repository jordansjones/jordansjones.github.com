define(['underscore', 'jquery', 'util'], function (_, $, Util) {


	var Stats = function () {

		this.$yOffset = 20;
		this.$stage = null;
		this.$stats = null;

		this.$fps = new Text("0.00", Util.fontNormal, Util.fontColor);
		this.$fpsLabel = new Text("FPS:", Util.fontBold, Util.fontColor);

		this.$count = new Text("0", Util.fontNormal, Util.fontColor);
		this.$countLabel = new Text("Count:", Util.fontBold, Util.fontColor);
	};

	_.extend(Stats.prototype, {

		render: function (stage) {
			var ss = this.cloneCanvas(stage.canvas);
			ss = $(ss);
			var cvs = $(stage.canvas);
			cvs.after(ss);
			var cvsPos = cvs.position();
			ss.css({
				'position': 'absolute',
				'top': cvsPos.top,
				'left': cvsPos.left,
				'opacity': 1
			});

			this.$stats = new Stage(ss.get(0));

			var cWidth = 100;
			var cHeight = 50;
			var container = new Container();
			container.x = (Util.width - cWidth - 5);
			container.y = 5;


			var g = new Graphics();
			g.setStrokeStyle(1);
			g.beginStroke(Graphics.getRGB(255, 255, 255, .7));
			g.beginFill(Graphics.getRGB(51, 51, 51, .5));
			g.drawRoundRect(0, 0, cWidth, cHeight, 5);
			container.addChild(new Shape(g));

			container.addChild(this.$fps);
			this.$fps.textAlign = "right";
			this.$fps.maxWidth = 50;
			this.$fps.x = (cWidth - 5);
			this.$fps.y = this.$yOffset;

			container.addChild(this.$fpsLabel);
			this.$fpsLabel.maxWidth = 30;
			this.$fpsLabel.x = (this.$fps.x - this.$fps.maxWidth - this.$fpsLabel.maxWidth);
			this.$fpsLabel.y = this.$fps.y;

			container.addChild(this.$count);
			this.$count.textAlign = "right";
			this.$count.maxWidth = 50;
			this.$count.x = this.$fps.x;
			this.$count.y = this.$yOffset + this.$fps.getMeasuredLineHeight() + 2;

			container.addChild(this.$countLabel);
			this.$countLabel.maxWidth = 40;
			this.$countLabel.x = (this.$count.x - this.$count.maxWidth - this.$countLabel.maxWidth);
			this.$countLabel.y = this.$count.y;

			this.$stats.addChild(container);

			this.$stage = stage;
			return this;
		},

		reset: function () {
			this.$fps.text = "0.0";
			this.$count.text = "0";
		},

		cloneCanvas: function(cvs) {
			var p = ['height', 'width', 'style'];
			var nc = {
				"id": "stage-canvas-stats"
			};

			for (var i = 0; i < p.length; i++) {
				var prop = p[i];
				nc[prop] = prop == 'style' ? cvs[prop].cssText : cvs[prop];
			}

			var markup = "<canvas";
			for (var p in nc) {
				markup += " " + p + '="' + nc[p] + '"';
			}
			markup += "></canvas>";
			return markup;
		},

		onTick: function () {
			this.updateFps();
			this.updateObjectCount();
			this.$stats.update();
		},

		updateFps: function () {

			// console.log ()

			var fps = Ticker.getMeasuredFPS();
			fps *= 100;
			fps = Math.round(fps);
			fps /= 100;
			this.$fps.text = fps;
		},

		updateObjectCount: function() {
			this.$count.text = this.getCount(this.$stage) + this.getCount(this.$stats);
		},

		getCount: function (obj) {
			var count = 0;
			if (obj && obj.getNumChildren && obj.getChildAt) {
				for (var i = 0, size = obj.getNumChildren(); i < size; i++) {
					var child = obj.getChildAt(i);
					count += 1 + this.getCount(child);
				}
			}
			return count;
		}

	});

	return Stats;

});
