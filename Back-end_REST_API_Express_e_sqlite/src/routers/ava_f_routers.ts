import express from 'express'
import Pergunta from '../models/pergunta'
import ava_funcionariosRepository from '../repositories/ava_funcionarios_repository'


const ava_f_Router = express.Router()
ava_f_Router.post('/perguntas', (req, res) => {
    const pergunta: Pergunta = req.body
    console.log(req.body)
    ava_funcionariosRepository.criar_avaliacao(pergunta, (id) => {
        if (id) {
            res.status(201).location(`/perguntas/${id}`).send()
        } else {
            console.log("Erro")
            res.status(400).send()
        }
    })
})
ava_f_Router.get('/perguntas/max', (req, res) => {
    ava_funcionariosRepository.lerMax((perguntas) => res.json(perguntas))
})
ava_f_Router.get('/perguntas', (req, res) => {
    ava_funcionariosRepository.lerTodos((perguntas) => res.json(perguntas))
})
ava_f_Router.get('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    ava_funcionariosRepository.ler(id, (pergunta) => {
        if (pergunta) {
            res.json(pergunta)
        } else {
            res.status(404).send()
        }
    })
})
ava_f_Router.put('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    ava_funcionariosRepository.atualizar(id, req.body, (notFound) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})
ava_f_Router.delete('/perguntas/:id', (req, res) => {
    const id: number = +req.params.id
    ava_funcionariosRepository.apagar(id, (notFound: boolean) => {
        if (notFound) {
            res.status(404).send()
        } else {
            res.status(204).send()
        }
    })
})
export default ava_f_Router