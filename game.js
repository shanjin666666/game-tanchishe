// 将所有初始化代码包装在一个函数中
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const speedDisplay = document.getElementById('speedDisplay');
    const speedUpBtn = document.getElementById('speedUp');
    const speedDownBtn = document.getElementById('speedDown');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const highScoreElement = document.getElementById('highScore');

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [
        { x: 10, y: 10 }
    ];
    let food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameSpeed = 1;
    let gameInterval = 100;
    let isPaused = false;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;

    // 添加速度控制函数
    function updateSpeed(change) {
        gameSpeed = Math.max(0.5, Math.min(10, gameSpeed + change));
        gameInterval = 100 / gameSpeed;
        speedDisplay.textContent = gameSpeed.toFixed(1);
    }

    // 添加按钮事件监听
    speedUpBtn.addEventListener('click', () => updateSpeed(0.1));
    speedDownBtn.addEventListener('click', () => updateSpeed(-0.1));
    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '继续游戏' : '暂停游戏';
        if (!isPaused) {
            drawGame();
        }
    });
    restartBtn.addEventListener('click', () => {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        isPaused = false;
        pauseBtn.textContent = '暂停游戏';
        drawGame();
    });

    // 添加方向控制
    document.addEventListener('keydown', changeDirection);

    function changeDirection(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;

        const keyPressed = event.keyCode;
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;

        if (keyPressed === LEFT_KEY && !goingRight) {
            dx = -1;
            dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            dx = 0;
            dy = -1;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            dx = 1;
            dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            dx = 0;
            dy = 1;
        }
    }

    function drawGame() {
        if (isPaused) {
            return;
        }
        // 移动蛇
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } else {
            snake.pop();
        }

        // 清空画布
        ctx.fillStyle = '#000014';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制食物
        ctx.beginPath();
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.arc(
            food.x * gridSize + gridSize/2, 
            food.y * gridSize + gridSize/2, 
            gridSize/2 - 2, 
            0, 
            Math.PI * 2
        );
        ctx.fill();

        // 绘制蛇
        snake.forEach((segment, index) => {
            // 为蛇身创建赛博朋克风格的渐变色
            const blueValue = Math.max(200 - index * 5, 50);
            ctx.fillStyle = `rgb(0, ${blueValue}, 255)`;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 5;
            
            // 绘制圆角矩形作为蛇身
            roundedRect(
                ctx,
                segment.x * gridSize,
                segment.y * gridSize,
                gridSize - 2,
                gridSize - 2,
                5
            );

            // 给蛇头添加眼睛
            if (index === 0) {
                ctx.fillStyle = '#ff00ff';
                ctx.shadowColor = '#ff00ff';
                ctx.shadowBlur = 5;
                // 根据移动方向确定眼睛位置
                let eyeX1, eyeY1, eyeX2, eyeY2;
                
                if (dx === 1) { // 向右
                    eyeX1 = eyeX2 = segment.x * gridSize + gridSize - 6;
                    eyeY1 = segment.y * gridSize + 5;
                    eyeY2 = segment.y * gridSize + gridSize - 8;
                } else if (dx === -1) { // 向左
                    eyeX1 = eyeX2 = segment.x * gridSize + 4;
                    eyeY1 = segment.y * gridSize + 5;
                    eyeY2 = segment.y * gridSize + gridSize - 8;
                } else if (dy === -1) { // 向上
                    eyeX1 = segment.x * gridSize + 5;
                    eyeX2 = segment.x * gridSize + gridSize - 8;
                    eyeY1 = eyeY2 = segment.y * gridSize + 4;
                } else { // 向下或静止
                    eyeX1 = segment.x * gridSize + 5;
                    eyeX2 = segment.x * gridSize + gridSize - 8;
                    eyeY1 = eyeY2 = segment.y * gridSize + gridSize - 6;
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
                ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 检查���戏结束条件
        if (gameOver()) {
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHighScore', highScore);
                highScoreElement.textContent = highScore;
            }
            alert('游戏结束！得分：' + score);
            snake = [{ x: 10, y: 10 }];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            return;
        }

        setTimeout(drawGame, gameInterval);
    }

    function gameOver() {
        // 撞墙
        const hitLeftWall = snake[0].x < 0;
        const hitRightWall = snake[0].x >= tileCount;
        const hitTopWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y >= tileCount;

        if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
            return true;
        }

        // 撞到自己
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
                return true;
            }
        }

        return false;
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    // 开始游戏
    drawGame();
}

// 等待 DOM 完全加载后再初始化游戏
document.addEventListener('DOMContentLoaded', initGame); 
