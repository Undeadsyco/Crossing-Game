
// create scene
let gameScene = new Phaser.Scene('Game');

// initiate scene peramiters
gameScene.init = function () {
  // player speed
  this.playerSpeed = 5

  // enemy speed
  this.enemyMinSpeed = 2
  this.enemyMaxSpeed = 4.5

  //boundries
  this.enemyMinY = 80;
  this.enemyMaxY = 280;

  this.isEnding = false
}

// load assets
gameScene.preload = function () {
  // load background
  this.load.image('background', 'assets/background.png')
  this.load.image('player', 'assets/player.png')
  this.load.image('enemy', 'assets/dragon.png')
  this.load.image('goal', 'assets/treasure.png')
  this.load.image('path', 'assets/dirtpath.png')
}

// called after preload ends 
gameScene.create = function () {
  // create bg sprite
  let bg = this.add.sprite(0, 0, 'background')

  // change origin of bg sprite to top-left corner
  bg.setOrigin(0, 0)

  // create player sprite
  this.player = this.add.sprite(30, this.sys.game.config.height / 2, 'player')
  // player.depth = 1 controls depth of sprite
  this.player.setScale(0.25) // set player sprite scale
  this.player.depth = 1

  // goal sprate
  this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goal')
  this.goal.setScale(0.4)

  //pathway sprite
  this.path = this.add.sprite(80, this.sys.game.config.height/2, 'path')
  this.path.setScale(1, 0.7)

  this.pathways = this.add.group({
    key: 'path',
    repeat: 8,
    setXY: {
      x: 80,
      y: this.sys.game.config.height/2,
      stepX: 50
    }
  })

  Phaser.Actions.ScaleXY(this.pathways.getChildren(), -0.1, -0.3)

  // create enemy sprite
  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 8,
    setXY: {
      x: 80,
      y: 100,
      stepX: 50,
      stepY: 20
    }
  })


  // set scale for group
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.6, -0.6)

  // set flipX prop & speed for group
  Phaser.Actions.Call(this.enemies.getChildren(), function (enemy) {
    // flip enemy
    enemy.flipX = true

    // set speed
    let dir = Math.random() < 0.5 ? 1 : -1
    let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed)
    enemy.speed = dir * speed


  }, this)
}

// called upto 60 times/sec
gameScene.update = function () {
  if(this.isEnding) return

  // check for avtive input
  // console.log(this.input.keyboard.addKey("RIGHT").isDown)
  if(this.input.keyboard.addKey("RIGHT").isDown){
    // player walks right
    this.player.x += (this.playerSpeed / 2)
  }
  if(this.input.keyboard.addKey("LEFT").isDown){
    // player walks left
    this.player.x -= (this.playerSpeed / 2)
  }
  if(this.input.keyboard.addKey("UP").isDown){
    // player walks up
    this.player.y -= (this.playerSpeed / 2)
  }
  if(this.input.keyboard.addKey("DOWN").isDown){
    // player walks
    this.player.y += (this.playerSpeed / 2)
  }
  if (this.input.activePointer.isDown) {
    // player walks
    this.player.x += (this.playerSpeed / 2)
  }

  // check if reached goal
  let playerArea = this.player.getBounds()
  let goalArea = this.goal.getBounds()

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerArea, goalArea)) {
    // restart scene
    return this.gameOver();
  }

  //get enemies
  let enemies = this.enemies.getChildren()
  let numberOfEnemies = enemies.length

  for (let i = 0; i < numberOfEnemies; i++) {
    //enemy movement
    enemies[i].y += enemies[i].speed

    // check for border colisions
    let colisionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY
    let colisionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY

    if (colisionUp || colisionDown) {
      enemies[i].speed *= -1
    }

    let enemyarea = enemies[i].getBounds()

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerArea, enemyarea)) {
      // restart scene
      return this.gameOver()
    }
  }
}

gameScene.gameOver = function() {
  // init game over sequence
  this.isEnding = true

  //shake camera
  this.cameras.main.shake(500)

  // listen for shake completion
  this.cameras.main.on('camerashakecomplete', function() {
    // fade out
    this.cameras.main.fade(1000)
  }, this)

  this.cameras.main.on('camerafadeoutcomplete', function() {
    this.scene.restart()
  }, this)
}

// set config of game
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
}

// create new game, pass config
let game = new Phaser.Game(config);