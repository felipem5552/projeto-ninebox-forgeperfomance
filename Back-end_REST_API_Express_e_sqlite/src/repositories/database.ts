import sqlite3 from 'sqlite3'
const DBSOURCE = 'db.sqlite'
const SQL_CREATE: string[] = [`
    CREATE TABLE Perguntas (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Enunciado TEXT,
        Eixo TEXT
    )`,
    `CREATE TABLE Funcionarios (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT,
        Cargo TEXT,
        Posicao TEXT,
        Data_de_Ingresso TEXT DEFAULT CURRENT_DATE
    )`
    ]
const database = new sqlite3.Database(DBSOURCE, (err) => {
    for (const table of SQL_CREATE) {
        if (err) {
            console.error(err.message)
            throw err
        } else {
            console.log('Base de dados conectada com sucesso.')
            database.run(table, (err) => {
                if (err) {
                    // Possivelmente a tabela já foi criada
                } else {
                    console.log('Tabela criada com sucesso.')
                }
            })
        }
    }
})
export default database