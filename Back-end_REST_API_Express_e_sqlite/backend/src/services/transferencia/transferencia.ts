import database from '../../repositories/database'
import * as xlsx from 'xlsx';
import Funcionario from '../../models/funcionario';




// 3. Ler o Excel e realizar a inserção
function importarDadosDoExcel() {
    // Carrega o arquivo e pega a primeira aba
    const arquivo = xlsx.readFile('dados.xlsx');
    const abaNome = arquivo.SheetNames[0];
    const dadosJson: Funcionario[] = xlsx.utils.sheet_to_json(arquivo.Sheets[abaNome]);

    console.log(`Total de linhas detectadas: ${dadosJson.length}`);

    database.serialize( () => {database.run('BEGIN TRANSACTION')
        const stmt = database.prepare(`INSERT INTO funcionarios (nome, time, email, cargo, privilegios,) 
        VALUES (?, ?, ?, ?, ?)`)
        let erro = false
        dadosJson.forEach( (funcionario) => {
            stmt.run(funcionario.nome, funcionario.time, funcionario.email, funcionario.cargo, funcionario.privilegios,
                function (e: Error) {
                    if (e) {
                        erro = true
                    }
                }
            )
        })
        if (erro) {
            database.run('ROLLBACK')
            console.log("Rollback")
        }
        else {
            database.run('COMMIT')
            console.log("commit")
        }
    })
}

importarDadosDoExcel()