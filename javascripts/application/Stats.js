define(['underscore', 'jquery', 'util', "easel"], function (_, $, Util, easel) {


	var Stats = function () {

		this.$yOffset = 2;
		this.$stage = null;
		this.$stats = null;


		this.$rows = {};

		this._newRow("fps", "FPS:", 0.00);
		this._newRow("balls", "Balls", 0);
		this._newRow("objects", "Objects:", 0);
	};

	_.extend(Stats.prototype, {

		_newRow: function(name, label, defaultValue) {
			this.$rows[name] = {
				label:  new easel.Text(label, Util.fontBold, Util.fontColor),
				val: new easel.Text("" + defaultValue, Util.fontNormal, Util.fontColor),
				raw: defaultValue,
				def: defaultValue
			};
		},

		render: function (stage) {
			var rowKeys = _.keys(this.$rows);
			var rowHeight = 19;
			var rowCount = rowKeys.length;

			var cWidth = 120;
			var cHeight = (rowHeight * rowCount);
			var container = new easel.Container();
			container.x = (Util.width - cWidth - 5);
			container.y = 5;

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

			this.$stats = new easel.Stage(ss.get(0));


			var g = new easel.Graphics();
			g.setStrokeStyle(1);
			g.beginStroke(easel.Graphics.getRGB(255, 255, 255, .7));
			g.beginFill(easel.Graphics.getRGB(51, 51, 51, .5));
			g.drawRoundRect(0, 0, cWidth, cHeight, 5);
			container.addChild(new easel.Shape(g));

			var key, prevKey, x = (cWidth - 5), y, maxWidth = 50, row;

			for (var i in rowKeys) {
				key = rowKeys[i];
				row = this.$rows[key];

				y = this.$yOffset + (i * rowHeight) - i;

				// Add Value
				row.val.textAlign = "right";
				row.val.maxWidth = maxWidth;
				row.val.x = x;
				row.val.y = y; 
				container.addChild(row.val);

				// Add Label
				row.label.maxWidth = maxWidth;
				row.label.x = (x - maxWidth - maxWidth);
				row.label.y = y;
				container.addChild(row.label);
			}

			this.$stats.addChild(container);

			this.$stage = stage;
			return this;
		},

		reset: function () {
			this.draw(function(r) { return r.def; });
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
			this.updateBallCount();
			this.updateObjectCount();
			this.draw(function(r) { return r.raw; });
			this.$stats.update();
		},

		draw: function (valFn) {
			_.each(this.$rows, function (row) {
				row.val.text = valFn(row);
			});
		},

		updateFps: function () {
			var fps = easel.Ticker.getMeasuredFPS();
			fps *= 100;
			fps = Math.round(fps);
			fps /= 100;
			this.$rows["fps"].raw = fps;
		},

		updateBallCount: function() {
			this.$rows["balls"].raw = this.getCount(this.$stage, false);
		},

		updateObjectCount: function() {
			this.$rows["objects"].raw = this.getCount(this.$stage, true) + this.getCount(this.$stats, true);
		},

		getCount: function (obj, recurse) {
			recurse = (typeof(recurse) !== "undefined") ? recurse : true;
			var count = 0;
			if (obj && obj.getNumChildren && obj.getChildAt) {
				for (var i = 0, size = obj.getNumChildren(); i < size; i++) {
					var child = obj.getChildAt(i);
					count += 1;
					if (recurse) {
						count += this.getCount(child, recurse);
					}
				}
			}
			return count;
		}

	});

	return Stats;

});
