import express from 'express'
import Funcionario from '../models/funcionario'
import funcionariosRepository from '../repositories/funcionarios_repository'


const funcionariosRouter = express.Router()
funcionariosRouter.post('/funcionarios', (req, res) => {
    const funcionario: Funcionario = req.body
    funcionariosRepository.criar(funcionario, (id) => {
        if (id) {
            res.status(201).location(`/funcionarios/${id}`).send()
        } else {
            res.status(400).send()
        }
    })
})
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