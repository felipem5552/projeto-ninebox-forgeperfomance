import express from 'express'
import Funcionario from '../models/funcionario'
import funcionariosRepository from '../repositories/funcionarios_repository'
import { emailValido } from '../services/validar_email'


const funcionariosRouter = express.Router()

// Define se usuário existe no banco de dados
funcionariosRouter.post('/funcionarios', (req, res) => {
    const funcionario: Funcionario = req.body
      if (!emailValido(funcionario.email)) {
        return res.status(400).json({
        erro: 'E-mail inválido'
        })
     }
    funcionariosRepository.verificarEmailExistente(
        funcionario.email,
        (existe: boolean) => {
        if (existe) {
            return res.status(409).json({
            erro: 'E-mail já cadastrado'
            })
        }
        })
    console.log(req.body)  
    
    // Utiliza a requisuição POST
    funcionariosRepository.criar(funcionario, (id) => {
        if (id) {
            res.status(201).location(`/funcionarios/${id}`).send()
        } else {
            console.log("Erro")
            res.status(400).send()
        }
    })
    }
    )
    
// Utiliza a requisição GET
funcionariosRouter.get('/funcionarios', (req, res) => {
    funcionariosRepository.lerTodos((funcionarios) => res.json(funcionarios))
})
funcionariosRouter.get('/funcionarios/:id', (req, res) => {
    const id: number = +req.params.id
    funcionariosRepository.ler(id, (funcionario) => {
        if (funcionario) {
            res.json(funcionario)
        } else {
            res.status(404).send()
        }
    })
})

// Utiliza a requisição UPDATE
funcionariosRouter.put('/funcionarios/:id', (req, res) => {
    const id: number = +req.params.id
    funcionariosRepository.atualizar(id, req.body, (notFound) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})

// Utiliza a requisição DELETE
funcionariosRouter.delete('/funcionarios/:id', (req, res) => {
    const id: number = +req.params.id
    funcionariosRepository.apagar(id, (notFound) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})

export default funcionariosRouter