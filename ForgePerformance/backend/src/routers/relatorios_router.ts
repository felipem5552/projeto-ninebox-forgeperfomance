import express, { Request, Response } from 'express'
import RelatoriosRepository from '../repositories/relatorios_repository'
import AvaliacaoRepository from '../repositories/ava_repository'
import CicloRepository from '../repositories/ciclo_repository'

const relatoriosRouter = express.Router()

/* =====================================================
   NINE BOX POR TIME (CICLO ESPECÍFICO OU ATIVO)
   GET /relatorios/ninebox-por-time?cicloId=1
===================================================== */
relatoriosRouter.get(
  '/relatorios/ninebox-por-time',
  (req: Request, res: Response) => {
    const cicloIdParam = req.query.cicloId
      ? Number(req.query.cicloId)
      : null

    function buscar(cicloId: number) {
      RelatoriosRepository.nineBoxPorTime(
        cicloId,
        dados => res.json(dados)
      )
    }

    if (cicloIdParam && !isNaN(cicloIdParam)) {
      return buscar(cicloIdParam)
    }

    CicloRepository.buscarAtivo(ciclo => {
      if (!ciclo) {
        return res.status(400).json({
          erro: 'Nenhum ciclo ativo encontrado'
        })
      }

      buscar(ciclo.id)
    })
  }
)

/* =====================================================
   EVOLUÇÃO NINE BOX POR TIME (TODOS OS CICLOS)
   GET /relatorios/ninebox-por-time-evolucao?timeId=1
===================================================== */
relatoriosRouter.get(
  '/relatorios/ninebox-por-time-evolucao',
  (req: Request, res: Response) => {
    const timeId = Number(req.query.timeId)

    if (!timeId || isNaN(timeId)) {
      return res
        .status(400)
        .json({ erro: 'timeId inválido' })
    }

    RelatoriosRepository.buscarNineBoxPorTimeEvolucao(
      timeId,
      dados => res.json(dados)
    )
  }
)

/* =====================================================
   NINE BOX POR FUNCIONÁRIO (GESTOR + AUTO NO CICLO)
   GET /relatorios/funcionario?nFuncionarioId=1&cicloId=2
===================================================== */
relatoriosRouter.get(
  '/relatorios/funcionario',
  (req: Request, res: Response) => {
    const funcionarioId = Number(req.query.funcionarioId)
    const cicloId = Number(req.query.cicloId)

    if (!funcionarioId || !cicloId) {
      return res.status(400).json({
        erro: 'funcionarioId e cicloId são obrigatórios'
      })
    }

    AvaliacaoRepository.buscarHistorico(
      funcionarioId,
      cicloId,
      historico => {
        const gestor =
          historico.find(h => h.tipo === 'GESTOR') ?? null
        const auto =
          historico.find(h => h.tipo === 'AUTO') ?? null

        res.json({
          ciclo: {
            id: cicloId,
            nome: historico[0]?.ciclo_nome
          },
          gestor,
          auto
        })
      }
    )
  }
)

/* =====================================================
   EVOLUÇÃO NINE BOX DO FUNCIONÁRIO (TODOS OS CICLOS)
   GET /relatorios/funcionario-evolucao?funcionarioId=1
===================================================== */
relatoriosRouter.get(
  '/relatorios/funcionario-evolucao',
  (req: Request, res: Response) => {
    const funcionarioId = Number(req.query.funcionarioId)

    if (!funcionarioId || isNaN(funcionarioId)) {
      return res
        .status(400)
        .json({ erro: 'funcionarioId inválido' })
    }

    AvaliacaoRepository.buscarHistorico(
      funcionarioId,
      undefined,
      historico => res.json(historico)
    )
  }
)

/* =====================================================
   PERGUNTAS E RESPOSTAS (GESTOR + AUTO NO CICLO)
   GET /relatorios/funcionario-perguntas?funcionarioId=1&cicloId=2
===================================================== */
relatoriosRouter.get(
  '/relatorios/funcionario-perguntas',
  (req: Request, res: Response) => {
    const funcionarioId = Number(req.query.funcionarioId)
    const cicloId = Number(req.query.cicloId)

    if (!funcionarioId || !cicloId) {
      return res.status(400).json({
        erro: 'funcionarioId e cicloId são obrigatórios'
      })
    }

    const sql = `
      SELECT
        h.tipo,
        p.enunciado,
        p.eixo,
        p.peso,
        h.nota
      FROM historico_de_avaliacoes h
      JOIN perguntas p ON p.id = h.pergunta
      WHERE h.avaliado = ?
        AND h.ciclo_id = ?
      ORDER BY h.tipo, p.id
    `

    import('../repositories/database').then(({ default: db }) => {
      db.all(
        sql,
        [funcionarioId, cicloId],
        (_err, rows) => {
          const gestor = rows.filter(
            (r: any) => r.tipo === 'GESTOR'
          )
          const auto = rows.filter(
            (r: any) => r.tipo === 'AUTO'
          )

          res.json({ gestor, auto })
        }
      )
    })
  }
)

export default relatoriosRouter
