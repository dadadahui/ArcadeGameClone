var GAME_ON = '0'
var GAME_OFF = '1'

var SCORE_OFFSET = 10

var BLOCKWIDTH = 101
var BLOCKHEIGHT = 83

var CANVASWIDTH = 101 * 5

var Game = function (countdown) {
  this.state = GAME_OFF
  this.countdown = countdown || 20
}

Game.prototype.resetGame = function () {
  player.reset()
}

// 这是我们的玩家要躲避的敌人
var Enemy = function (x, y, speed) {
  this.x = x
  this.y = y
  this.speed = speed || Math.random() * (100, 200)
  this.sprite = 'images/enemy-bug.png'
}

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function (dt) {
  // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
  // 都是以同样的速度运行的
  this.x += this.speed * dt
  if (this.x > CANVASWIDTH) {
    this.x = 0
  }
  this.collision(player)
}

// 此为游戏必须的函数，用来在屏幕上画出敌人
Enemy.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
}

Enemy.prototype.collision = function (player) {
  //碰撞检测
  if (this.y == player.y && Math.abs(player.x - this.x) < 50) {
    player.reset()
    player.score -= SCORE_OFFSET
    player.lives--
  }
}

// 现在实现你自己的玩家类
var Player = function (x, y, sprite) {
  this.x = x || BLOCKWIDTH * 2
  this.y = y || BLOCKHEIGHT * 3 + 55
  this.sprite = sprite || 'images/char-boy.png'
  this.score = 0
  this.lives = 3
}

Player.prototype.isArrived = function () {
  return this.y <= 54
}

Player.prototype.renderBoard = function () {
  ctx.fillStyle = '#525c65'
  ctx.fillRect(0, 0, 505, 50)

  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#000'
  ctx.font = '16px serif'
  ctx.strokeText(`SCORE：${this.score}`, 10, 33)
  ctx.strokeText(`LIVES：${this.lives}`, 150, 33)
  ctx.strokeText(`COUNTDOWN：${game.countdown}`, 250, 33)

}

// 这些更新函数应该只聚焦于更新和对象相关的数据/属性。把重绘的工作交给 render 函数。
Player.prototype.update = function () {

}

Player.prototype.reset = function () {
  this.x = BLOCKWIDTH * 2

  this.y = BLOCKHEIGHT * 3 + 55
}

Player.prototype.render = function () {
  this.renderBoard()
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
}
Player.prototype.handleInput = function (movement) {
  switch (movement) {

    case 'left':
      if (this.x > 0) {
        this.x -= BLOCKWIDTH
      }
      break
    case 'right':
      if (this.x < 404) {
        this.x += BLOCKWIDTH
      }
      break
    case 'up':
      if (this.y > 54) {
        this.y -= BLOCKHEIGHT
        if (this.isArrived()) {
          this.score += SCORE_OFFSET
          setTimeout(function () {
            game.resetGame()
          }, 500)
        }
      }
      break
    case 'down':
      if (this.y < 350) {
        this.y += BLOCKHEIGHT
      }
      break
  }
}


var game = new Game()
var player = new Player()
var enemy1 = new Enemy(0, BLOCKHEIGHT * 0 + 55)
var enemy2 = new Enemy(0, BLOCKHEIGHT * 1 + 55)
var enemy3 = new Enemy(0, BLOCKHEIGHT * 2 + 55)
var allEnemies = [enemy1,enemy2,enemy3]
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  }

  player.handleInput(allowedKeys[e.keyCode])
})