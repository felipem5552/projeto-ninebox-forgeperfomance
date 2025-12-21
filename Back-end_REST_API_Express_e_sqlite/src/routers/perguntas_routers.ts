import express from 'express'
import Pergunta from '../models/pergunta'
import perguntasRepository from '../repositories/perguntas_repository'


const perguntasRouter = express.Router()
perguntasRouter.post('/perguntas', (req, res) => {
    const pergunta: Pergunta = req.body
    console.log(req.body)
    perguntasRepository.criar(pergunta, (id) => {
        if (id) {
            res.status(201).location(`/perguntas/${id}`).send()
        } else {
            res.status(400).send()
        }
    })
})
perguntasRouter.get('/perguntas', (req, res) => {
    perguntasRepository.lerTodos((perguntas) => res.json(perguntas))
})
perguntasRouter.get('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    perguntasRepository.ler(id, (pergunta) => {
        if (pergunta) {
            res.json(pergunta)
        } else {
            res.status(404).send()
        }
    })
})
perguntasRouter.put('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    perguntasRepository.atualizar(id, req.body, (notFound) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})
perguntasRouter.delete('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    perguntasRepository.apagar(id, (notFound: boolean) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})
export default perguntasRouter