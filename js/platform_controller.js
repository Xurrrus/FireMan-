var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game_area',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 0}, // normalment a 300
			debug: false
		}
	},
    scene: [ PlatformScene, escena_pausa ]
};

var game = new Phaser.Game(config);