import express from 'express'
import RelatoriosRepository from '../repositories/relatorios_repository'

const relatoriosRouter = express.Router()
relatoriosRouter.get('/relatorios/ninebox-por-time',
  (req, res) => {
    RelatoriosRepository.nineBoxPorTime((dados) => {
      res.json(dados)
    })
  }
)

export default relatoriosRouter