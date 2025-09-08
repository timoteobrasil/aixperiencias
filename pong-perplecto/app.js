// Configurações do jogo baseadas nos dados fornecidos
const GAME_CONFIG = {
    canvas: {
        width: 800,
        height: 400
    },
    paddle: {
        width: 10,
        height: 80,
        speed: 5
    },
    ball: {
        size: 10,
        speed: 4
    },
    colors: {
        background: '#000000',
        foreground: '#FFFFFF'
    }
};

// Estado do jogo
const gameState = {
    leftPaddle: {
        x: 20,
        y: 160,
        width: GAME_CONFIG.paddle.width,
        height: GAME_CONFIG.paddle.height,
        dy: 0
    },
    rightPaddle: {
        x: 770,
        y: 160,
        width: GAME_CONFIG.paddle.width,
        height: GAME_CONFIG.paddle.height,
        dy: 0
    },
    ball: {
        x: 400,
        y: 200,
        size: GAME_CONFIG.ball.size,
        dx: GAME_CONFIG.ball.speed,
        dy: GAME_CONFIG.ball.speed,
        speed: GAME_CONFIG.ball.speed
    },
    score: {
        left: 0,
        right: 0
    },
    keys: {
        KeyW: false,
        KeyS: false,
        ArrowUp: false,
        ArrowDown: false
    }
};

// Elementos DOM
let canvas, ctx, leftScoreElement, rightScoreElement;

// Inicialização do jogo
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    leftScoreElement = document.getElementById('leftScore');
    rightScoreElement = document.getElementById('rightScore');
    
    // Configurar canvas para receber foco (necessário para capturar teclas)
    canvas.tabIndex = 0;
    canvas.focus();
    
    // Inicializar eventos de teclado
    setupKeyboardEvents();
    
    // Inicializar direção aleatória da bola
    resetBall();
    
    // Iniciar o loop do jogo
    gameLoop();
}

/**
 * SISTEMA DE CAPTURA DE ENTRADAS
 * 
 * O sistema funciona da seguinte forma:
 * 1. Capturamos eventos keydown/keyup para detectar quando teclas são pressionadas/soltas
 * 2. Mantemos um estado das teclas no objeto gameState.keys
 * 3. No loop principal, verificamos quais teclas estão ativas e atualizamos as velocidades
 * 4. Isso permite movimento suave e contínuo das barras
 */
function setupKeyboardEvents() {
    // Capturar quando uma tecla é pressionada
    document.addEventListener('keydown', (event) => {
        // Verificar se a tecla é uma das que controlam o jogo
        if (event.code in gameState.keys) {
            gameState.keys[event.code] = true;
            event.preventDefault(); // Prevenir comportamento padrão (ex: scroll)
        }
    });
    
    // Capturar quando uma tecla é solta
    document.addEventListener('keyup', (event) => {
        if (event.code in gameState.keys) {
            gameState.keys[event.code] = false;
            event.preventDefault();
        }
    });
    
    // Garantir que quando a janela perde foco, todas as teclas são "soltas"
    window.addEventListener('blur', () => {
        Object.keys(gameState.keys).forEach(key => {
            gameState.keys[key] = false;
        });
    });
}

/**
 * LOOP PRINCIPAL DO JOGO
 * 
 * O loop de eventos funciona assim:
 * 1. requestAnimationFrame agenda a próxima execução do loop
 * 2. updateGame() atualiza a lógica do jogo (posições, colisões, pontuação)
 * 3. renderGame() desenha o estado atual na tela
 * 4. O ciclo se repete continuamente (~60 FPS)
 */
function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

// Atualizar lógica do jogo
function updateGame() {
    // Atualizar movimento das barras baseado nas teclas pressionadas
    updatePaddles();
    
    // Atualizar posição da bola
    updateBall();
    
    // Verificar colisões
    checkCollisions();
    
    // Verificar pontuação
    checkScoring();
}

// Atualizar movimento das barras
function updatePaddles() {
    // Jogador esquerdo (W/S)
    if (gameState.keys.KeyW) {
        gameState.leftPaddle.dy = -GAME_CONFIG.paddle.speed;
    } else if (gameState.keys.KeyS) {
        gameState.leftPaddle.dy = GAME_CONFIG.paddle.speed;
    } else {
        gameState.leftPaddle.dy = 0;
    }
    
    // Jogador direito (setas)
    if (gameState.keys.ArrowUp) {
        gameState.rightPaddle.dy = -GAME_CONFIG.paddle.speed;
    } else if (gameState.keys.ArrowDown) {
        gameState.rightPaddle.dy = GAME_CONFIG.paddle.speed;
    } else {
        gameState.rightPaddle.dy = 0;
    }
    
    // Aplicar movimento e limitar dentro dos limites do canvas
    gameState.leftPaddle.y += gameState.leftPaddle.dy;
    gameState.rightPaddle.y += gameState.rightPaddle.dy;
    
    // Limitar barras dentro do canvas
    gameState.leftPaddle.y = Math.max(0, Math.min(gameState.leftPaddle.y, 
        GAME_CONFIG.canvas.height - GAME_CONFIG.paddle.height));
    gameState.rightPaddle.y = Math.max(0, Math.min(gameState.rightPaddle.y, 
        GAME_CONFIG.canvas.height - GAME_CONFIG.paddle.height));
}

// Atualizar posição da bola
function updateBall() {
    gameState.ball.x += gameState.ball.dx;
    gameState.ball.y += gameState.ball.dy;
}

// Verificar colisões
function checkCollisions() {
    const ball = gameState.ball;
    
    // Colisão com bordas superior e inferior
    if (ball.y <= ball.size/2 || ball.y >= GAME_CONFIG.canvas.height - ball.size/2) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size/2, Math.min(ball.y, GAME_CONFIG.canvas.height - ball.size/2));
    }
    
    // Colisão com barra esquerda
    if (ball.x <= gameState.leftPaddle.x + gameState.leftPaddle.width + ball.size/2 &&
        ball.y >= gameState.leftPaddle.y &&
        ball.y <= gameState.leftPaddle.y + gameState.leftPaddle.height &&
        ball.dx < 0) {
        
        // Calcular ângulo de rebote baseado na posição de impacto
        const impactPoint = (ball.y - gameState.leftPaddle.y - gameState.leftPaddle.height/2) / (gameState.leftPaddle.height/2);
        ball.dx = Math.abs(ball.dx);
        ball.dy = impactPoint * ball.speed * 0.75;
    }
    
    // Colisão com barra direita
    if (ball.x >= gameState.rightPaddle.x - ball.size/2 &&
        ball.y >= gameState.rightPaddle.y &&
        ball.y <= gameState.rightPaddle.y + gameState.rightPaddle.height &&
        ball.dx > 0) {
        
        const impactPoint = (ball.y - gameState.rightPaddle.y - gameState.rightPaddle.height/2) / (gameState.rightPaddle.height/2);
        ball.dx = -Math.abs(ball.dx);
        ball.dy = impactPoint * ball.speed * 0.75;
    }
}

// Verificar pontuação
function checkScoring() {
    const ball = gameState.ball;
    
    // Ponto para jogador direito (bola passou pela esquerda)
    if (ball.x <= 0) {
        gameState.score.right++;
        updateScoreDisplay();
        resetBall();
    }
    
    // Ponto para jogador esquerdo (bola passou pela direita)
    if (ball.x >= GAME_CONFIG.canvas.width) {
        gameState.score.left++;
        updateScoreDisplay();
        resetBall();
    }
}

// Resetar posição da bola
function resetBall() {
    gameState.ball.x = GAME_CONFIG.canvas.width / 2;
    gameState.ball.y = GAME_CONFIG.canvas.height / 2;
    
    // Direção aleatória
    const angle = (Math.random() - 0.5) * Math.PI/3; // Ângulo entre -30° e 30°
    const direction = Math.random() < 0.5 ? 1 : -1; // Esquerda ou direita
    
    gameState.ball.dx = Math.cos(angle) * GAME_CONFIG.ball.speed * direction;
    gameState.ball.dy = Math.sin(angle) * GAME_CONFIG.ball.speed;
}

// Atualizar exibição da pontuação
function updateScoreDisplay() {
    leftScoreElement.textContent = gameState.score.left;
    rightScoreElement.textContent = gameState.score.right;
    
    // Animação de pontuação
    leftScoreElement.classList.add('updated');
    rightScoreElement.classList.add('updated');
    
    setTimeout(() => {
        leftScoreElement.classList.remove('updated');
        rightScoreElement.classList.remove('updated');
    }, 300);
}

// Renderizar o jogo
function renderGame() {
    // Limpar canvas
    ctx.fillStyle = GAME_CONFIG.colors.background;
    ctx.fillRect(0, 0, GAME_CONFIG.canvas.width, GAME_CONFIG.canvas.height);
    
    // Configurar cor para desenhar elementos
    ctx.fillStyle = GAME_CONFIG.colors.foreground;
    
    // Desenhar linha central pontilhada
    drawCenterLine();
    
    // Desenhar barras
    ctx.fillRect(gameState.leftPaddle.x, gameState.leftPaddle.y, 
                gameState.leftPaddle.width, gameState.leftPaddle.height);
    ctx.fillRect(gameState.rightPaddle.x, gameState.rightPaddle.y, 
                gameState.rightPaddle.width, gameState.rightPaddle.height);
    
    // Desenhar bola
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.size/2, 0, Math.PI * 2);
    ctx.fill();
}

// Desenhar linha central pontilhada
function drawCenterLine() {
    const centerX = GAME_CONFIG.canvas.width / 2;
    const dashLength = 10;
    const gapLength = 5;
    
    ctx.setLineDash([dashLength, gapLength]);
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, GAME_CONFIG.canvas.height);
    ctx.strokeStyle = GAME_CONFIG.colors.foreground;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', initGame);