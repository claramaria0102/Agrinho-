function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
let produtos = [];
let tempoRestante = 60;
let timer;
let cidadeArea;
let pontos = 0;
let tipos = ['🍎', '🥕', '🌽'];
let carregando = null;

let jogador = {
  x: 100,
  y: 200,
  size: 32,
  emoji: '👩‍🌾',
  velocidade: 4
};

// Variável para armazenar obstáculos
let obstaculos = [];

function setup() {
  createCanvas(800, 400);
  cidadeArea = { x: 600, y: 0, w: 200, h: height };
  
  // Criar obstáculos antes de gerar produtos para evitar sobreposição
  criarObstaculos(5); // Gera 5 obstáculos
  gerarProdutos(5); // Gera 5 produtos
  
  timer = millis();
  textAlign(CENTER, CENTER);
  textFont('Arial');
}

function draw() {
  background(180, 240, 180); // Fundo verde claro

  // Desenhar cidade
  fill(180, 180, 255, 150); // Cor azul claro e semi-transparente para a cidade
  rect(cidadeArea.x, cidadeArea.y, cidadeArea.w, cidadeArea.h);
  fill(0);
  textSize(20);
  text("Cidade", cidadeArea.x + cidadeArea.w / 2, 20);

  // Mostrar produtos
  for (let p of produtos) {
    p.mostrar();
  }

  // Mostrar obstáculos
  for (let obs of obstaculos) {
    fill(100, 70, 40); // Cor marrom para os obstáculos
    rect(obs.x, obs.y, obs.w, obs.h);
  }

  // Mostrar jogador
  textSize(jogador.size);
  text(jogador.emoji, jogador.x, jogador.y);

  // Mostrar item carregado
  if (carregando) {
    textSize(24);
    text(carregando.emoji, jogador.x + 20, jogador.y - 20);
  }

  moverJogador();
  checarColheita();
  checarEntrega();

  // HUD
  fill(0);
  textSize(18);
  let tempo = 60 - int((millis() - timer) / 1000);
  tempoRestante = tempo;
  text("⏱ Tempo: " + tempo + "s", width / 2, 20);
  text("⭐ Pontos: " + pontos, width / 2, 45);

  if (tempo <= 0) {
    noLoop(); // Para o loop do draw
    textSize(40);
    fill(0);
    text("🏁 Fim de Jogo!", width / 2, height / 2);
  }
}

// A função keyPressed não é mais necessária para movimento contínuo
function keyPressed() {
  // O movimento é tratado por keyIsDown() na função moverJogador()
}

function moverJogador() {
  // Salva a posição anterior do jogador para reverter em caso de colisão
  let prevX = jogador.x;
  let prevY = jogador.y;

  if (keyIsDown(LEFT_ARROW)) {
    jogador.x -= jogador.velocidade;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    jogador.x += jogador.velocidade;
  }
  if (keyIsDown(UP_ARROW)) {
    jogador.y -= jogador.velocidade;
  }
  if (keyIsDown(DOWN_ARROW)) {
    jogador.y += jogador.velocidade;
  }

  // Limites da tela
  jogador.x = constrain(jogador.x, 0, width - jogador.size/2); // Ajuste para o centro do emoji
  jogador.y = constrain(jogador.y, 0, height - jogador.size/2); // Ajuste para o centro do emoji

  // Checar colisão com obstáculos
  for (let obs of obstaculos) {
    // Usamos uma função simples para colisão de retângulo (rect-rect collision)
    // considerando a posição do centro do jogador e o tamanho do emoji
    if (checarColisaoRetangulo(jogador.x - jogador.size / 2, jogador.y - jogador.size / 2, jogador.size, jogador.size, obs.x, obs.y, obs.w, obs.h)) {
      // Se houver colisão, reverte para a posição anterior
      jogador.x = prevX;
      jogador.y = prevY;
      break; // Sai do loop assim que uma colisão é detectada
    }
  }
}

// Função auxiliar para verificar colisão entre dois retângulos
function checarColisaoRetangulo(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (x1 < x2 + w2 &&
          x1 + w1 > x2 &&
          y1 < y2 + h2 &&
          y1 + h1 > y2);
}

function checarColheita() {
  if (carregando) return;

  for (let i = produtos.length - 1; i >= 0; i--) {
    let p = produtos[i];
    // Distância do centro do jogador ao centro do produto
    let d = dist(jogador.x, jogador.y, p.x, p.y);
    // Se a distância for menor que a soma dos "raios" (metade dos tamanhos)
    // Isso é uma forma simples de colisão circular para os emojis
    if (d < (jogador.size / 2 + p.tamanho / 2)) {
      carregando = p;
      produtos.splice(i, 1);
      break;
    }
  }
}

function checarEntrega() {
  // Garante que o jogador esteja carregando algo e esteja dentro da área da cidade
  if (carregando && jogador.x > cidadeArea.x && jogador.y > cidadeArea.y && jogador.y < cidadeArea.y + cidadeArea.h) {
    pontos++;
    carregando = null;
    gerarProdutoUnico(); // Gera um novo produto após a entrega
  }
}

function gerarProdutos(quantidade) {
  for (let i = 0; i < quantidade; i++) {
    gerarProdutoUnico();
  }
}

function gerarProdutoUnico() {
  let tipo = random(tipos);
  let novoProdutoX, novoProdutoY;
  let colidiu;

  do {
    colidiu = false;
    // Garante que o produto não nasça na área da cidade ou muito perto das bordas
    novoProdutoX = random(50, cidadeArea.x - 50);
    novoProdutoY = random(50, height - 50); // Garante que não apareça na borda superior/inferior

    // Checa se o novo produto colide com algum obstáculo
    for (let obs of obstaculos) {
      if (checarColisaoRetangulo(novoProdutoX - 14, novoProdutoY - 14, 28, 28, obs.x, obs.y, obs.w, obs.h)) {
        colidiu = true;
        break;
      }
    }
  } while (colidiu); // Continua gerando posições até que não haja colisão

  produtos.push(new Produto(novoProdutoX, novoProdutoY, tipo));
}

// Função para criar obstáculos
function criarObstaculos(numObstaculos) {
  for (let i = 0; i < numObstaculos; i++) {
    let obsX, obsY, obsW, obsH;
    let colidiu;

    do {
      colidiu = false;
      obsW = random(40, 80); // Largura aleatória
      obsH = random(40, 80); // Altura aleatória

      // Posição aleatória, evitando a área da cidade e as bordas
      obsX = random(50, cidadeArea.x - obsW - 50);
      obsY = random(50, height - obsH - 50);

      // Checa se o novo obstáculo colide com obstáculos existentes
      for (let existingObs of obstaculos) {
        if (checarColisaoRetangulo(obsX, obsY, obsW, obsH, existingObs.x, existingObs.y, existingObs.w, existingObs.h)) {
          colidiu = true;
          break;
        }
      }
      // Checa se o novo obstáculo colide com a posição inicial do jogador
      if (checarColisaoRetangulo(obsX, obsY, obsW, obsH, jogador.x - jogador.size / 2, jogador.y - jogador.size / 2, jogador.size, jogador.size)) {
        colidiu = true;
      }

    } while (colidiu); // Continua gerando posições até que não haja colisão

    obstaculos.push({
      x: obsX,
      y: obsY,
      w: obsW,
      h: obsH
    });
  }
}

// Classe Produto com emoji
class Produto {
  constructor(x, y, emoji) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.tamanho = 28;
  }

  mostrar() {
    // Adiciona um fundo para o emoji do produto
    fill(255, 255, 200, 180); // Fundo amarelo claro e semi-transparente
    ellipse(this.x, this.y, this.tamanho + 10, this.tamanho + 10); // Desenha um círculo para o fundo
    fill(0); // Cor do texto (preto)
    textSize(this.tamanho);
    text(this.emoji, this.x, this.y);
  }
}