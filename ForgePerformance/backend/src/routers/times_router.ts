import express from 'express'
import TimesRepository from '../repositories/times_repository'

const timesRouter = express.Router()

timesRouter.get('/times', (_req, res) => {
  TimesRepository.listar(times => res.json(times))
})

timesRouter.post('/times', (req, res) => {
  const { nome } = req.body

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Nome do time é obrigatório' })
  }

  TimesRepository.criar(nome, id => {
    if (!id) {
      return res.status(400).json({ erro: 'Erro ao criar time' })
    }

    res.status(201).json({ id })
  })
})

timesRouter.post('/times/:id/desativar', (req, res) => {
  TimesRepository.desativar(Number(req.params.id), ok => {
    if (!ok) return res.status(404).json({ erro: 'Time não encontrado' })
    res.json({ sucesso: true })
  })
})

timesRouter.post('/times/:id/reativar', (req, res) => {
  TimesRepository.reativar(Number(req.params.id), ok => {
    if (!ok) return res.status(404).json({ erro: 'Time não encontrado' })
    res.json({ sucesso: true })
  })
})

timesRouter.put('/times/:id', (req, res) => {
  const { nome } = req.body

  if (!nome || !nome.trim()) {
    return res.status(400).json({ erro: 'Nome do time é obrigatório' })
  }

  TimesRepository.atualizar(
    Number(req.params.id),
    nome.trim(),
    ok => {
      if (!ok) {
        return res.status(404).json({ erro: 'Time não encontrado' })
      }
      res.json({ sucesso: true })
    }
  )
})

export default timesRouter
