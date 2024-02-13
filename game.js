// Конфігурація гри Phaser
var config = {
    type: Phaser.AUTO,
    // Ширина вікна гри
    width: 800,
    // Висота вікна гри
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            // Гравітація у напрямку y
            gravity: { y: 300 },
            debug: false
        }
    },

    scene: {
        // Функція завантаження ресурсів
        preload: preload,
        // Функція створення об'єктів гри
        create: create,
        // Функція оновлення стану гри
        update: update
    }
};

// Глобальні змінні для гравця, зірок, бомб, платформ, курсорів, рахунку та статусу гри
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

// Завантаження ресурсів перед початком гри
function preload ()
{
    // Завантаження зображень та спрайтів гравця
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

// Створення елементів гри
function create ()
{
    // Додавання зображення неба
    this.add.image(400, 300, 'sky');

    //зображення неба
        platforms = this.physics.add.staticGroup();

         // Створення статичних платформ
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

    // Створення гравця та анімацій для його рухів
        player = this.physics.add.sprite(100, 450, 'dude');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })

         // Додавання колізій між гравцем та платформами
        this.physics.add.collider(player, platforms);
        cursors = this.input.keyboard.createCursorKeys();

        // Створення груп зірок
        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        // Створення групи бомб
        bombs = this.physics.add.group();

        // Додавання тексту рахунку
        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '55px', fill: '#000' });

        
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);

        // Додавання обробника перекриття гравцем зірок
        this.physics.add.overlap(player, stars, collectStar, null, this);

        // Додавання обробника перекриття гравцем бомб
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        // Додавання прослуховувача подій клавіатури для натискання клавіші "Enter"
        this.input.keyboard.on('keydown-ENTER', restartGame, this);
    }

        
// Оновлення стану гри
function update() {

    // Перевірка, чи гра не завершилася
    if (gameOver) {
        return;
    }

    // Обробка натискання клавіш для руху гравця
    if (cursors.left.isDown)
        {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        // Обробка стрибка гравця
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }

        
}

// Обробка колізії між гравцем та зіркою
function collectStar(player, star) {

    // Деактивація зірки, збільшення рахунку
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    // Створення нової бомби та перевірка, чи всі зірки зібрано
    var x =(player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb. setVelocity(Phaser.Math.Between(-200, 200),20);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

    // Обробка колізії між гравцем та бомбою
    function hitBomb (player, bomb)
{
       // Пауза гри, забарвлення гравця, оголошення гри закінченою
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;

    
}


// Функція перезапуску гри
function restartGame() {
    // Перезапуск гри лише у випадку, якщо гра завершилася
    if (gameOver) {
        // Перезапуск гри
        this.scene.restart();
        
        // Скидання рахунку та статусу завершення гри
        score = 0;
        gameOver = false;
        
        // Оновлення відображення рахунку
        scoreText.setText('Score: ' + score);

        // Приховання вікна з повідомленням про кінець гри
        document.getElementById('gameOverWindow').style.display = 'none';
    }
}








    

