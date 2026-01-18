// Define os atributos da avalição.

type Instancia_de_Avaliacao = {

    // ID do avaliador e avaliado. 
    Avaliador: number
    Avaliado: number

    // Define tipos de avaliações, sendo eles: Autoavaliação e Avaliação do avaliador para o avaliado. 
    Modelo: number

    // O tipo array foi utilizado para armazenar as notas. 
    Notas: number[]

    // Quando a avaliação foi realizada, exemplo: Ciclo 2024, Ciclo 2025 e etc... 
    Ciclo: string

    // Ambos os atributos são utilizados para o cálculo do quadrante Nine-Box. 
    Desempenho: number   
    Potencial: number
    
    // Define em qual quadrante do Nine-Box o funcionário vai se encaixar. 
    NineBox: number 
}

export default Instancia_de_Avaliacao
// Disponibiliza o tipo para uso em outros arquivos. 