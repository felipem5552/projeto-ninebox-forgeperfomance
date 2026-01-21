import { Router, Request, Response } from 'express'
import CicloRepository from '../repositories/ciclo_repository'

const ciclosRouter = Router()


// - LISTAR TODOS OS CICLOS

ciclosRouter.get('/ciclos', (_req: Request, res: Response) => {
  CicloRepository.listar(ciclos => {
    res.json(ciclos)
  })
})


// - BUSCAR CICLO ATIVO

ciclosRouter.get('/ciclos/ativo', (_req: Request, res: Response) => {
  CicloRepository.buscarAtivo(ciclo => {
    if (!ciclo) {
      return res.status(404).json({
        erro: 'Nenhum ciclo ativo'
      })
    }

    res.json(ciclo)
  })
})


// - CRIAR CICLO

ciclosRouter.post('/ciclos', (req: Request, res: Response) => {
  const { nome, data_inicio, data_fim } = req.body as {
    nome?: string
    data_inicio?: string
    data_fim?: string
  }

  if (!nome || nome.trim() === '') {
    return res.status(400).json({
      erro: 'Nome do ciclo é obrigatório'
    })
  }

  CicloRepository.criar(
    {
      nome: nome.trim(),
      data_inicio,
      data_fim
    },
    id => {
      if (!id) {
        return res.status(400).json({
          erro: 'Erro ao criar ciclo'
        })
      }

      res.status(201).json({ id })
    }
  )
})


// - ATIVAR CICLO

ciclosRouter.post('/ciclos/:id/ativar', (req: Request, res: Response) => {
  const id = Number(req.params.id)

  if (isNaN(id)) {
    return res.status(400).json({
      erro: 'ID inválido'
    })
  }

  CicloRepository.ativar(id, sucesso => {
    if (!sucesso) {
      return res.status(400).json({
        erro: 'Não foi possível ativar o ciclo'
      })
    }

    res.json({
      mensagem: 'Ciclo ativado com sucesso'
    })
  })
})

export default ciclosRouter
