import sqlite3 from 'sqlite3'
const DBSOURCE = 'db.sqlite'
const SQL_CREATE: string[] = [
    `CREATE TABLE Funcionarios (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT,
        Cargo TEXT,
        Privilegios TEXT,
        Data_De_Ingresso TEXT DEFAULT CURRENT_DATE
    )`,
    `CREATE TABLE Perguntas (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Enunciado TEXT,
        Eixo TEXT,
        Peso INTEGER,
        Modelo INTEGER,
        Disponibilidade TEXT,

        FOREIGN KEY (Modelo)
            REFERENCES Avaliacoes(Id)
            ON DELETE CASCADE
    )`,
    `CREATE TABLE Avaliacoes (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Titulo TEXT
    )`,
    `CREATE TABLE Historico_de_Avaliacoes (
        Avaliador INTEGER,
        Avaliado INTEGER,
        Modelo INTEGER,
        Nota INTEGER,
        Ciclo TEXT,

        FOREIGN KEY (Avaliado) 
            REFERENCES Funcionarios(Id)
            ON DELETE CASCADE

        FOREIGN KEY (Avaliador)
            REFERENCES Funcionarios(Id)

        FOREIGN KEY (Modelo)
            REFERENCES Avaliacoes(Id)
            ON DELETE CASCADE
    )`
    ]
const database = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message)
        throw err
    } else {
        console.log('Base de dados conectada com sucesso.')
        for (const table of SQL_CREATE) {
            database.run(table, (err) => {
                if (err) {
                    console.log('Tabela possivelmente já existe.')
                    // Possivelmente a tabela já foi criada
                } else {
                    console.log('Tabela criada com sucesso.')
                }
            })
        }
    }
})
export default database