import sqlite3 from 'sqlite3'
import path from 'path'

// - CAMINHO DO BANCO
const DBSOURCE = path.resolve('db.sqlite')
console.log('DB REAL:', DBSOURCE)

// - SQL DE CRIAÇÃO DAS TABELAS E ÍNDICES
const SQL_CREATE: string[] = [


  // - TIMES
  `
  CREATE TABLE IF NOT EXISTS times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    ativo INTEGER DEFAULT 1
  )
  `,
  //- TIME PADRAO ADMIN
  `
    INSERT OR IGNORE INTO times (id, nome)
  VALUES (1, 'Administração')
  `,

  // - FUNCIONARIOS
  `
  CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ativo INTEGER DEFAULT 1,
    cargo TEXT,
    time_id INTEGER NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT,
    privilegios TEXT NOT NULL CHECK (
      privilegios IN ('GESTOR', 'FUNCIONARIO', 'ADMIN')
    ),
    data_de_ingresso TEXT DEFAULT CURRENT_DATE,

    FOREIGN KEY (time_id)
      REFERENCES times(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
  `,

  // - CICLOS DE AVALIACAO
  `
  CREATE TABLE IF NOT EXISTS ciclos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ativo INTEGER DEFAULT 1,
    data_inicio TEXT,
    data_fim TEXT
  )
  `,

  // - AVALIACOES (MODELOS)
  `
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    ativo INTEGER DEFAULT 1
  )
  `,

  // - PERGUNTAS
  `
  CREATE TABLE IF NOT EXISTS perguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enunciado TEXT NOT NULL,
    eixo TEXT NOT NULL CHECK (eixo IN ('DESEMPENHO', 'POTENCIAL')),
    peso INTEGER NOT NULL DEFAULT 1,
    modelo INTEGER NOT NULL,
    disponibilidade INTEGER DEFAULT 1,
    FOREIGN KEY (modelo)
      REFERENCES avaliacoes(id)
      ON DELETE CASCADE
  )
  `,

  // - HISTORICO DE AVALIACOES (POR PERGUNTA)
  `
  CREATE TABLE IF NOT EXISTS historico_de_avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avaliador INTEGER,
    avaliado INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    pergunta INTEGER NOT NULL,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    ciclo_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('GESTOR', 'AUTO')),

    FOREIGN KEY (avaliador)
      REFERENCES funcionarios(id),

    FOREIGN KEY (avaliado)
      REFERENCES funcionarios(id)
      ON DELETE CASCADE,

    FOREIGN KEY (modelo)
      REFERENCES avaliacoes(id)
      ON DELETE CASCADE,

    FOREIGN KEY (pergunta)
      REFERENCES perguntas(id)
      ON DELETE CASCADE,

    FOREIGN KEY (ciclo_id)
      REFERENCES ciclos(id)
      ON DELETE CASCADE
  )
  `,

  // - EVITA DUPLICACAO NO MESMO CICLO
  `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_historico_unico
  ON historico_de_avaliacoes (
    avaliado,
    pergunta,
    ciclo_id,
    tipo
  )
  `,

  // - RESULTADO CONSOLIDADO
  `
  CREATE TABLE IF NOT EXISTS avaliacoes_resultado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avaliador INTEGER,
    avaliado INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    ciclo_id INTEGER NOT NULL,
    desempenho INTEGER NOT NULL CHECK (desempenho BETWEEN 1 AND 3),
    potencial INTEGER NOT NULL CHECK (potencial BETWEEN 1 AND 3),
    nine_box INTEGER NOT NULL CHECK (nine_box BETWEEN 1 AND 9),
    tipo TEXT NOT NULL CHECK (tipo IN ('GESTOR', 'AUTO')),

    FOREIGN KEY (avaliador)
      REFERENCES funcionarios(id),

    FOREIGN KEY (avaliado)
      REFERENCES funcionarios(id)
      ON DELETE CASCADE,

    FOREIGN KEY (modelo)
      REFERENCES avaliacoes(id)
      ON DELETE CASCADE,

    FOREIGN KEY (ciclo_id)
      REFERENCES ciclos(id)
      ON DELETE CASCADE
  )
  `,

  // - GARANTE 1 RESULTADO POR CICLO E TIPO
  `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_resultado_ciclo_tipo
  ON avaliacoes_resultado (
    avaliado,
    ciclo_id,
    tipo
  )
  `
]
// - CONEXAO COM O BANCO
const database = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message)
    throw err
  }

  console.log('Banco conectado com sucesso')

  // - ATIVA CHAVES ESTRANGEIRAS
  database.run('PRAGMA foreign_keys = ON')

  // - CRIA ESTRUTURA
  database.serialize(() => {
    for (const sql of SQL_CREATE) {
      database.run(sql, err => {
        if (err) {
          console.error('Erro ao criar estrutura:', err.message)
        }
      })
    }
  })
})

export default database
