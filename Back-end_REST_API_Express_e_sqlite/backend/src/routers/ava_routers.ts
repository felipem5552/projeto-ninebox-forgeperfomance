import express from 'express'
import Pergunta from '../models/pergunta'
import Instancia_de_Avaliacao from '../models/instancia_de_avaliacao'
import AvaliacaoRepository from '../repositories/ava_repository'
import { calcularResultadoAvaliacao } from '../services/avaliacao_service'

const ava_Router = express.Router()

/* ======================================================
   📌 MODELOS DE AVALIAÇÃO
====================================================== */

// 🔹 Lista modelos de avaliação
ava_Router.get('/avaliacoes', (req, res) => {
  AvaliacaoRepository.listarModelos(modelos => {
    res.json(modelos)
  })
})

// 🔹 Cria novo modelo de avaliação
ava_Router.post('/avaliacoes', (req, res) => {
  const avaliacao = req.body

  if (!avaliacao?.titulo) {
    return res.status(400).json({ erro: 'Título é obrigatório' })
  }

  AvaliacaoRepository.criarAvaliacao(avaliacao, id => {
    if (!id) {
      return res.status(400).json({ erro: 'Erro ao criar avaliação' })
    }

    res.status(201).json({ id })
  })
})

// 🔹 Atualiza título do modelo
ava_Router.put('/avaliacoes/:id', (req, res) => {
  const id = Number(req.params.id)

  AvaliacaoRepository.alterarAvaliacao(id, req.body, notFound => {
    if (notFound) {
      res.status(404).json({ erro: 'Modelo não encontrado' })
    } else {
      res.status(204).send()
    }
  })
})

// 🔹 Verifica se modelo já foi usado
ava_Router.get('/avaliacoes/:id/uso', (req, res) => {
  const modeloId = Number(req.params.id)

  AvaliacaoRepository.modeloFoiUsado(modeloId, total => {
    res.json({ total })
  })
})

/* ======================================================
   📌 PERGUNTAS DO MODELO
====================================================== */

// 🔹 Lista perguntas do modelo
ava_Router.get('/avaliacoes/:id', (req, res) => {
  const id = Number(req.params.id)

  AvaliacaoRepository.verAvaliacao(id, perguntas => {
    res.json(perguntas)
  })
})

// 🔹 Adiciona pergunta ao modelo
ava_Router.post('/avaliacoes/:id', (req, res) => {
  const modelo = Number(req.params.id)
  const pergunta: Pergunta = req.body

  AvaliacaoRepository.inserirPerguntas(modelo, pergunta, id => {
    if (!id) {
      return res.status(400).json({ erro: 'Erro ao inserir pergunta' })
    }

    res.status(201).json({ id })
  })
})

// 🔹 Atualiza pergunta
ava_Router.put('/pergunta/:id', (req, res) => {
  const id = Number(req.params.id)

  AvaliacaoRepository.alterarPergunta(id, req.body, notFound => {
    if (notFound) {
      res.status(404).json({ erro: 'Pergunta não encontrada' })
    } else {
      res.status(204).send()
    }
  })
})

// 🔹 Exclui pergunta
ava_Router.delete('/perguntas/:id', (req, res) => {
  const id = Number(req.params.id)

  AvaliacaoRepository.apagarPergunta_Real(id, notFound => {
    if (notFound) {
      res.status(404).json({ erro: 'Pergunta não encontrada' })
    } else {
      res.status(204).send()
    }
  })
})

/* ======================================================
   📌 AVALIAÇÃO DO GESTOR
====================================================== */

ava_Router.post('/avaliar', (req, res) => {
  const instancia: Instancia_de_Avaliacao = req.body

    AvaliacaoRepository.verificarAvaliacaoNoCiclo(
      instancia.Avaliado,
      instancia.Ciclo,
      'GESTOR',
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

      AvaliacaoRepository.Avaliar(instanciaCompleta, erro => {
        if (erro) {
          return res.status(400).json({
            erro: 'Erro ao registrar avaliação'
          })
        }

        res.status(201).json({
          sucesso: true,
          desempenho: instanciaCompleta.Desempenho,
          potencial: instanciaCompleta.Potencial,
          nineBox: instanciaCompleta.NineBox
        })
      })
    }
  )
})

/* ======================================================
   📌 AUTOAVALIAÇÃO DO FUNCIONÁRIO
====================================================== */

ava_Router.post('/autoavaliacao', (req, res) => {
  const { avaliado, modelo, ciclo, notas } = req.body

  if (!avaliado || !modelo || !ciclo || !Array.isArray(notas)) {
    return res.status(400).json({ erro: 'Dados inválidos' })
  }
  AvaliacaoRepository.verificarAvaliacaoNoCiclo(
  avaliado,
  ciclo,
  'AUTO',
  existe => {
    if (existe) {
      return res.status(409).json({
        erro: 'Autoavaliação já realizada neste ciclo'
      })
    }
  AvaliacaoRepository.registrarAutoavaliacao(
    avaliado,
    modelo,
    ciclo,
    notas,
    (erro: boolean) => {
      if (erro) {
        return res.status(400).json({
          erro: 'Erro ao registrar autoavaliação'
        })
      }

      res.status(201).json({
        mensagem: 'Autoavaliação registrada com sucesso'
      })
    }
  )
})
})

export default ava_Router
