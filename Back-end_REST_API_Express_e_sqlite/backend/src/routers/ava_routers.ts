import express, { Request, Response } from 'express'
import Pergunta from '../models/pergunta'
import Instancia_de_Avaliacao from '../models/instancia_de_avaliacao'
import AvaliacaoRepository from '../repositories/ava_repository'
import { calcularResultadoAvaliacao } from '../services/avaliacao_service'
import CicloRepository from '../repositories/ciclo_repository'
import { enviarConviteAvaliacao } from '../services/email_service'
import funcionariosRepository from '../repositories/funcionarios_repository'

const ava_Router = express.Router()


// - MODELOS DE AVALIAÇÃO


// - LISTAR MODELOS
ava_Router.get('/avaliacoes', (_req: Request, res: Response) => {
  AvaliacaoRepository.listarModelos(modelos => {
    res.json(modelos)
  })
})

// - CRIAR MODELO
ava_Router.post('/avaliacoes', (req: Request, res: Response) => {
  const { titulo } = req.body as { titulo?: string }

  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ erro: 'Título é obrigatório' })
  }

  AvaliacaoRepository.criarAvaliacao(
    { titulo: titulo.trim() },
    id => {
      if (!id) {
        return res.status(400).json({
          erro: 'Erro ao criar avaliação'
        })
      }

      res.status(201).json({ id })
    }
  )
})

// - ATIVAR / DESATIVAR MODELO

ava_Router.put('/avaliacoes-status/:id', (req: Request, res: Response) => {
  console.log('🔥 ROTA STATUS CHAMADA')

  const id = Number(req.params.id)
  const { ativo } = req.body as { ativo?: number }

  if (ativo !== 0 && ativo !== 1) {
    return res.status(400).json({
      erro: 'Valor de ativo inválido (use 0 ou 1)'
    })
  }

  AvaliacaoRepository.alterarStatusModelo(
    id,
    ativo,
    notFound => {
      if (notFound) {
        return res.status(404).json({
          erro: 'Modelo não encontrado'
        })
      }

      res.json({
        sucesso: true,
        ativo
      })
    }
  )
})

// - ATUALIZAR MODELO

ava_Router.put('/avaliacoes/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const { titulo } = req.body as { titulo?: string }

  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ erro: 'Título é obrigatório' })
  }

  AvaliacaoRepository.alterarAvaliacao(
    id,
    { titulo: titulo.trim() },
    notFound => {
      if (notFound) {
        return res.status(404).json({
          erro: 'Modelo não encontrado'
        })
      }

      res.status(204).send()
    }
  )
})



// - VERIFICAR USO DO MODELO
ava_Router.get('/avaliacoes/:id/uso', (req: Request, res: Response) => {
  const modeloId = Number(req.params.id)

  AvaliacaoRepository.modeloFoiUsado(
    modeloId,
    total => {
      res.json({ total })
    }
  )
})


// - PERGUNTAS


// - LISTAR PERGUNTAS DO MODELO
ava_Router.get('/avaliacoes/:id', (req: Request, res: Response) => {
  const modeloId = Number(req.params.id)

  AvaliacaoRepository.verAvaliacao(
    modeloId,
    perguntas => {
      res.json(perguntas)
    }
  )
})

// - ADICIONAR PERGUNTA
ava_Router.post('/avaliacoes/:id', (req: Request, res: Response) => {
  const modeloId = Number(req.params.id)
  const pergunta = req.body as Pergunta

  AvaliacaoRepository.inserirPerguntas(
    modeloId,
    pergunta,
    id => {
      if (!id) {
        return res.status(400).json({
          erro: 'Erro ao inserir pergunta'
        })
      }

      res.status(201).json({ id })
    }
  )
})
// - LISTAR MODELOS ATIVOS (GESTOR)
ava_Router.get('/avaliacoes-ativas', (_req: Request, res: Response) => {
  AvaliacaoRepository.listarModelosAtivos(modelos => {
    res.json(modelos)
  })
})

// - ATUALIZAR PERGUNTA
ava_Router.put('/pergunta/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const pergunta = req.body as Pergunta

  AvaliacaoRepository.alterarPergunta(
    id,
    pergunta,
    notFound => {
      if (notFound) {
        return res.status(404).json({
          erro: 'Pergunta não encontrada'
        })
      }

      res.status(204).send()
    }
  )
})

// - REMOVER PERGUNTA
ava_Router.delete('/perguntas/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)

  AvaliacaoRepository.apagarPergunta_Real(
    id,
    notFound => {
      if (notFound) {
        return res.status(404).json({
          erro: 'Pergunta não encontrada'
        })
      }

      res.status(204).send()
    }
  )
})


// - AVALIAÇÃO DO GESTOR

ava_Router.post('/avaliar', (req: Request, res: Response) => {
  const instancia = req.body as Instancia_de_Avaliacao

  // - BUSCA CICLO ATIVO
  CicloRepository.buscarAtivo(ciclo => {
    if (!ciclo) {
      return res.status(400).json({
        erro: 'Nenhum ciclo de avaliação ativo'
      })
    }

    // - VERIFICA DUPLICIDADE
    AvaliacaoRepository.verificarAvaliacaoNoCiclo(
      instancia.Avaliado,
      ciclo.id,
      'GESTOR',
      existe => {
        if (existe) {
          return res.status(409).json({
            erro: 'Avaliação já realizada neste ciclo'
          })
        }

        const resultado = calcularResultadoAvaliacao(
          instancia.Notas
        )

        // - REGISTRA AVALIAÇÃO
        AvaliacaoRepository.Avaliar(
          {
            ...instancia,
            CicloId: ciclo.id,
            Desempenho: resultado.desempenho,
            Potencial: resultado.potencial,
            NineBox: resultado.nineBox
          },
          erro => {
            if (erro) {
              return res.status(400).json({
                erro: 'Erro ao registrar avaliação'
              })
            }

            //- BUSCAR FUNCIONÁRIO PARA ENVIAR EMAIL
            funcionariosRepository.buscarPorId(
              instancia.Avaliado,
              async funcionario => {
                if (funcionario && funcionario.email) {
                  try {
                    await enviarConviteAvaliacao(
                      funcionario.email,
                      funcionario.nome
                    )
                  } catch (err) {
                    console.error(
                      '⚠️ Erro ao enviar email:',
                      err
                    )
                  }
                }

                return res.status(201).json({
                  sucesso: true,
                  mensagem:
                    'Avaliação registrada e email processado'
                })
              }
            )
          }
        )
      }
    )
  })
})

// - AUTOAVALIAÇÃO


ava_Router.post('/autoavaliacao', (req: Request, res: Response) => {
  const { avaliado, modelo, notas } = req.body as {
    avaliado?: number
    modelo?: number
    notas?: number[]
  }

  if (
    typeof avaliado !== 'number' ||
    typeof modelo !== 'number' ||
    !Array.isArray(notas)
  ) {
    return res.status(400).json({
      erro: 'Dados inválidos'
    })
  }

  // - BUSCA CICLO ATIVO
  CicloRepository.buscarAtivo(ciclo => {
    if (!ciclo) {
      return res.status(400).json({
        erro: 'Nenhum ciclo de avaliação ativo'
      })
    }

    AvaliacaoRepository.registrarAutoavaliacao(
      avaliado,
      modelo,
      ciclo.id,
      notas,
      erro => {
        if (erro) {
          return res.status(409).json({
            erro: 'Autoavaliação já realizada neste ciclo'
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
