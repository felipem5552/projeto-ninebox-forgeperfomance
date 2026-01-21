import express from 'express'
import cors from 'cors'

import funcionariosRouter from './routers/funcionarios_routers'
import ava_Router from './routers/ava_routers'
import relatoriosRouter from './routers/relatorios_router'
import authRouter from './routers/auth_router'
import ciclosRouter from './routers/ciclos_router'
import timesRouter from './routers/times_router'

const PORT = process.env.PORT || 4000
const HOSTNAME = process.env.HOSTNAME || 'http://localhost'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Bem-vindo!')
})

//- ROTAS
app.use('/api', authRouter)
app.use('/api', funcionariosRouter)
app.use('/api', ava_Router)
app.use('/api', relatoriosRouter)
app.use('/api', ciclosRouter)
app.use('/api', timesRouter)
//- ERRO 404
app.use((req, res) => {
  res.status(404).end()
})

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`)
})
