import express from 'express'
import cors from 'cors'
import funcionariosRouter from './routers/funcionarios_routers'
import ava_f_Router from './routers/ava_f_routers'


const PORT = process.env.PORT || 4000
const HOSTNAME = process.env.HOSTNAME || 'http://localhost'
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Bem-vindo!')
})

app.use(cors({
    origin: ['http://localhost:3000']
}))

app.use('/api', ava_f_Router)
app.use('/api', funcionariosRouter)


app.use((req, res) => {
    res.status(404)
})

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`)
})