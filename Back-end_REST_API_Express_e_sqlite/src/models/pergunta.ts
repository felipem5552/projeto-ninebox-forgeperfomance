/** Define os atributos das perguntas utilizadas nas avaliações */

type Pergunta = {

    /** Identificadores da pergunta, use-os para buscar a pergunta */
    id?: number
    enunciado: string
    
    /** Define qual eixo do Nine-Box a pergunta se encaminha, sendo eles:
     
     * Eixo X (Desempenho)
     * Eixo Y (Potencial)
     
     */
    eixo: string

    /** Peso utilizado para média ponderada (utilizado por ser mais confiável) */
    peso: number

    /** Define se é uma pergunta de Autoavaliação ou uma pergunta de avaliação 180º */
    modelo: number

    /** Define se a pergunta está disponível */
    disponibilidade: number
}

export default Pergunta
/** Disponibiliza o tipo para uso em outros arquivos */