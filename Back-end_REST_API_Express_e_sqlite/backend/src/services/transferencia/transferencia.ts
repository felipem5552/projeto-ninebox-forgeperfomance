import sqlite3 from 'sqlite3'
import * as xlsx from 'xlsx';
import type FuncionarioRow from '../../repositories/funcionarios_repository';

type FuncionarioRow = {
  id: number
  nome: string
  email: string
  cargo?: string | null
  time_id: number
  time_nome?: string
  privilegios: 'FUNCIONARIO' | 'GESTOR' | 'ADMIN'
  senha?: string | null
  ativo: number
  data_de_ingresso: string
}

const DBSOURCE = "../../../db.sqlite"
const database = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message)
    throw err
  }
})

function importarDadosDoExcel() {
    const arquivo = xlsx.readFile('dados.xlsx');
    const abaNome = arquivo.SheetNames[0];
    const dadosJson: FuncionarioRow[] = xlsx.utils.sheet_to_json(arquivo.Sheets[abaNome]);

    console.log(`Total de linhas detectadas: ${dadosJson.length}`);

    database.serialize( () => {database.run('BEGIN TRANSACTION')
        const stmt = database.prepare(`INSERT INTO funcionarios (nome, cargo, time_id, email, senha, privilegios) 
        VALUES (?, ?, ?, ?, ?, ?)`)
        let erro = false
        dadosJson.forEach( (funcionario) => {
            console.log(funcionario)
            stmt.run(funcionario.nome, funcionario.cargo, funcionario.time_id, funcionario.email, funcionario.senha, 
                funcionario.privilegios,
                function (e: Error) {
                    if (e) {
                        erro = true
                    }
                }
            )
        })
        stmt.finalize( (err) => {
            if (erro || err) {
                database.run('ROLLBACK')
                console.log("Rollback")
            }
            else {
                database.run('COMMIT')
                console.log("commit")
            }

        })
    })
}

importarDadosDoExcel()