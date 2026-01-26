// CALCULOS DA NINEBOX

function media(notas: number[]): number {

  const soma = notas.reduce((acc, n) => acc + n, 0);

  
  return soma / notas.length;
}

function nivelPorMedia(media: number): number {

  if (media >= 4) return 3;
  if (media >= 2.5) return 2;
  return 1;
}

function calcularNineBox(desempenho: number, potencial: number): number {


  return (potencial - 1) * 3 + desempenho;
}

export function calcularResultadoAvaliacao(notas: number[]) {

  const desempenhoNotas = notas.slice(0, 5);
  const potencialNotas = notas.slice(5, 10);

  const desempenho = nivelPorMedia(media(desempenhoNotas));
  const potencial = nivelPorMedia(media(potencialNotas));

  const nineBox = calcularNineBox(desempenho, potencial);

  return {
    desempenho,
    potencial,
    nineBox
  };
}