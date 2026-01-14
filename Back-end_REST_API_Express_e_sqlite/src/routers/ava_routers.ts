import express from 'express'
import Avaliacao from "../models/modelo_de_avaliacao";
import Pergunta from '../models/pergunta';
import AvaliacaoRepository from "../repositories/ava_repository";
import Instancia_de_Avaliacao from '../models/instancia_de_avaliacao';
import { calcularResultadoAvaliacao } from '../services/avaliacao_service'

const ava_Router = express.Router()
ava_Router.post('/avaliacoes', (req, res) => {
    const avaliacao: Avaliacao = req.body
    AvaliacaoRepository.criarAvaliacao(avaliacao, (id) => {
        if (id) {
            res.status(201).location(`/avaliacoes/${id}`).send()
        } else {
            console.log("Erro")
            res.status(400).send()
        }
    })
})

ava_Router.post('/avaliacoes/:id', (req, res) => {
    const pergunta: Pergunta = req.body
    const modelo: number = +req.params.id
    AvaliacaoRepository.inserirPerguntas(modelo, pergunta, (id) => {
        if (id) {
            res.status(201).location(`/avaliacoes/${id}`).send()
        }
        else {
            res.status(400).send()
        }
    })
})

ava_Router.get('/avaliacoes/:id', (req, res) => {
    const id: number = +req.params.id
    AvaliacaoRepository.verAvaliacao(id, (perguntas) => {
        if (perguntas) {
            res.json(perguntas)
        }
        else {
            res.status(400).send()
        }
    })
})

ava_Router.post('/avaliar', (req, res) => {
  const instancia: Instancia_de_Avaliacao = req.body

  // Verifica se já existe avaliação no ciclo
  AvaliacaoRepository.verificarAvaliacaoNoCiclo(
    instancia.Avaliado,
    instancia.Ciclo,
    (existe: boolean) => {
      if (existe) {
        return res.status(409).json({
          erro: 'Avaliação já realizada para este funcionário neste ciclo'
        })
      }

      const resultado = calcularResultadoAvaliacao(instancia.Notas)

      const instanciaCompleta: Instancia_de_Avaliacao = {
        ...instancia,
        Desempenho: resultado.desempenho,
        Potencial: resultado.potencial,
        NineBox: resultado.nineBox
      }

      console.log('INSTANCIA COMPLETA:', instanciaCompleta)

      AvaliacaoRepository.Avaliar(instanciaCompleta, (erro: boolean) => {
        if (erro) {
          return res.status(400).json({
            erro: 'Erro ao registrar avaliação'
          })
        }

        return res.status(201).send()
      })
    }
  )
})

ava_Router.delete('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    AvaliacaoRepository.apagarPergunta(id, (notFound) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})

ava_Router.get('/funcionarios/:id/historico', (req, res) => {
  const avaliadoId = Number(req.params.id)

  if (isNaN(avaliadoId)) {
    return res.status(400).json({ erro: 'ID inválido' })
  }

  AvaliacaoRepository.buscarHistorico(avaliadoId, (historico) => {
    res.json(historico)
  })
})

export default ava_Router