import sqlite3 from 'sqlite3'
import path from 'path'

const DBSOURCE = path.resolve('db.sqlite')
console.log('DB REAL:', DBSOURCE)

const SQL_CREATE: string[] = [

  /* =========================
     👥 FUNCIONÁRIOS
  ========================= */
  `
  CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT,
    time TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT,
    privilegios TEXT NOT NULL CHECK (privilegios IN ('GESTOR', 'FUNCIONARIO')),
    data_de_ingresso TEXT DEFAULT CURRENT_DATE
  )
  `,

  /* =========================
     📋 MODELOS DE AVALIAÇÃO
  ========================= */
  `
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL
  )
  `,

  /* =========================
     ❓ PERGUNTAS
  ========================= */
  `
  CREATE TABLE IF NOT EXISTS perguntas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enunciado TEXT NOT NULL,
    eixo TEXT NOT NULL CHECK (eixo IN ('DESEMPENHO', 'POTENCIAL')),
    peso INTEGER NOT NULL DEFAULT 1,
    modelo INTEGER NOT NULL,
    disponibilidade INTEGER DEFAULT 1,
    FOREIGN KEY (modelo) REFERENCES avaliacoes(id) ON DELETE CASCADE
  )
  `,

  /* =========================
     📝 RESPOSTAS POR PERGUNTA
     (GESTOR e AUTOAVALIAÇÃO)
  ========================= */
  `
  CREATE TABLE IF NOT EXISTS historico_de_avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avaliador INTEGER,
    avaliado INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    pergunta INTEGER NOT NULL,
    nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    ciclo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('GESTOR', 'AUTO')),
    FOREIGN KEY (avaliador) REFERENCES funcionarios(id),
    FOREIGN KEY (avaliado) REFERENCES funcionarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modelo) REFERENCES avaliacoes(id) ON DELETE CASCADE,
    FOREIGN KEY (pergunta) REFERENCES perguntas(id) ON DELETE CASCADE
  )
  `,

  /* =========================
     📊 RESULTADO CONSOLIDADO
  ========================= */
  `
  CREATE TABLE IF NOT EXISTS avaliacoes_resultado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avaliador INTEGER,
    avaliado INTEGER NOT NULL,
    modelo INTEGER NOT NULL,
    ciclo TEXT NOT NULL,
    desempenho INTEGER NOT NULL CHECK (desempenho BETWEEN 1 AND 3),
    potencial INTEGER NOT NULL CHECK (potencial BETWEEN 1 AND 3),
    nine_box INTEGER NOT NULL CHECK (nine_box BETWEEN 1 AND 9),
    tipo TEXT NOT NULL CHECK (tipo IN ('GESTOR', 'AUTO')),
    FOREIGN KEY (avaliador) REFERENCES funcionarios(id),
    FOREIGN KEY (avaliado) REFERENCES funcionarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modelo) REFERENCES avaliacoes(id) ON DELETE CASCADE
  )
  `,

  /* 🔐 UM RESULTADO POR CICLO + TIPO */
  `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_avaliacao_ciclo_tipo
  ON avaliacoes_resultado (avaliado, ciclo, tipo)
  `
]

const database = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    console.error('❌ Erro ao conectar no banco:', err.message)
    throw err
  }

  console.log('✅ Base de dados conectada com sucesso.')

  database.run('PRAGMA foreign_keys = ON')

  database.serialize(() => {
    for (const sql of SQL_CREATE) {
      database.run(sql, err => {
        if (err) {
          console.error('❌ Erro ao criar estrutura:', err.message)
        }
      })
    }
  })
})

export default database
