// Realiza a lógica por trás do Nine-Box

function media(notas: number[]): number {

  // Soma os valores do array de notas
  const soma = notas.reduce((acc, n) => acc + n, 0);

  // Faz a média dos valores
  return soma / notas.length;
}

function nivelPorMedia(media: number): number {

  // Retorna qual quadrante do Nine-Box se encaixa
  if (media >= 4) return 3;
  if (media >= 2.5) return 2;
  return 1;
}

function calcularNineBox(desempenho: number, potencial: number): number {

  // Utiliza média ponderada; Potencial (3) e Desempenho (1)
  return (potencial - 1) * 3 + desempenho;
}

export function calcularResultadoAvaliacao(notas: number[]) {

  // Divide as questões de desempenho e potencial
  const desempenhoNotas = notas.slice(0, 5);
  const potencialNotas = notas.slice(5, 10);

  // Calcula média dentre as questões
  const desempenho = nivelPorMedia(media(desempenhoNotas));
  const potencial = nivelPorMedia(media(potencialNotas));

  // Retorna posição no Nine-Box
  const nineBox = calcularNineBox(desempenho, potencial);

  return {
    desempenho,
    potencial,
    nineBox
  };
}