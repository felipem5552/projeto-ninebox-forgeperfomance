import express, { Request, Response } from 'express'
import Funcionario from '../models/funcionario'
import funcionariosRepository from '../repositories/funcionarios_repository'
import { emailValido } from '../services/validar_email'
import AvaliacaoRepository from '../repositories/ava_repository'
import { enviarConviteAvaliacao } from '../services/email_service'

const funcionariosRouter = express.Router()

/* =========================
   ➕ CADASTRAR FUNCIONÁRIO
========================= */
funcionariosRouter.post(
  '/funcionarios',
  (req: Request, res: Response) => {
    const funcionario: Funcionario = req.body

    // 🔹 Valida campos obrigatórios
    if (
      !funcionario.nome ||
      !funcionario.email ||
      !funcionario.time ||
      !funcionario.privilegios
    ) {
      return res.status(400).json({
        erro: 'Campos obrigatórios não informados'
      })
    }

    // 🔹 Valida e-mail
    if (!emailValido(funcionario.email)) {
      return res.status(400).json({
        erro: 'E-mail inválido'
      })
    }

    // 🔹 Verifica se e-mail já existe
    funcionariosRepository.verificarEmailExistente(
      funcionario.email,
      (existe: boolean) => {
        if (existe) {
          return res.status(409).json({
            erro: 'E-mail já cadastrado'
          })
        }

        // 🔹 Cria funcionário
        funcionariosRepository.criar(funcionario, (id) => {
          if (!id) {
            return res.status(400).json({
              erro: 'Erro ao cadastrar funcionário'
            })
          }

          return res.status(201).json({ id })
        })
      }
    )
  }
)

/* =========================
   📄 LISTAR FUNCIONÁRIOS
========================= */
funcionariosRouter.get(
  '/funcionarios',
  (_req: Request, res: Response) => {
    funcionariosRepository.lerTodos(funcionarios =>
      res.json(funcionarios)
    )
  }
)

/* =========================
   🔍 BUSCAR POR ID
========================= */
funcionariosRouter.get(
  '/funcionarios/:id',
  (req: Request, res: Response) => {
    const id = Number(req.params.id)

    funcionariosRepository.ler(id, funcionario => {
      if (!funcionario) {
        return res.status(404).json({
          erro: 'Funcionário não encontrado'
        })
      }

      res.json(funcionario)
    })
  }
)

/* =========================
   ✏️ ATUALIZAR
========================= */
funcionariosRouter.put(
  '/funcionarios/:id',
  (req: Request, res: Response) => {
    const id = Number(req.params.id)

    funcionariosRepository.atualizar(
      id,
      req.body,
      notFound => {
        if (notFound) {
          return res.status(404).json({
            erro: 'Funcionário não encontrado'
          })
        }

        res.status(204).send()
      }
    )
  }
)

/* =========================
   🗑️ EXCLUIR
========================= */
funcionariosRouter.delete(
  '/funcionarios/:id',
  (req: Request, res: Response) => {
    const id = Number(req.params.id)

    funcionariosRepository.apagar(id, notFound => {
      if (notFound) {
        return res.status(404).json({
          erro: 'Funcionário não encontrado'
        })
      }

      res.status(204).send()
    })
  }
)

/* ======================================================
   📌 CONSULTAS DO FUNCIONÁRIO
====================================================== */

// 🔹 Histórico de avaliações
funcionariosRouter.get('/funcionarios/:id/historico', (req, res) => {
  const avaliadoId = Number(req.params.id)

  if (isNaN(avaliadoId)) {
    return res.status(400).json({ erro: 'ID inválido' })
  }

  AvaliacaoRepository.buscarHistorico(avaliadoId, historico => {
    res.json(historico)
  })
})

// 🔹 Último modelo usado pelo funcionário
funcionariosRouter.get('/funcionarios/:id/ultimo-modelo', (req, res) => {
  const funcionarioId = Number(req.params.id)

  if (isNaN(funcionarioId)) {
    return res.status(400).json({ erro: 'ID inválido' })
  }

  AvaliacaoRepository.buscarUltimoModeloDoFuncionario(
    funcionarioId,
    modeloId => {
      if (!modeloId) {
        return res.status(404).json({
          erro: 'Funcionário ainda não foi avaliado'
        })
      }

      res.json({ modeloId })
    }
  )
})


 //  Envio de E-Mails

// Enviar convites para todos os funcionários cadastrados
funcionariosRouter.post('/funcionarios/enviar-convites', (req: Request, res: Response) => {
  funcionariosRepository.lerTodos(async (funcionarios) => {
    
    if (!funcionarios || funcionarios.length === 0) {
      return res.status(404).json({ erro: 'Nenhum funcionário encontrado para envio' })
    }

    const resultados = []

    for (const f of funcionarios) {
      // Chama o serviço de e-mail passando pelo banco de dados
      const infoEnvio = await enviarConviteAvaliacao(f.email, f.nome)
      resultados.push(infoEnvio)
    }

    res.json({
      mensagem: 'Processo de envio finalizado',
      relatorio: resultados
    })
  })
})

export default funcionariosRouter
