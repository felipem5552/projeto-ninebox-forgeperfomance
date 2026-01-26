import { Router, Request, Response } from 'express'
import AuthRepository from '../repositories/auth_repository'
import funcionariosRepository from '../repositories/funcionarios_repository'

const authRouter = Router()

authRouter.post('/login', (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({
      erro: 'Informe email e senha'
    })
  }

  funcionariosRepository.buscarPorEmail(email, (usuario) => {

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado'
      })
    }
      if (usuario.ativo === 0) {
    return res.status(403).json({
      erro: 'Usuário desativado. Procure o administrador.'
    })
}

    //- PRIMEIRO ACESSO
    if (!usuario.senha) {
      return res.json({
        primeiroAcesso: true,
        id: usuario.id
      })
    }

  
    if (usuario.senha !== senha) {
      return res.status(401).json({
        erro: 'Senha incorreta'
      })
    }

    //-  LOGIN FEITO
    return res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      privilegios: usuario.privilegios
    })
  })
})


// - VALIDAR PRIMEIRO ACESSO 

authRouter.post(
  '/primeiro-acesso-validar',
  (req: Request, res: Response) => {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        erro: 'Email é obrigatório'
      })
    }

    funcionariosRepository.buscarPorEmail(
      email,
      usuario => {
        if (!usuario) {
          return res.status(404).json({
            erro: 'Usuário não encontrado'
          })
        }

        if (usuario.senha) {
          return res.status(409).json({
            erro: 'Usuário já possui senha'
          })
        }

        if (usuario.ativo === 0) {
          return res.status(403).json({
            erro: 'Usuário desativado'
          })
        }

        // - PRIMEIRO ACESSO PERMITIDO
        return res.json({
          id: usuario.id
        })
      }
    )
  }
)


authRouter.post('/primeiro-acesso', (req: Request, res: Response) => {
  const { id, senha } = req.body

  if (!id || !senha) {
    return res.status(400).json({
      erro: 'Id e senha são obrigatórios'
    })
  }

  AuthRepository.definirSenha(id, senha, (sucesso) => {
    if (!sucesso) {
      return res.status(500).json({
        erro: 'Não foi possível criar a senha'
      })
    }

    return res.status(200).json({
      mensagem: 'Senha criada com sucesso'
    })
  })
})

export default authRouter
