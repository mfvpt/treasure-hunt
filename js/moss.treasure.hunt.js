//cria canvas no div
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'gameDiv', { preload: preload, create: create, update: update });

function preload() {

	//Carrega imagens
    game.load.tilemap('MOSS', 'assets/moss.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('moss-tile', 'assets/moss-tile.png');
    game.load.spritesheet('mossiano', 'assets/mossiano.png', 32, 48);
    game.load.image('background', 'assets/background.jpg');
	game.load.image('star', 'assets/star.png');

}
//Variáveis
var timeElapsed;
var gameMode = 1;
var gameStart;
var gameOverText;
var score = 0;
var scoreText;
var timeText;
var timer;
var map;
var tileset;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;

function create() {

	//timer para perceber o tempo gasto no jogo
	gameStart = game.time.now;

    game.stage.backgroundColor = '#000000';

	//background
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

	//carrega mapa
    map = game.add.tilemap('MOSS');
    map.addTilesetImage('moss-tile');
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    layer = map.createLayer('MOSS');
    layer.resizeWorld();

	//Campos de Texto: pontuação e tempo gasto
	scoreText = game.add.text(16, 16, 'Score: 0', { font: "22px Arial", fill: "#ffffff", align: "left" });
	scoreText.fixedToCamera = true;
	timeText = game.add.text(660, 16, 'Time:  0s', { font: "20px Arial", fill: "#ffffff", align: "left" });
	timeText.fixedToCamera = true;
		
		
    game.physics.gravity.y = 250;
    game.physics.setBoundsToWorld();

	//Adiciona Super Carlos
    player = game.add.sprite(350, 400, 'mossiano');
    player.body.bounce.y = 0.2;
    player.body.minVelocity.y = 5;
    player.body.collideWorldBounds = true;
    player.body.setRectangle(16, 32, 8, 16);
	//movimentos do herói
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
	//modo segue herói
    game.camera.follow(player);

	//salta-se com o espaço
    cursors = game.input.keyboard.createCursorKeys();
    //jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
	
	//Estrelas MOSS
	stars = game.add.group();
	
	for (var i = 0; i < 10; i++)
	{
		//Espaçadas por 83 pixeis
		var star = stars.create(i * 83, 0, 'star');
		star.body.gravity.y = 6;
		star.body.bounce.y = 0.7 + Math.random() * 0.2;
	}
	
	//Texto para GameOver
	gameOverText = game.add.text(90, 250, '', { font: '60px Arial', fill: '#ffffff', align: 'center' });
	gameOverText.fixedToCamera = true;
	
	//alinha na página
	this.game.stage.scale.pageAlignHorizontally = true;
	this.game.stage.scale.pageAlignVeritcally = true;
	this.game.stage.scale.refresh();

}

function update() {

	//física
	game.physics.collide(player, layer);		
	game.physics.collide(stars, layer);		
	game.physics.overlap(player, stars, collectStar, null, this);
	player.body.velocity.x = 0;

	//a jogar
	if (gameMode == 1) {
		//tempo gasto
		timeElapsed = (game.time.elapsedSince(gameStart)/1000).toFixed(2);
		timeText.content = 'Time: ' + timeElapsed + 's';
		
		//teclas
		if (cursors.left.isDown)
		{
			player.body.velocity.x = -150;

			if (facing != 'left')
			{
				player.animations.play('left');
				facing = 'left';
			}
		}
		else if (cursors.right.isDown)
		{
			player.body.velocity.x = 150;

			if (facing != 'right')
			{
				player.animations.play('right');
				facing = 'right';
			}
		}
		else
		{
			if (facing != 'idle')
			{
				player.animations.stop();

				player.frame = 4;
				
				facing = 'idle';
			}
		}
		//saltar
		if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
		{
			player.body.velocity.y = -250;
			jumpTimer = game.time.now + 750;
		}
	//gameOver
	}else if (gameMode == 2){
		gameOverText.content = 'Congratulations!\nYou Mastered MOSS\n in ' + timeElapsed + 's';
		//Fim
		gameMode=3;
	} 
}

function collectStar (player, star) {

	//apaga estrela MOSS
	star.kill();
	//incrementa pontuação
	score += 10;
	scoreText.content = 'Score: ' + score;
	
		if (score == 100) {
			gameOver();
		}
	
}

function gameOver () {
	gameMode = 2;
	player.animations.stop();
	player.frame = 4;
}