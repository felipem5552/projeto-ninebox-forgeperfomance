import express from 'express'
import Avaliacao from "../models/modelo_de_avaliacao";
import Pergunta from '../models/pergunta';
import AvaliacaoRepository from "../repositories/ava_repository";
import Instancia_de_Avaliacao from '../models/instancia_de_avaliacao';

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
    const Instancia: Instancia_de_Avaliacao = req.body
    AvaliacaoRepository.Avaliar(Instancia, (Erro) => {
        if (!Erro) {
            console.log("A")
            res.status(201).send()
        }
        else {
            res.status(400).send()
        }
    })
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
export default ava_Router