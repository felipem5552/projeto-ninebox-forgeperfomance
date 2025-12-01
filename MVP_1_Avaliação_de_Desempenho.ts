import * as promptSync from 'prompt-sync';
const prompt = promptSync();


function Avaliar(a: number, b: number): void {
    let Linha: string;
    let Coluna: string;
    if (a <= 5) {
        Linha = "C";
    }
    else if (a <= 10) {
        Linha = "B";
    }
    else {
        Linha = "A";
    }
    if (b <= 5) {
        Coluna = "1";
    }
    else if (b <= 10) {
        Coluna = "2";
    }
    else {
        Coluna = "3";
    }
    console.log(`A classificação do colaborador, no Ninebox, é ${Linha}${Coluna}.`);
}


class Questionario {
    Perguntas_Linha: string[];
    Perguntas_Coluna: string[];
    constructor (Perguntas_Linha: string[], Perguntas_Coluna: string[]) {
        this.Perguntas_Linha = Perguntas_Linha;
        this.Perguntas_Coluna = Perguntas_Coluna;
    }
    Questionar(): void {
        let a: number = 0;
        let b: number = 0;
        console.log("Responda o questionário a seguir. Avalie de 1 a 5.\n");
        for (const p of this.Perguntas_Linha) {
            console.log(`${p}\n`);
            a += +(prompt(""));
            console.log(`\n`);
        }
        for (const p of this.Perguntas_Coluna) {
            console.log(`${p}\n`);
            b += +(prompt(""));
            console.log(`\n`);
        }
        Avaliar(a, b);
    }
}

