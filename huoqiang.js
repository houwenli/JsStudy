/**************************************************
 * HTML5 小游戏 - 火枪英雄
 * 从本人的一个HGE小游戏移植到HTML5版本
 * 作者：李广宇， 2014.8.2
 */
        var SCREEN_WIDTH = 640;
        var SCREEN_HEIGHT = 560;
        var REFRESH_TIME = 30;
        var DIR_DOWN = 0;
        var DIR_LEFT = 1;
        var DIR_RIGHT = 2;
        var DIR_UP = 3;
        var HERO_WIDTH = 32;
        var HERO_HEIGHT = 48;
        var HERO_FRAME_COUNT = 4;
        var HERO_BLOOD = 100;
        var HERO_MOVE_SPEED = 4;
        var HERO_BULLET_SPEED = 10;
        var HERO_BULLET_POWER = 20;
        var HERO_FIRE_DELAY = 5;
        var ENEMY_WIDTH = 32;
        var ENEMY_HEIGHT = 48;
        var ENEMY_FRAME_COUNT = 4;
        var ENEMY_BLOOD = 100;
        var ENEMY_BULLET_SPEED = 10;
        var ENEMY_BULLET_POWER = 10;
        var ENEMY_LEVEL_1_MOVE_SPEED = 1;
        var ENEMY_LEVEL_2_MOVE_SPEED = 2;
        var ENEMY_LEVEL_3_MOVE_SPEED = 3;
        var ENEMY_LEVEL_4_MOVE_SPEED = 4;
        var ENEMY_LEVEL_5_MOVE_SPEED = 5;
        var ENEMY_LEVEL_1_FIRE_DELAY = 9;
        var ENEMY_LEVEL_2_FIRE_DELAY = 8;
        var ENEMY_LEVEL_3_FIRE_DELAY = 7;
        var ENEMY_LEVEL_4_FIRE_DELAY = 6;
        var ENEMY_LEVEL_5_FIRE_DELAY = 5;
        var BULLET_WIDTH = 10;
        var BULLET_HEIGHT = 10;
        var BLAST_WIDTH = 50;
        var BLAST_HEIGHT = 50;
        var BLAST_FRAME_COUNT = 4;
        var SHADOW_WIDTH = 32;
        var SHADOW_HEIGHT = 20;
        var beforeGameImg;
		var beforeGameTextFlash = false;
		var beforeGameTextDelay = 10;
		var beforeGameTextDelayCounter = 0;
		var finishGameImg;
		var endGameImg;
		var nextLevelTextDelay = 20;
		var nextLevelTextDelayCounter = 0;
        var hero;
        var heroBullets;
        var heroImg;
        var heroBulletImg;
        var heroFireDelayCounter = 0;
        var enemys;
        var enemyBullets;
        var enemyBulletImg;
        var enemy_level_1_img;
        var enemy_level_2_img;
        var enemy_level_3_img;
        var enemy_level_4_img;
        var enemy_level_5_img;
        var blasts;
        var blastImg;
        var shadowImg;
        var level;
        var canvas;
        var context;
        var isKeyLeft = false;
        var isKeyRight = false;
        var isKeyUp = false;
        var isKeyDown = false;
        var isKeyFire = false;
        var timerId;
        var isPause = false;
        /**
         * 角色定义
         */
        function Role(x, y, width, height, dir, img, frameCount, blood, moveSpeed, bulletSpeed, fireDelay) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.dir = dir;
            this.img = img;
            this.frameCount = frameCount;
            this.blood = blood;
            this.moveSpeed = moveSpeed;
            this.bulletSpeed = bulletSpeed;
            this.fireDelay = fireDelay;
            this.curFrame = 0;
            this.drawX = this.curFrame * this.width;
            this.drawY = this.dir * this.height;
            this.isMoving = false;
            this.playDelay = 5;
            this.playDelayCounter = 0;
            this.StartMove = function () {
                this.isMoving = true;
            }
            this.StopMove = function () {
                this.isMoving = false;
            }
            this.Update = function () {
                if (this.isMoving) {
                    switch (this.dir) {
                        case DIR_LEFT: this.x -= this.moveSpeed; break;
                        case DIR_RIGHT: this.x += this.moveSpeed; break;
                        case DIR_UP: this.y -= this.moveSpeed; break;
                        case DIR_DOWN: this.y += this.moveSpeed; break;
                    }
                    if (this.x <= 0 || this.x >= SCREEN_WIDTH - this.width ||
                        this.y <= 0 || this.y >= SCREEN_HEIGHT - this.height) {
                        switch (this.dir) {
                            case DIR_LEFT: this.x += this.moveSpeed; break;
                            case DIR_RIGHT: this.x -= this.moveSpeed; break;
                            case DIR_UP: this.y += this.moveSpeed; break;
                            case DIR_DOWN: this.y -= this.moveSpeed; break;
                        }
                    }
                    // 动画
                    this.playDelayCounter++;
                    if (this.playDelayCounter == this.playDelay) {
                        this.curFrame++;
                        if (this.curFrame == this.frameCount) {
                            this.curFrame = 0;
                        }
                        this.playDelayCounter = 0;
                    }
                    this.drawX = this.curFrame * this.width;
                    this.drawY = this.dir * this.height;
                }
            }
        }
        /**
         * 子弹定义
         */
        function Bullet(x, y, width, height, dir, bulletSpeed) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.dir = dir;
            this.bulletSpeed = bulletSpeed;
            this.Update = function () {
                switch (this.dir) {
                    case DIR_LEFT: this.x -= this.bulletSpeed; break;
                    case DIR_RIGHT: this.x += this.bulletSpeed; break;
                    case DIR_UP: this.y -= this.bulletSpeed; break;
                    case DIR_DOWN: this.y += this.bulletSpeed; break;
                }
            }
        }
        /**
         * 爆炸动画定义
         */
        function Blast(x, y, width, height, frameCount) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.curFrame = 0;
            this.drawX = this.curFrame * this.width;
            this.drawY = 0;
            this.frameCount = frameCount;
            this.playDelay = 3;
            this.playDelayCounter = 0;
            this.Update = function(){
                if (this.curFrame < this.frameCount){
                    this.playDelayCounter++;
                    if (this.playDelayCounter == this.playDelay) {
                        this.curFrame++;
                        this.playDelayCounter = 0;
                    }
                    this.drawX = this.curFrame * this.width;
                    this.drawY = 0;
                }
            }
            this.IsEnd = function(){
                return this.curFrame == this.frameCount;
            }
        }
        /**
         * 游戏开始前界面
         */
        function BeforeGameFunc() {
            context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            context.fillStyle = "Black";
            context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            context.drawImage(beforeGameImg, (SCREEN_WIDTH - beforeGameImg.width) / 2, 150);
			beforeGameTextDelayCounter ++;
			if (beforeGameTextDelayCounter == beforeGameTextDelay)
			{
				beforeGameTextFlash = !beforeGameTextFlash;
				beforeGameTextDelayCounter = 0;
			}
			if (beforeGameTextFlash)
			{
				DrawTextInMiddle(context, "按Enter开始游戏", 350);
			}
        }
        /**
         *  结束游戏界面
         */
        function EndGameFunc() {
            context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            context.fillStyle = "Black";
            context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            if (hero.blood > 0) {
				context.drawImage(finishGameImg, (SCREEN_WIDTH - finishGameImg.width) / 2, 150);
                DrawTextInMiddle(context, "恭喜你闯关成功，按Enter重新开始", 350);
            } else {
				context.drawImage(endGameImg, (SCREEN_WIDTH - endGameImg.width) / 2, 150);
                DrawTextInMiddle(context, "闯关失败，按Enter重新开始", 350);
            }
        }
        /**
        * 循环刷新函数
        */
        function RefreshFunc() {
            context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            //-----------------------------Hero-----------------------------------------------------
            if (isKeyLeft) {
                hero.dir = DIR_LEFT;
                hero.StartMove();
            }
            if (isKeyRight) {
                hero.dir = DIR_RIGHT;
                hero.StartMove();
            }
            if (isKeyUp) {
                hero.dir = DIR_UP;
                hero.StartMove();
            }
            if (isKeyDown) {
                hero.dir = DIR_DOWN;
                hero.StartMove();
            }
            if (!isKeyLeft && !isKeyRight && !isKeyUp && !isKeyDown) {
                hero.StopMove();
            }
            if (isKeyFire) {
                this.heroFireDelayCounter++;
                if (heroFireDelayCounter == HERO_FIRE_DELAY) {
                    var bull = new Bullet(hero.x + hero.width / 2, hero.y + hero.height / 2,
                    BULLET_WIDTH, BULLET_HEIGHT, hero.dir, HERO_BULLET_SPEED);
                    heroBullets.push(bull);
                    heroFireDelayCounter = 0;
                }
            }
            hero.Update();
            context.drawImage(shadowImg, hero.x + hero.width / 2 - SHADOW_WIDTH / 2,
                hero.y + hero.height - SHADOW_HEIGHT / 2);
            context.drawImage(hero.img, hero.drawX, hero.drawY, hero.width, hero.height,
                hero.x, hero.y, hero.width, hero.height);
            DrawBlood(context, hero.blood, HERO_BLOOD, hero.x, hero.y - 10, hero.width);
            //-----------------------------Enemy----------------------------------------------------
            for (i = 0; i < enemys.length; i++) {
                // 随机走动
                if (getRandom(1, 10) == 1) {
                    enemys[i].dir = getRandom(0, 3);
                }
                // 碰到墙壁自动转向
                if (enemys[i].x <= 0 || enemys[i].x >= SCREEN_WIDTH - enemys[i].width ||
                    enemys[i].y <= 0 || enemys[i].y >= SCREEN_HEIGHT - enemys[i].height) {
                    switch (enemys[i].dir) {
                        case DIR_UP: enemys[i].dir = DIR_DOWN; break;
                        case DIR_DOWN: enemys[i].dir = DIR_UP; break;
                        case DIR_LEFT: enemys[i].dir = DIR_RIGHT; break;
                        case DIR_RIGHT: enemys[i].dir = DIR_LEFT; break;
                    }
                }
                // 随机发射子弹
                var enemyFireRandom;
                switch (level) {
                    case 1: enemyFireRandom = ENEMY_LEVEL_1_FIRE_DELAY; break;
                    case 2: enemyFireRandom = ENEMY_LEVEL_2_FIRE_DELAY; break;
                    case 3: enemyFireRandom = ENEMY_LEVEL_3_FIRE_DELAY; break;
                    case 4: enemyFireRandom = ENEMY_LEVEL_4_FIRE_DELAY; break;
                    case 5: enemyFireRandom = ENEMY_LEVEL_5_FIRE_DELAY; break;
                }
                if (getRandom(1, enemyFireRandom) == 1) {
                    var bull = new Bullet(enemys[i].x + enemys[i].width / 2, enemys[i].y + enemys[i].height / 2,
                        BULLET_WIDTH, BULLET_HEIGHT, enemys[i].dir, ENEMY_BULLET_SPEED);
                    enemyBullets.push(bull);
                }
                // 绘制图片
                enemys[i].Update();
                context.drawImage(shadowImg, enemys[i].x + enemys[i].width / 2 - SHADOW_WIDTH / 2, 
                    enemys[i].y + enemys[i].height - SHADOW_HEIGHT / 2);
                context.drawImage(enemys[i].img, enemys[i].drawX, enemys[i].drawY, enemys[i].width, enemys[i].height,
                    enemys[i].x, enemys[i].y, enemys[i].width, enemys[i].height);
                DrawBlood(context, enemys[i].blood, ENEMY_BLOOD, enemys[i].x, enemys[i].y - 10, enemys[i].width);
            }
            //------------------------------HeroBullets----------------------------------------------
            for (i = 0; i < heroBullets.length; i++) {
                var isBulletExist = true;
                // 检测子弹与敌人碰撞
                for (j = 0; j < enemys.length; j++) {
                    if (HitTest(enemys[j], heroBullets[i])) {
                        enemys[j].blood -= HERO_BULLET_POWER;
                        if (enemys[j].blood <= 0) {
                            enemys.splice(j, 1);                            
                        }
                        isBulletExist = false;
                    }
                }
                // 检测子弹出界
                if (heroBullets[i].x < 0 || heroBullets[i].x > SCREEN_WIDTH ||
                    heroBullets[i].y < 0 || heroBullets[i].y > SCREEN_HEIGHT) {                    
                    isBulletExist = false;
                }
                // 绘制子弹
                if (isBulletExist) {
                    heroBullets[i].Update();
                    context.drawImage(heroBulletImg, heroBullets[i].x, heroBullets[i].y);
                } else {
                    heroBullets.splice(i, 1);
                }
            }
            //------------------------------EnemyBullets---------------------------------------------
            for (i = 0; i < enemyBullets.length; i++) {
                var isBulletExist = true;
                // 检测子弹与主角碰撞
                if (HitTest(hero, enemyBullets[i])) {
                    hero.blood -= ENEMY_BULLET_POWER;
                    isBulletExist = false;
                }
                // 检测子弹出界
                if (enemyBullets[i].x < 0 || enemyBullets[i].x > SCREEN_WIDTH ||
                    enemyBullets[i].y < 0 || enemyBullets[i].y > SCREEN_HEIGHT) {
                    isBulletExist = false;
                }
                // 绘制子弹
                if (isBulletExist) {
                    enemyBullets[i].Update();
                    context.drawImage(enemyBulletImg, enemyBullets[i].x, enemyBullets[i].y);
                } else {
                    enemyBullets.splice(i, 1);
                }
            }
            //-------------------------------Blasts-----------------------------------------------------
            for (i = 0; i < blasts.length; i++) {
                if (blasts[i].IsEnd()) {
                    blasts.splice(i, 1);
                } else {
                    blasts[i].Update();
                    context.drawImage(blastImg, blasts[i].drawX, blasts[i].drawY, blasts[i].width, blasts[i].height,
                        blasts[i].x, blasts[i].y, blasts[i].width, blasts[i].height);
                }
            }
            //--------------------------------Text------------------------------------------------------
            var text = "第" + level + "关  血量：" + hero.blood + "  W、S、A、D控制方向，J控制开火，P暂停";
            DrawText(context, text, 10, 20);
			if (nextLevelTextDelayCounter < nextLevelTextDelay)
			{
				DrawTextInCenter(context, "第" + level + "关");
				nextLevelTextDelayCounter++;
			}
            //-------------------------------------------------------------------------------------------
            if (hero.blood <= 0) {
                EndGame();
            }
            if (enemys.length == 0) {
                GoToNextLevel();
            }
        }
        /**
         * 绘制文字
         */
        function DrawText(context, text, x, y) {
            context.fillStyle = "Red";
            context.font = "bold 20px 宋体";
            context.fillText(text, x, y);
        }
        /**
        * 在屏幕中央绘制文字
        */
        function DrawTextInMiddle(context, text, y) {
            context.fillStyle = "Red";
            context.font = "bold 20px 宋体";
            var met = context.measureText(text);
            context.fillText(text, (SCREEN_WIDTH - met.width) / 2, y);
        }
        /**
        * 在屏幕中心绘制文字
        */
        function DrawTextInCenter(context, text) {
            context.fillStyle = "Red";
            context.font = "bold 20px 宋体";
            var met = context.measureText(text);
            context.fillText(text, (SCREEN_WIDTH - met.width) / 2, SCREEN_HEIGHT / 2);
        }
        /**
        * 绘制血槽
        */
        function DrawBlood(context, blood, maxBlood, x, y, width) {
            var bloodWidth = (blood / maxBlood) * width;
            if (blood / maxBlood < 0.3) {
                context.fillStyle = "Red";
            } else if (blood / maxBlood < 0.5) {
                context.fillStyle = "Yellow";
            } else {
                context.fillStyle = "Green";
            }
            context.fillRect(x, y, bloodWidth, 5);
        }
        /**
         * 角色与子弹碰撞检测
         */
        function HitTest(role, bullet) {
            var isHit = RectHitTest(role.x, role.y, role.width, role.height,
                bullet.x, bullet.y, bullet.width, bullet.height);
            if (isHit) {
                var blast = new Blast(bullet.x - (BLAST_WIDTH / 2), bullet.y - (BLAST_HEIGHT / 2),
                    BLAST_WIDTH, BLAST_HEIGHT, BLAST_FRAME_COUNT);
                blasts.push(blast);
            }
            return isHit;
        }
        /**
         * 矩形碰撞检测
         */
        function RectHitTest(x1, y1, w1, h1, x2, y2, w2, h2) {
            if (x1 + w1 > x2 && x1 < x2 + w2 && y1 + h1 > y2 && y1 < y2 + h2) {
                return true;
            } else {
                return false;
            }
        }
        /**
         * 获取随机数
         */
        function getRandom(min, max){
            return Math.round(Math.random() * (max - min) + min);
        }
        /**
         * 初始化游戏
         */
        function InitGame() {
            beforeGameImg = new Image();
			finishGameImg = new Image();
			endGameImg = new Image();
            heroImg = new Image();
            heroBulletImg = new Image();
            enemyBulletImg = new Image();
            enemy_level_1_img = new Image();
            enemy_level_2_img = new Image();
            enemy_level_3_img = new Image();
            enemy_level_4_img = new Image();
            enemy_level_5_img = new Image();
            blastImg = new Image();
            shadowImg = new Image();
            beforeGameImg.src = "http://images.cnitblog.com/i/39275/201408/021357091964795.png";
			finishGameImg.src = "http://images.cnitblog.com/i/39275/201408/021354389153706.png";
			endGameImg.src = "http://images.cnitblog.com/i/39275/201408/021356250873170.png";
            heroImg.src = "http://images.cnitblog.com/i/39275/201408/021356391659502.png";
            heroBulletImg.src = "http://images.cnitblog.com/i/39275/201408/021353583685693.png";
            enemyBulletImg.src = "http://images.cnitblog.com/i/39275/201408/021354195557021.png";
            enemy_level_1_img.src = "http://images.cnitblog.com/i/39275/201408/021355179303220.png";
            enemy_level_2_img.src = "http://images.cnitblog.com/i/39275/201408/021355220716489.png";
            enemy_level_3_img.src = "http://images.cnitblog.com/i/39275/201408/021355256335400.png";
            enemy_level_4_img.src = "http://images.cnitblog.com/i/39275/201408/021355307277511.png";
            enemy_level_5_img.src = "http://images.cnitblog.com/i/39275/201408/021355358997364.png";
            blastImg.src = "http://images.cnitblog.com/i/39275/201408/021354266656315.png";
            shadowImg.src = "http://images.cnitblog.com/i/39275/201408/021356544937119.png";
            level = 0;
            canvas = document.getElementById("view");
            context = canvas.getContext("2d");
            timerId = setInterval(BeforeGameFunc, REFRESH_TIME);
        }
        /**
         *  进行下一关
         */
        function GoToNextLevel() {
            clearInterval(timerId);
			nextLevelDelayCounter = 0;
            level++;
            if (level > 1) {
                hero.blood += (HERO_BLOOD / 2);
                if (hero.blood > HERO_BLOOD) {
                    hero.blood = HERO_BLOOD;
                }
            }
            if (level > 5) {
                EndGame();
            } else {
                StartGame(level);
            }
        }
        /**
        * 开始游戏
        */
        function StartGame(level) {
            enemys = new Array();
            heroBullets = new Array();            
            enemyBullets = new Array();
            blasts = new Array();
			if (level == 1)
			{
				var heroStartX = (SCREEN_WIDTH - HERO_WIDTH) / 2;
				var heroStartY = (SCREEN_HEIGHT - HERO_HEIGHT) / 2;
				hero = new Role(
				heroStartX,
				heroStartY,
				HERO_WIDTH,
				HERO_HEIGHT,
				DIR_DOWN,
				heroImg,
				HERO_FRAME_COUNT,
				HERO_BLOOD,
				HERO_MOVE_SPEED,
				HERO_BULLET_SPEED,
				HERO_FIRE_DELAY);
			}
            switch (level) {
                case 1:
                    canvas.style.background = "url(http://images.cnitblog.com/i/39275/201408/021335048051337.png) repeat";
                    for (i = 0; i < 10; i++) {
                        var enemy = new Role(
                            getRandom(0, SCREEN_WIDTH - ENEMY_WIDTH),
                            getRandom(0, SCREEN_HEIGHT - ENEMY_HEIGHT),
                            ENEMY_WIDTH,
                            ENEMY_HEIGHT,
                            getRandom(0, 3),
                            enemy_level_1_img,
                            ENEMY_FRAME_COUNT,
                            ENEMY_BLOOD,
                            ENEMY_LEVEL_1_MOVE_SPEED,
                            ENEMY_BULLET_SPEED,
                            ENEMY_LEVEL_1_FIRE_DELAY);
                        enemy.StartMove();
                        enemys.push(enemy);
                    }
                    break;
                case 2:
                    canvas.style.background = "url(http://images.cnitblog.com/i/39275/201408/021343231188565.png) repeat";
                    for (i = 0; i < 10; i++) {
                        var enemy = new Role(
                            getRandom(0, SCREEN_WIDTH - ENEMY_WIDTH),
                            getRandom(0, SCREEN_HEIGHT - ENEMY_HEIGHT),
                            ENEMY_WIDTH,
                            ENEMY_HEIGHT,
                            getRandom(0, 3),
                            enemy_level_2_img,
                            ENEMY_FRAME_COUNT,
                            ENEMY_BLOOD,
                            ENEMY_LEVEL_2_MOVE_SPEED,
                            ENEMY_BULLET_SPEED,
                            ENEMY_LEVEL_2_FIRE_DELAY);
                        enemy.StartMove();
                        enemys.push(enemy);
                    }
                    break;
                case 3:
                    canvas.style.background = "url(http://images.cnitblog.com/i/39275/201408/021342490714135.png) repeat";
                    for (i = 0; i < 10; i++) {
                        var enemy = new Role(
                            getRandom(0, SCREEN_WIDTH - ENEMY_WIDTH),
                            getRandom(0, SCREEN_HEIGHT - ENEMY_HEIGHT),
                            ENEMY_WIDTH,
                            ENEMY_HEIGHT,
                            getRandom(0, 3),
                            enemy_level_3_img,
                            ENEMY_FRAME_COUNT,
                            ENEMY_BLOOD,
                            ENEMY_LEVEL_3_MOVE_SPEED,
                            ENEMY_BULLET_SPEED,
                            ENEMY_LEVEL_3_FIRE_DELAY);
                        enemy.StartMove();
                        enemys.push(enemy);
                    }
                    break;
                case 4:
                    canvas.style.background = "url(http://images.cnitblog.com/i/39275/201408/021343405084053.png) repeat";
                    for (i = 0; i < 10; i++) {
                        var enemy = new Role(
                            getRandom(0, SCREEN_WIDTH - ENEMY_WIDTH),
                            getRandom(0, SCREEN_HEIGHT - ENEMY_HEIGHT),
                            ENEMY_WIDTH,
                            ENEMY_HEIGHT,
                            getRandom(0, 3),
                            enemy_level_4_img,
                            ENEMY_FRAME_COUNT,
                            ENEMY_BLOOD,
                            ENEMY_LEVEL_4_MOVE_SPEED,
                            ENEMY_BULLET_SPEED,
                            ENEMY_LEVEL_4_FIRE_DELAY);
                        enemy.StartMove();
                        enemys.push(enemy);
                    }
                    break;
                case 5:
                    canvas.style.background = "url(http://images.cnitblog.com/i/39275/201408/021343598522211.png) repeat";
                    for (i = 0; i < 10; i++) {
                        var enemy = new Role(
                            getRandom(0, SCREEN_WIDTH - ENEMY_WIDTH),
                            getRandom(0, SCREEN_HEIGHT - ENEMY_HEIGHT),
                            ENEMY_WIDTH,
                            ENEMY_HEIGHT,
                            getRandom(0, 3),
                            enemy_level_5_img,
                            ENEMY_FRAME_COUNT,
                            ENEMY_BLOOD,
                            ENEMY_LEVEL_5_MOVE_SPEED,
                            ENEMY_BULLET_SPEED,
                            ENEMY_LEVEL_5_FIRE_DELAY);
                        enemy.StartMove();
                        enemys.push(enemy);
                    }
                    break;
            }
            isPause = false;
            timerId = setInterval(RefreshFunc, REFRESH_TIME);
        }
        /**
         * 暂停游戏
         */
        function StopGame() {
            isPause = true;
            clearInterval(timerId);
            DrawTextInCenter(context, "已暂停，按P继续");
        }
        /**
         * 继续游戏
         */
        function ContinueGame() {
            isPause = false;
            timerId = setInterval(RefreshFunc, REFRESH_TIME);
        }
        /**
         * 结束游戏
         */
        function EndGame() {
            level = 0
            clearInterval(timerId);
            timerId = setInterval(EndGameFunc, REFRESH_TIME);
        }
        /**
         * 按键按下事件
         */
        document.onkeydown = function(e) {
			var keyCode;
			if(window.event){
				keyCode=event.keyCode;
			}else{
				keyCode=e.which;
			}
			//alert(keyCode);
            if (keyCode == 13) {
                if (level == 0) {
                    GoToNextLevel();
                }
            }
            if (keyCode == 65) {
                isKeyLeft = true;
            }
            if (keyCode == 68) {
                isKeyRight = true;
            }
            if (keyCode == 87) {
                isKeyUp = true;
            }
            if (keyCode == 83) {
                isKeyDown = true;
            }
            if (keyCode == 74) {
                isKeyFire = true;
            }
            if (keyCode == 80) {        // 按下P键，暂停或继续游戏
                if (isPause) {
                    ContinueGame();
                } else {
                    StopGame();
                }
            }
        }
        /**
         * 按键弹起事件
         */
        document.onkeyup = function(e) {
			var keyCode;
			if(window.event){
				keyCode=event.keyCode;
			}else{
				keyCode=e.which;
			}
            if (keyCode == 65) {
                isKeyLeft = false;
            }
            if (keyCode == 68) {
                isKeyRight = false;
            }
            if (keyCode == 87) {
                isKeyUp = false;
            }
            if (keyCode == 83) {
                isKeyDown = false;
            }
            if (keyCode == 74) {
                isKeyFire = false;
            }
        }
		InitGame();
    