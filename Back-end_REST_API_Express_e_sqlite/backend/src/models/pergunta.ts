//- Define os atributos das perguntas utilizadas nas avaliações.

type Pergunta = {
    id?: number
    enunciado: string
    //- Define qual eixo do Nine-Box a pergunta se encaminha, sendo eles: Eixo X (Desempenho) e Eixo Y (Potencial).
    eixo: string
    peso: number
    modelo: number
    disponibilidade: number
}

export default Pergunta
