/* Engine.js
 * 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出初始的游戏面板，然后调用玩家和敌人对象的 update / render 函数（在 app.js 中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕，和小时候你们做的 flipbook 有点像。当
 * 玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。但这都是表面现象。实际上是整个屏幕
 * 被重绘导致这样的动画产生的假象

 * 这个引擎使画布的上下文(CTX)对象全局可用，从而使编写app.js更加简单。
 */

var Engine = (function (global) {
  /* 实现定义我们会在这个作用域用到的变量
   * 创建 canvas 元素，拿到对应的 2D 上下文
   * 设置 canvas 元素的高/宽 然后添加到dom中
   */
  var doc = global.document,
    win = global.window,
    canvas = doc.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    lastTime

  canvas.width = 505
  canvas.height = 606
  doc.body.appendChild(canvas)

  /* 这个函数是整个游戏的主入口，负责适当的调用 update / render 函数 */
  function main () {
    if (game.state === GAME_ON) {
      var now = Date.now(),
        dt = (now - lastTime) / 1000.0

      update(dt)
      render()

      lastTime = now




      win.requestAnimationFrame(main)
    } else if (game.state === GAME_OFF) {
    }

  }

  /* 这个函数调用一些初始化工作，特别是设置游戏必须的 lastTime 变量，这些工作只用
   * 做一次就够了
   */
  function init () {
    startScreen()
    reset()
    lastTime = Date.now()
    main()
  }

  /* 这个函数被 main 函数（我们的游戏主循环）调用，它本身调用所有的需要更新游戏角色
   * 数据的函数，取决于你怎样实现碰撞检测（意思是如何检测两个角色占据了同一个位置，
   * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
   * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
   */
  function update (dt, now) {
    updateEntities(dt)
  }

  function updateEntities (dt) {
    allEnemies.forEach(function (enemy) {
      enemy.update(dt)
    })
    player.update()

  }

  function render () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    var rowImages = [
        'images/water-block.png',   // 这一行是河。
        'images/stone-block.png',   // 第一行石头
        'images/stone-block.png',   // 第二行石头
        'images/stone-block.png',   // 第三行石头
        'images/grass-block.png',   // 第一行草地
        'images/grass-block.png'    // 第二行草地
      ],
      numRows = 6,
      numCols = 5,
      row, col

    for (row = 0; row < numRows; row++) {
      for (col = 0; col < numCols; col++) {
        /* 这个 canvas 上下文的 drawImage 函数需要三个参数，第一个是需要绘制的图片
         * 第二个和第三个分别是起始点的x和y坐标。我们用我们事先写好的资源管理工具来获取
         * 我们需要的图片，这样我们可以享受缓存图片的好处，因为我们会反复的用到这些图片
         */
        ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83)
      }
    }

    renderEntities()

    if (player.lives < 0 || (game.countdown == 0 && player.score < 50)) {
      renderGameOver()
      setTimeout(function () {
        init()
      }, 2000)
    }

    //固定时间内 达到指定分数 并且还没死 ，就赢了~
    if (player.lives >= 0 && player.score >= 20 && game.countdown == 0){
      renderGameWin()
    }
  }

  function renderEntities () {
    /* 遍历在 allEnemies 数组中存放的作于对象然后调用你事先定义的 render 函数 */
    allEnemies.forEach(function (enemy) {
      enemy.render()
    })

    player.render()
  }

  /* 这个函数现在没干任何事，但是这会是一个好地方让你来处理游戏重置的逻辑。可能是一个
   * 从新开始游戏的按钮，也可以是一个游戏结束的画面，或者其它类似的设计。它只会被 init()
   * 函数调用一次。
   */
  function reset () {
    // 空操作

    player.score = 0
    player.lives = 3
    game.countdown = 20
  }

  function startScreen () {

    var roles = [
      'images/char-boy.png',
      'images/char-cat-girl.png',
      'images/char-horn-girl.png',
      'images/char-pink-girl.png',
      'images/char-princess-girl.png'
    ]

    function handleInput (e) {
      var allowedKeys = {
        49: 1,
        50: 2,
        51: 3,
        52: 4,
        53: 5
      }
      var choice = allowedKeys[e.keyCode]
      //对key做判断，不然会误按
      if (choice > 0 && choice < 6) {
        player.sprite = roles[choice - 1]
        game.state = GAME_ON

        clearInterval(timer)
        var timer = setInterval(function () {
          if (game.countdown > 0) {
            game.countdown--
          }
        }, 1000)

        document.removeEventListener('keyup', handleInput)
        main()
      }

    }

    ctx.font = '20px bold'

    //背景
    ctx.fillStyle = '#525c65'
    ctx.rect(0, 50, canvas.width, canvas.height - 50)
    ctx.fill()

    // 画5个角色
    for (let i = 0; i < roles.length; i++) {
      ctx.drawImage(Resources.get(roles[i]), (canvas.width / roles.length) * i, 200)
      ctx.fillStyle = 'tomato'
      ctx.fillText(i + 1, (canvas.width / roles.length) * i + 50, 380)
    }

    ctx.fillStyle = '#fff'
    ctx.font = '22px yahei'
    ctx.fillText('press key (1-5) to choose a player', 80, 500)

    document.addEventListener('keyup', handleInput)

  }

  function renderGameOver () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = '#525C65'
    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fill()
    ctx.fillStyle = '#F5A623'
    ctx.font = '40px microsoft yahei'
    ctx.fillText('GAME OVER', 130, 250)
    ctx.font = '20px microsoft yahei'
    ctx.fillStyle = '#4de84d'
    ctx.fillText(`SCORE : ${player.score}`, 200, 350)
    game.state = GAME_OFF

  }

  function renderGameWin () {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.fillStyle = '#525C65'
    ctx.rect(0, 0, canvas.width, canvas.height)
    ctx.fill()
    ctx.fillStyle = '#F5A623'
    ctx.font = '40px microsoft yahei'
    ctx.fillText('YOU WIN !', 130, 250)
    ctx.font = '20px microsoft yahei'
    ctx.fillStyle = '#4de84d'
    ctx.fillText(`SCORE : ${player.score}`, 200, 350)
    game.state = GAME_OFF

  }
  Resources.load([
    'images/stone-block.png',
    'images/water-block.png',
    'images/grass-block.png',
    'images/enemy-bug.png',

    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png',

    'images/Gem Blue.png',
    'images/Gem Green.png',
    'images/Gem Orange.png'
  ])

  Resources.onReady(init)

  /* 把 canvas 上下文对象绑定在 global 全局变量上（在浏览器运行的时候就是 window
   * 对象。从而开发者就可以在他们的app.js文件里面更容易的使用它。
   */
  global.ctx = ctx
})(this)
