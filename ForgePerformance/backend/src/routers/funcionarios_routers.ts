import express, { Request, Response } from 'express'
import funcionariosRepository from '../repositories/funcionarios_repository'
import { emailValido } from '../services/validar_email'
import AvaliacaoRepository from '../repositories/ava_repository'
import { enviarConviteAvaliacao } from '../services/email_service'

const funcionariosRouter = express.Router()

//- CADASTRAR FUNCIONÁRIO
funcionariosRouter.post('/funcionarios', (req: Request, res: Response) => {
  console.log(req.body)

  const { nome, email, cargo, time_id, privilegios } = req.body

  if (!nome || !email || !time_id || !privilegios) {
    return res.status(400).json({
      erro: 'Campos obrigatórios não informados'
    })
  }

  if (!emailValido(email)) {
    return res.status(400).json({
      erro: 'E-mail inválido'
    })
  }

  funcionariosRepository.verificarEmailExistente(
    email,
    existe => {
      if (existe) {
        return res.status(409).json({
          erro: 'E-mail já cadastrado'
        })
      }

      funcionariosRepository.criar(
        {
          nome,
          email,
          cargo: cargo || null,
          time_id: Number(time_id),
          privilegios
        },
        id => {
          if (!id) {
            return res.status(400).json({
              erro: 'Erro ao cadastrar funcionário'
            })
          }

          res.status(201).json({ id })
        }
      )
    }
  )
})

//- LISTAR FUNCIONÁRIOS
funcionariosRouter.get('/funcionarios', (_req, res) => {
  funcionariosRepository.listarTodos(funcionarios =>
    res.json(funcionarios)
  )
})

//- BUSCAR FUNCIONÁRIO POR ID
funcionariosRouter.get('/funcionarios/:id', (req, res) => {
  const id = Number(req.params.id)

  if (isNaN(id)) {
    return res.status(400).json({ erro: 'ID inválido' })
  }

  funcionariosRepository.buscarPorId(id, funcionario => {
    if (!funcionario) {
      return res.status(404).json({
        erro: 'Funcionário não encontrado'
      })
    }

    res.json(funcionario)
  })
})

//- ATUALIZAR FUNCIONÁRIO
funcionariosRouter.put('/funcionarios/:id', (req, res) => {
  const id = Number(req.params.id)
  const { nome, cargo, time_id, privilegios } = req.body

  if (!nome || !time_id || !privilegios) {
    return res.status(400).json({
      erro: 'Campos obrigatórios não informados'
    })
  }

  funcionariosRepository.atualizar(
    id,
    {
      nome,
      cargo: cargo || null,
      time_id: Number(time_id),
      privilegios
    },
    notFound => {
      if (notFound) {
        return res.status(404).json({
          erro: 'Funcionário não encontrado'
        })
      }

      res.status(204).send()
    }
  )
})

//- RESETAR SENHA
funcionariosRouter.post(
  '/funcionarios/:id/reset-senha',
  (req, res) => {
    const id = Number(req.params.id)

    funcionariosRepository.resetarSenha(id, sucesso => {
      if (!sucesso) {
        return res.status(400).json({
          erro: 'Não foi possível resetar a senha'
        })
      }

      res.json({ sucesso: true })
    })
  }
)

//- DESATIVAR FUNCIONÁRIO
funcionariosRouter.post(
  '/funcionarios/:id/desativar',
  (req, res) => {
    const id = Number(req.params.id)

    funcionariosRepository.desativar(id, sucesso => {
      if (!sucesso) {
        return res.status(400).json({
          erro: 'Não foi possível desativar o funcionário'
        })
      }

      res.json({ sucesso: true })
    })
  }
)

//- REATIVAR FUNCIONÁRIO
funcionariosRouter.post(
  '/funcionarios/:id/reativar',
  (req, res) => {
    const id = Number(req.params.id)

    funcionariosRepository.reativar(id, sucesso => {
      if (!sucesso) {
        return res.status(400).json({
          erro: 'Não foi possível reativar o funcionário'
        })
      }

      res.json({ sucesso: true })
    })
  }
)

//- HISTÓRICO DE AVALIAÇÕES
funcionariosRouter.get(
  '/funcionarios/:id/historico',
  (req, res) => {
    const id = Number(req.params.id)
    const cicloId = req.query.cicloId
      ? Number(req.query.cicloId)
      : undefined

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' })
    }

    AvaliacaoRepository.buscarHistorico(
      id,
      cicloId,
      historico => res.json(historico)
    )
  }
)

//- ÚLTIMO MODELO USADO
funcionariosRouter.get(
  '/funcionarios/:id/ultimo-modelo',
  (req, res) => {
    const id = Number(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' })
    }

    AvaliacaoRepository.buscarUltimoModeloDoFuncionario(
      id,
      modeloId => {
        if (!modeloId) {
          return res.status(404).json({
            erro: 'Funcionário ainda não foi avaliado'
          })
        }

        res.json({ modeloId })
      }
    )
  }
)
//- RESUMO DO CICLO ATIVO (DASHBOARD FUNCIONÁRIO)
funcionariosRouter.get(
  '/funcionarios/:id/resumo-ciclo-ativo',
  (req: Request, res: Response) => {
    const id = Number(req.params.id)

    if (isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido' })
    }

    AvaliacaoRepository.buscarResumoCicloAtivo(
      id,
      resultado => {
        if (!resultado) {
          return res.status(404).json({
            erro: 'Nenhum ciclo ativo encontrado'
          })
        }

        res.json(resultado)
      }
    )
  }
)


export default funcionariosRouter
