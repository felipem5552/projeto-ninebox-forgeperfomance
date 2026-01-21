import express from 'express'
import RelatoriosRepository from '../repositories/relatorios_repository'
import CicloRepository from '../repositories/ciclo_repository'

const relatoriosRouter = express.Router()


relatoriosRouter.get('/relatorios/ninebox-por-time', (req, res) => {
  CicloRepository.buscarAtivo(ciclo => {
    if (!ciclo) {
      return res.status(400).json({
        erro: 'Nenhum ciclo ativo'
      })
    }

    RelatoriosRepository.nineBoxPorTime(
      ciclo.id,
      dados => res.json(dados)
    )
  })
})

export default relatoriosRouter