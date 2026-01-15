import sqlite3 from 'sqlite3'
import path from 'path'

const DBSOURCE = 'db.sqlite'
console.log('DB REAL:', path.resolve(DBSOURCE))
const SQL_CREATE: string[] = [

 
  `
  CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT,
    time TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    privilegios TEXT,
    data_de_ingresso TEXT DEFAULT CURRENT_DATE
  )
  `,

 
  `
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL
  )
  `,


  `
  CREATE TABLE IF NOT EXISTS perguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enunciado TEXT NOT NULL,
    eixo TEXT NOT NULL,
    peso INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    disponibilidade TEXT,
    FOREIGN KEY (modelo) REFERENCES avaliacoes(id) ON DELETE CASCADE
  )
  `,

 
  `
  CREATE TABLE IF NOT EXISTS historico_de_avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avaliador INTEGER NOT NULL,
    avaliado INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    pergunta INTEGER NOT NULL,
    nota INTEGER NOT NULL,
    ciclo TEXT NOT NULL,
    FOREIGN KEY (avaliador) REFERENCES funcionarios(id),
    FOREIGN KEY (avaliado) REFERENCES funcionarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modelo) REFERENCES avaliacoes(id) ON DELETE CASCADE
  )
  `,

  `
  CREATE TABLE IF NOT EXISTS avaliacoes_resultado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avaliador INTEGER NOT NULL,
    avaliado INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    ciclo TEXT NOT NULL,
    desempenho INTEGER NOT NULL,
    potencial INTEGER NOT NULL,
    nine_box INTEGER NOT NULL,
    FOREIGN KEY (avaliador) REFERENCES funcionarios(id),
    FOREIGN KEY (avaliado) REFERENCES funcionarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modelo) REFERENCES avaliacoes(id) ON DELETE CASCADE
  )
  `,

  `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacao_ciclo
  ON avaliacoes_resultado (avaliado, ciclo)
  `
]

const database = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message)
    throw err
  }

  console.log('Base de dados conectada com sucesso.')

  // ATIVAR FOREIGN KEYS
  database.run('PRAGMA foreign_keys = ON')

    database.serialize(() => {
    for (const sql of SQL_CREATE) {
        database.run(sql, (err) => {
        if (err) {
            console.error('Erro ao criar estrutura:', err.message)
        }
        })
    }
    })
})

export default database
