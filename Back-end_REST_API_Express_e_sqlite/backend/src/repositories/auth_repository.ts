import database from './database'
import UsuarioAuth from '../models/autenticacao'

const AuthRepository = {

  buscarPorEmailESenha(
    email: string,
    senha: string,
    callback: (usuario: UsuarioAuth | null) => void
  ) {
    const sql = `
      SELECT id, nome, email, senha, privilegios
      FROM funcionarios
      WHERE email = ? AND senha = ?
    `

    database.get(sql, [email, senha], (_err, row) => {
      callback((row as UsuarioAuth) || null)
    })
  },

  buscarPorEmail(
    email: string,
    callback: (usuario: UsuarioAuth | null) => void
  ) {
    const sql = `
      SELECT id, nome, email, senha, privilegios
      FROM funcionarios
      WHERE email = ?
    `

    database.get(sql, [email], (_err, row) => {
      callback((row as UsuarioAuth) || null)
    })
  },

  definirSenha(
    id: number,
    senha: string,
    callback: (ok: boolean) => void
  ) {
    const sql = `
      UPDATE funcionarios
      SET senha = ?
      WHERE id = ?
    `

    database.run(sql, [senha, id], function (err) {
      callback(!err)
    })
  }

}

export default AuthRepository
