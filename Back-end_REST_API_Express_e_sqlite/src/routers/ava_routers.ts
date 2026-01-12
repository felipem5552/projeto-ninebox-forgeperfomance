import express from 'express'
import Avaliacao from "../models/modelo_de_avaliacao";
import Pergunta_Teste from '../models/pergunta_teste';
import AvaliacaoRepository from "../repositories/ava_repository";

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

ava_Router.post('/perg', (req, res) => {
    const pergunta: Pergunta_Teste = req.body
    AvaliacaoRepository.inserirPerguntas(pergunta, (id) => {
        if (id) {
            res.status(201).location(`/perg/${id}`).send()
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

export default ava_Router