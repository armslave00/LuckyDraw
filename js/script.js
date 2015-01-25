// JavaScript Document
$(document).ready(function() {

	window.draws = [];
	var draw = new Draw();

	window.timer = window.setInterval('frame()', 50);

	$('.btn').click(function() {
		if ($(this).text() == 'Start') {
			window.count = 20;
			draw.useData = true;
			draw.generateDraw(window.count);
			draw.startDraw();
			$(this).text('Stop');
		} else {
			draw.stopDraw();
			$(this).text('Start');
		}
	});

	var saveList = function() {
		var textContent = "";
		for (var i in draw.history) {
			var round = Number(i) + 1;
			textContent = textContent + "Round " + round + "\n";
			for (var j in draw.history[i]) {
				var item = draw.history[i][j];
				textContent = textContent + "EID: " + item.eID + "   Name: " + item.eName + "\n";
			}
		}
		var now = new Date();
		var month = now.getMonth() + 1;
		var fileName = "LuckyList-" + now.getFullYear() + "-" + month + "-" + now.getDate() + ".txt";
		saveTextAs(textContent, fileName);
	};

	$('.btn-save').click(saveList);

	$(window).keypress(function(event) {
		if (event.which === 32 || event.which === 13) {
			event.preventDefault();
			event.stopPropagation();

			var $btn = $('.btn');
			if ($btn.text() == 'Start') {
				window.count = 20;
				draw.useData = true;
				draw.generateDraw(window.count);
				draw.startDraw();
				$btn.text('Stop');
			} else {
				draw.stopDraw();
				$btn.text('Start');
			}
		} else if (event.which === 115 || event.which === 83) {
			event.preventDefault();
			event.stopPropagation();

			saveList();
		}
	});
	var xhr = $.ajax('data/nameList.xml', {
		dataType: 'xml',
		success: function(data) {
			try {
				var employees = $(data);
				draw.data = [];
				$('employee', employees).each(function() {
					var employee = {};
					employee.eID = $('eID', $(this)).text();
					employee.eName = $('eName', $(this)).text();
					draw.data.push(employee);
				});
			} catch (e) {
				alert(e);
			}

		}
	});
	xhr.error(function(jqXHR, textStatus, errorThrown) {
		alert('error');
	});
	window.count = parseInt($('#grade').val());
	draw.generateDraw(window.count);
});

function frame() {
	for (var i = 0; i < window.draws.length; i++) {
		var draw = window.draws[i];
		if (draw.start) {
			draw.getId();
		}
	}
}

Draw = function Draw() {
	this.count = 0;
	this.data = [];
	this.useData = true;
	this.numExclude = [];
	this.dataExclude = [];
	this.currentItem = [];
	this.selected = [];
	this.history = [];
	this.round = 0;
	window.draws.push(this);
	this.start = false;
}

Draw.prototype = {
	generateDraw: function(count) {
		if (count) {
			this.count = count;
		}

		var wp = $('.drawWrapper');
		wp.empty();
		for (var i = 0; i < this.count; i++) {
			var div = $('<div class="number"><div class="name"></div></div>');
			wp.append(div);
		}
	},
	startDraw: function() {
		this.round++;
		$('.round-counter').text('Round ' + this.round);
		this.start = true;

	},
	stopDraw: function() {
		this.start = false;

		if (this.useData) {
			for (var i = 0; i < this.selected.length; i++) {
				var item = this.selected[i];
				for (var j = 0; j < this.data.length; j++) {
					var t = this.data[j];
					if (t.eID == item.eID) {
						this.data.splice(j, 1);
						break;
					}
				}
			}
			this.history[this.round - 1] = this.selected;
		}

		// TODO: Remove the winner from the list.
	},
	getId: function() {
		if (this.useData) {
			var num = $('.number');
			this.selected = [];
			if (this.data.length < this.count) {
				return;
			}
			for (var i = 0; i < this.count; i++) {
				var idx = Math.floor(Math.random() * this.data.length);
				var obj = this.data[idx];
				// If it is in the list?
				var duplicated = false;
				for (var j = 0; j < this.selected.length; j++) {
					var item = this.selected[j];
					if (item.eID == obj.eID) {
						duplicated = true;
						break;
					}
				}
				if (duplicated) {
					i--;
				} else {
					num.eq(i).html(obj.eID + '<div class="name">' + obj.eName + '</div></div>');
					this.selected.push(obj);
				}
			}
		} else {
			var c = 0;
			while (c < this.count) {
				var num = Math.floor(Math.random() * 100);
				if (num > 99) {
					num = 99;
				}
				var exclude = false;
				for (var i = 0; i < this.numExclude.length; i++) {
					if (num == this.numExclude[i]) {
						exclude = true;
						break;
					}
				}
				if (!exclude) {
					var ch = num;
					if (num < 10) {
						ch = '0' + ch;
					}
					$('.number:eq(' + c + ')').text(ch);
					c++;
				}
			}
		}
	}
}