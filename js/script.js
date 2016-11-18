var config = {};

var frames = {};

function draw() {
	var canvas = document.getElementById("canvas");

	var context = canvas.getContext("2d");
	
	context.fillStyle = config.background.color;
	context.rect(0, 0, canvas.width, canvas.height);
	context.fill();
	
	drawPhone(canvas, context);
	
	drawText(canvas, context);
}

function drawPhone(canvas, context) {
	
	var frameWidth = config.frame.image.width;
	var frameHeight = config.frame.image.height;
	var scale = config.frame.scale;
	
	context.drawImage(
		config.frame.image,
		(canvas.width - frameWidth * scale) / 2,
		config.frame.position * canvas.height,
		frameWidth * scale,
		frameHeight * scale
	);
	
	
	if(config.screen.image != undefined) {
		context.drawImage(
			config.screen.image,
			(canvas.width - frameWidth * scale) / 2 + config.frame.screen.x * scale,
			config.frame.position * canvas.height + config.frame.screen.y * scale,
			config.frame.screen.width * scale,
			config.frame.screen.height * scale
		);
	}
}

function drawText(canvas, context) {
	context.fillStyle = config.text.color;
	context.textAlign = "center";
	context.textBaseline = 'middle';

	context.font=""+config.text.size+"px "+config.text.font;
	
	var centerX = canvas.width / 2;
	var lineY = canvas.height * config.text.position;
	
	var lines = config.text.text.split("\n");
	
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		context.fillText(line, centerX, lineY);
		lineY += config.text.size * config.text.interline;
	}
}

function onUpdateCanvas() {
	var dimm = $('#canvas-size').val();
	var dimms = dimm.split('x');
	updateCanvas(dimms[0], dimms[1]);
}

function updateCanvas(width, height) {
	var container = $('#container');
	var canvas = $('#canvas');
	canvas.attr('width', width);
	canvas.attr('height', height);
	
	if (width > container.width()) {
		canvas.css('width', container.width());
		canvas.css('height', height * (container.width() / width));
	} else if (width < container.width()) {
		canvas.css('width', width+'px');
		canvas.css('height', height+'px');
	}
}

function onChangeFrame() {
	var device = $('#frame-device').val();
	
	var frame = frames[device];
	
	
	loadImage(frame.src, function(image) {
		config.frame.screen = frame.screen;
		config.frame.image = image;
		
		draw();
	});
}

function onChangeScreen() {
	var file = $('#screen-file')[0].files[0];
	
	if (file != undefined) {
		var src = URL.createObjectURL(file);
		loadImage(src, function(image) {
			config.screen.image = image;
			draw();
		});
	}
}

function loadImage(src, onSuccess) {
	var image = new Image();
	image.src = src;
	image.onload = function() {
		onSuccess(image);
	}
}

function loadFrames() {
	$.getJSON('frames/frames.json', function(data) {
		frames = data.frames;
		
		var select = $('#frame-device');
		$.each(frames, function( key, val ) {
			var option = $('<option></option>');
			option.attr('value', key);
			option.text(val.name);
			select.append(option);
		});
		
		select.find('option').eq(0).attr('selected', 'selected');
		
		loadConfig();
		
		appendListeners();
	}).fail(function(jqxhr, textStatus, error) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	});
}

function loadConfig() {
	config.background = {};
	config.background.color = $('#background-color').val();
	
	config.text = {};
	config.text.text = $('#text').val();
	config.text.position = $('#text-position').val();
	config.text.color = $('#text-color').val();
	config.text.font = $('#text-font').val();
	config.text.size = $('#text-size').val();
	config.text.interline = $('#text-interline').val();
	
	config.frame = {};
	config.frame.screen = {};
	config.frame.position = $('#frame-position').val();
	config.frame.scale = $('#frame-scale').val();
	
	config.screen = {};
	
	onUpdateCanvas();
	onChangeFrame();
	onChangeScreen();
}

function appendListeners() {
	$('#text-size').on("change mousemove", function() {
		config.text.size = $(this).val();
		draw();
	});
	
	$('#text-interline').on("change mousemove", function() {
		config.text.interline = $(this).val();
		draw();
	});
	
	$('#text-position').on("change mousemove", function() {
		config.text.position = $(this).val();
		draw();
	});
	
	$('#frame-position').on("change mousemove", function() {
		config.frame.position = $(this).val();
		draw();
	});
	
	$('#frame-scale').on("change mousemove", function() {
		config.frame.scale = $(this).val();
		draw();
	});
	
	$('#text-color').change(function() {
		config.text.color = $(this).val();
		draw();
	});
	
	$('#background-color').change(function() {
		config.background.color = $(this).val();
		draw();
	});
	
	$('#text-font').change(function() {
		config.text.font = $(this).val();
		draw();
	});
	
	$('#canvas-size').change(function() {
		onUpdateCanvas();
		draw();
	});
	
	$('#screen-file').change(function() {
		onChangeScreen();
	});
	
	$('#frame-device').change(function() {
		onChangeFrame();
	});
	
	$('#text').keyup(function() {
		config.text.text = $(this).val();
		draw();
	});
	
	$(window).resize(function() {
		onUpdateCanvas();
		draw();
	});
	
	$('#download').click(function() {
		var canvas = $('#canvas')[0];
		var dt = canvas.toDataURL('image/png');
		this.href = dt;
	});
}
