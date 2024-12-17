define(['underscore', 'jquery', 'util', "easel"], function (_, $, Util, easel) {


	var Stats = function (stage) {
		_.bindAll(this, ["onEntityCreated", "onEntityRemoved"]);

		this.$yOffset = 5;
		this.$container = null;
		this.$stage = stage;


		this.$rows = {};

		this._newRow("fps", "FPS:", 0.00);
		this._newRow("entities", "Balls", 0);
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

		render: function () {
			var rowKeys = _.keys(this.$rows);
			var rowHeight = 20;
			var rowCount = rowKeys.length;

			var cWidth = 120;
			var cHeight = (rowHeight * rowCount);

			var container = new easel.Container();
			container.x = (Util.width - cWidth - 5);
			container.y = 5;


			var g = new easel.Graphics();
			g.setStrokeStyle(1);
			g.beginStroke(easel.Graphics.getRGB(255, 255, 255, .7));
			g.beginFill(easel.Graphics.getRGB(238, 48, 218, .5));
			g.drawRoundRect(0, 0, cWidth, cHeight, 5);

			container.addChild(new easel.Shape(g));

			var key, x = (cWidth - 5), y, maxWidth = 50, row;

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

			this.$stage.addChild(container);
			this.$container = container;
			this.updateObjectCount(this.getCount(container, true));
			return this;
		},

		reset: function () {
			this.render();
		},

		onEntityCreated: function(entity) {
			this.updateEntityCount(1);
			this.updateObjectCount(this.getCount(entity, true));
			this.$stage.setChildIndex(this.$container, this.$stage.children.length - 1);
		},

		onEntityRemoved: function(entity) {
			this.updateEntityCount(-1);
			this.updateObjectCount(-this.getCount(entity, true));
			this.$stage.setChildIndex(this.$container, this.$stage.children.length - 1);
		},

		onTick: function (event) {
			this.updateFps(event.delta);
			this.draw(function(r) { return r.raw; });
		},

		draw: function (valFn) {
			_.each(this.$rows, function (row) {
				row.val.text = valFn(row);
			});
		},

		updateFps: function (delta) {
			var fps = easel.Ticker.getMeasuredFPS();
			fps *= 100;
			fps = Math.round(fps);
			fps /= 100;
			this.$rows["fps"].raw = fps;
		},

		updateEntityCount: function(diff) {
			this.$rows["entities"].raw += diff;
		},

		updateObjectCount: function(diff) {
			this.$rows["objects"].raw += diff;
		},

		getCount: function (obj, recurse) {
			recurse = (typeof(recurse) !== "undefined") ? recurse : true;
			var count = 0;
			if (obj && obj.children && obj.getChildAt) {
				for (var i = 0, size = obj.children.length; i < size; i++) {
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
