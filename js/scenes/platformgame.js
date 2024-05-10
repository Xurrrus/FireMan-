"use strict";


var pausat = -1;


var partida = null;

if (localStorage.sav){
    let arrayPartides = JSON.parse(localStorage.sav);
    partida = arrayPartides;
	localStorage.removeItem("sav")
	console.log(partida);
}

if (sessionStorage.idPartida && localStorage.sav2){
    let arrayPartides = JSON.parse(localStorage.sav2);
    if (sessionStorage.idPartida < arrayPartides.length)
        partida = arrayPartides[sessionStorage.idPartida];
	sessionStorage.clear()	
}


class PlatformScene extends Phaser.Scene {
    constructor (){
	
          super('PlatformScene');
		  this.platforms = null;
	      this.player = null;

		  this.fons = null;
		  this.newfons = null;

	      this.cursors = null;
	  	  this.stars = null;
		 
		  this.scoreText;
		  
		  this.kilometresText;
		  this.comptador = 1;

		  this.gasolines = null;
		  this.cotxes = null;
	 	  this.balles = null;
		  this.bassals = null;
		  this.edificis = null;
		  this.lliscar = false;
		  

		  this.gameOver = false;
		  //si venim d'un save carreguem kilometres i gasolina, sinó donem valor per defecte
		  if(partida){

			this.kilometres = partida.km;
			this.score = partida.gasolina;
			this.numEdificis = partida.numEdificis;

		  }
		  else{

			this.kilometres = 0;
			this.score = 100;
			this.numEdificis = 0;
		  }
		
    }
    preload (){
		//this.load.image('sky', '../resources/starsassets/carretera.png');
		this.load.image('ground', '../resources/starsassets/platform.png');
		this.load.image('star', '../resources/starsassets/star.png');
		this.load.image('bomb', '../resources/starsassets/bomb.png');
		this.load.image('fons', '../resources/starsassets/carretera2.png');
		this.load.image('balla', '../resources/starsassets/balla.png');
		this.load.image('bassal', '../resources/starsassets/bassal.png');
		this.load.image('gasolina', '../resources/starsassets/gas.png');
		this.load.image('edifici', '../resources/starsassets/edifici.png');

		//Load totes les imatges de cada cotxe
		this.load.image('cotxe1', '../resources/starsassets/cotxe1.png');
		this.load.image('cotxe2', '../resources/starsassets/cotxe2.png');
		this.load.image('cotxe3', '../resources/starsassets/cotxe3.png');
		this.load.image('cotxe4', '../resources/starsassets/cotxe4.png');
		this.load.image('cotxe5', '../resources/starsassets/cotxe5.png');
		this.load.image('cotxe6', '../resources/starsassets/cotxe6.png');

		this.load.spritesheet('dude',
			'../resources/starsassets/camio.png',
			{ frameWidth: 77, frameHeight: 175 }
		);
	}

    create (){

		{
			this.fons = this.physics.add.group();
			this.newfons = this.fons.create(400, 250, 'fons');
			this.newfons.setVelocityY(300);
		}
		{	// Creem player i definim animacions
			this.player = this.physics.add.sprite(468, 550, 'dude');
			//this.player.setBounce(0.2);
			//this.player = this.physics.add.staticGroup();
			this.player.setCollideWorldBounds(true);

			var button_pause = this.add.text(400, 550, 'Pause') //el botó de pause game, que és un text que s'activa al clickar a sobre.
				.setOrigin(0.5)
				.setPadding(10)
				.setStyle({ backgroundColor: '#111' })
				.setInteractive({ useHandCursor: true })
				.on('pointerdown', ()=>{
					pausat = 0;
					
				});

			this.anims.create({
				key: 'left',
				frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 1 }),
				frameRate: 10,
				repeat: -1
			});

			this.anims.create({
				key: 'turn',
				frames: [ { key: 'dude', frame: 2 } ],
				frameRate: 20
			});

			this.anims.create({
				key: 'right',
				frames: this.anims.generateFrameNumbers('dude', { start: 3, end: 4 }),
				frameRate: 10,
				repeat: -1
			});
		}
		{
			this.balles = this.physics.add.group();
			setTimeout(()=>this.createBalla(), 10000);
			this.bassals = this.physics.add.group();
			setTimeout(()=>this.createBassal(), 6000);
		}
		{
			this.gasolines = this.physics.add.group();
			setTimeout(()=>this.createGasolina(), 32000);
			setTimeout(()=>this.reduirGasolina(), 2000);
		}
		{
			this.edificis = this.physics.add.group();
			setTimeout(()=>this.createEdifici(), 6000); //es crea edifici als 60 segons

		}
			this.cotxes = this.physics.add.group(); // Grup d'enemics
			setTimeout(()=>this.createCotxe(), 1000);
		{	// Definim les col·lisions i interaccions
			this.physics.add.collider(this.player, this.platforms);
			//this.physics.add.collider(this.stars, this.platforms);
			this.cursors = this.input.keyboard.createCursorKeys();
			this.physics.add.overlap(this.player, this.gasolines,
				(body1, body2)=>this.collectGasolina(body1, body2));
			this.physics.add.collider(this.cotxes, this.platforms);
			this.physics.add.collider(this.player, this.cotxes, 
				(body1, body2)=>this.hitCotxe(body1, body2));
			//JUGADOR AMB BALLES
			this.physics.add.collider(this.player, this.balles, 
				(body1, body2)=>this.hitCotxe(body1, body2));
			//COTXES AMB BALLES
			this.physics.add.collider(this.cotxes, this.balles, 
				(body1, body2)=>this.hitBallaCotxe(body1, body2));
			this.physics.add.collider(this.cotxes, this.platforms);
			this.physics.add.collider(this.player, this.cotxes,
				(body1, body2)=>this.hitCotxe(body1, body2));
			//JUGADOR AMB BALLES
			this.physics.add.collider(this.player, this.balles,
				(body1, body2)=>this.hitCotxe(body1, body2));
			//Cotxes AMB BALLES
			this.physics.add.collider(this.cotxes, this.balles,
				(body1, body2)=>this.hitBallaCotxe(body1, body2));
			//JUGADOR AMB BASSALS
			this.physics.add.collider(this.player, this.bassals,
				(body1, body2)=>this.hitJugBassal(body1, body2));
			//BASSALS AMB COTXES
			this.physics.add.collider(this.cotxes, this.bassals, 
				(body1, body2)=>this.hitCotxeBassal(body1, body2));
			//PLAYER AMB EDIFICIS
			this.physics.add.collider(this.player, this.edificis, 
				(body1, body2)=>this.hitEdifici(body1, body2));
		}
		{ // UI
			this.scoreText = this.add.text(16, 16, 'Gasolina: 100',
				{ fontSize: '32px', fill: '#000' });
			this.kilometresText = this.add.text(16, 50, 'Metres: 0',
				{ fontSize: '32px', fill: '#000' });

			this.afegirKilometres();
		}
	}
	update (){
		if (this.gameOver) return;
		{ // Moviment
			if (this.cursors.left.isDown){
				if(this.player.x > 150){
					this.player.setVelocityX(-160);
				}
				else this.player.setVelocityX(0);
				//this.player.anims.play('left', true);
			}
			else if (this.cursors.right.isDown){
				if(this.player.x < 660){
					this.player.setVelocityX(160);
				}
				else this.player.setVelocityX(0);
				//this.player.anims.play('right', true);
			}
			else{
				this.player.setVelocityX(0);
				//this.player.anims.play('turn');
			}

			if (this.cursors.up.isDown && this.lliscar == false){

				this.player.setVelocityY(-160);
			}
			else if (this.cursors.down.isDown){
				this.player.setVelocityY(160);
			}
			else if(this.lliscar == false){
				this.player.setVelocityY(0);
			}
			if(this.newfons.y == 650){
				this.newfons.y = 0;
			}
			if(pausat === 0){ //si hem pausat es para l'escena i llançem la de pausa
				this.scene.pause();
				this.scene.launch('escena_pausa');
				
			}
			
		}
	}
	collectGasolina(player, gasolina){

		gasolina.disableBody(true, true);
		this.score = 100;
		this.comptador -= 0.1;
		this.scoreText.setText('Gasolina: ' + this.score);
	}
	reduirGasolina(){
		if (this.gameOver) return;
	  if(pausat === -1){	
		if(this.score > 0){
			this.score -= 1;
			setTimeout(()=>this.reduirGasolina(), 800*this.comptador); //reduim cada vegada més la gasolina
			this.scoreText.setText('Gasolina: ' + this.score);
		}
		else{
			this.hitCotxe(null, null);
		}
	  }
	}
	createFons(){
		this.newfons = this.fons.create(400, -400, 'fons');
		this.newfons.setVelocityY(300);
	}
	createBalla(){	   	
	  if(pausat === -1){	
		var pos = Phaser.Math.Between(0, 3);
		var balla;
		var posX = 596;
		if(pos < 1) posX = 214;
		else if(pos < 2) posX = 341;
		else if(pos < 3) posX = 468;//per a no crear una tanca en el mateix lloc on haviem creat una

		balla = this.balles.create(posX, 0, 'balla').setScale(.65).refreshBody();
		balla.setVelocity(0, 300);
		setTimeout(()=>this.createBalla(), 10000);
	  }
	}
	createBassal(){
	  if(pausat === -1){
		var posX = Phaser.Math.Between(214, 596);
		var bassal;

		bassal = this.bassals.create(posX, 0, 'bassal').setScale(.2).refreshBody();
		bassal.setVelocity(0, 300);
		setTimeout(()=>this.createBassal(), 10000);
	  }
	}
	createGasolina(){
	  if(pausat === -1){
		var posX = Phaser.Math.Between(214, 596);
		var gasolina;

		gasolina = this.gasolines.create(posX, 0, 'gasolina').setScale(.08).refreshBody();
		gasolina.setVelocity(0, 300);
		setTimeout(()=>this.createGasolina(), 30000);
	  }
	}

	createCotxe() {
		if (pausat === -1) {

			var pos = Phaser.Math.Between(0, 3);
			var randomimatge = Phaser.Math.Between(0, 2);
			var imatge;
			var cotxe;
			if (pos < 2) {
				if (randomimatge == 0) imatge = 'cotxe1';
				else if (randomimatge == 1) imatge = 'cotxe2';
				else imatge = 'cotxe3';
			} else {
				if (randomimatge == 0) imatge = 'cotxe4';
				else if (randomimatge == 1) imatge = 'cotxe5';
				else imatge = 'cotxe6';
			}


			if (pos < 1) {
				cotxe = this.cotxes.create(214, 0, imatge).setScale(.4).refreshBody();
				;
				cotxe.setVelocity(0, 600);
			} else if (pos < 2) {
				cotxe = this.cotxes.create(341, 0, imatge).setScale(.4).refreshBody();
				;
				cotxe.setVelocity(0, 600);
			} else if (pos < 3) {
				cotxe = this.cotxes.create(468, 0, imatge).setScale(.4).refreshBody();
				;
				cotxe.setVelocity(0, 200);
			} else {
				cotxe = this.cotxes.create(596, 0, imatge).setScale(.4).refreshBody();
				;
				cotxe.setVelocity(0, 200);
			}

			setTimeout(() => this.createCotxe(), 2000);
		}
	}
	hitCotxe(player, cotxe){
		if (this.gameOver)
			return;
		this.physics.pause();
		this.player.setTint(0xff0000);
		//this.player.anims.play('turn');
		this.gameOver = true;
		setTimeout(()=>loadpage("../"), 3000);
	}
	hitBallaCotxe(balla, cotxe){
		balla.setVelocityY(300);
		cotxe.setVelocityY(300);
	}
	hitCotxeBassal(cotxe, bassal){
		bassal.disableBody(true, true);
	}
	hitJugBassal(player, bassal){
		this.lliscar = true;
		player.setVelocityY(160);
		setTimeout(()=>this.restablirVel(), 2000);
		bassal.disableBody(true, true);
	}
	restablirVel(){
		this.lliscar = false;
		this.player.setVelocityY(300);
	}
	enableAllStars(){
		this.stars.children.iterate(child =>
			child.enableBody(true, child.x, 0, true, true));
	}
	afegirKilometres() {
		if (pausat === -1) {
			if (this.gameOver) return;
			this.kilometres += 1;
			//else {
			setTimeout(() => this.afegirKilometres(), 50);
			this.kilometresText.setText('Metres: ' + this.kilometres);
			//}
		}
	}
	createEdifici(){
		if (pausat === -1) {
			var pos = Phaser.Math.Between(0, 3);
			var edifici;
			var posX = 596;
			if (pos < 1) posX = 214;
			else if (pos < 2) posX = 341;
			else if (pos < 3) posX = 468;

			edifici = this.edificis.create(posX, 0, 'edifici').setScale(.65).refreshBody();
			edifici.setVelocity(0, 300);
			setTimeout(() => this.createEdifici(), 60000);
		}
	}
	hitEdifici(player, edifici){
		edifici.disableBody(true, true);
		this.numEdificis+=1;

		let guardar = {
			gasolina :this.score,
			km :this.kilometres,
			numEdificis: this.numEdificis
				  };

		localStorage.sav = JSON.stringify(guardar);
		if(this.numEdificis < 2)
			loadpage("../html/platform2.html");
		else
			loadpage("../html/youwin.html")		  
	}


}

var escena_pausa = new Phaser.Class({

	Extends: Phaser.Scene,

	initialize:

		function escena_pausa ()
		{
			Phaser.Scene.call(this, { key: 'escena_pausa' });
		},

	preload: function ()
	{
		this.load.image('fons_pausa', '../resources/starsassets/click.png');
	},

	create: function ()
	{
		this.fondo = this.add.image(400, 300, 'fons_pausa').setAlpha(1);
		var button_save = this.add.text(400, 550, 'Save') //el botó de save game, que és un text que s'activa al clickar a sobre.
				.setOrigin(0.5)
				.setPadding(10)
				.setStyle({ backgroundColor: '#111' })
				.setInteractive({ useHandCursor: true })
				.on('pointerdown', ()=>{
					var escena_principal = this.scene.get('PlatformScene')
					let guardar = {
						gasolina :escena_principal.score,
						km :escena_principal.kilometres,
						numEdificis: escena_principal.numEdificis
							  };//guardem els atributs que ens interessa
					let array_saves = [];
					if (localStorage.sav2){ //si ja hi havia alguna partida guardada s'ha de recuperar la array i guardar la nova partida en ella
						array_saves = JSON.parse(localStorage.sav2);
						if(!Array.isArray(array_saves)) array_saves = [];
					}
					array_saves.push(guardar);//guardem
					localStorage.sav2 = JSON.stringify(array_saves);
					loadpage("../index.html");//retornem al index.html
			
				});

		this.input.once('pointerdown', function () {

			pausat = -1; //ara podem tornar a executar els mètodes de creació
			var escena_principal = this.scene.get('PlatformScene') //agafem escena principal del joc
			escena_principal.reduirGasolina();
			escena_principal.afegirKilometres();
			escena_principal.createCotxe();//executem pq es redueixi gasolina, augmentin kilometres i apareixin cotxes de nou.
			this.scene.resume('PlatformScene');
			this.fondo.destroy();
			button_save.destroy(); //destruim boto de save i la imatge de fons

		}, this);
	}

});