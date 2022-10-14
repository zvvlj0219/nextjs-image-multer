import express from 'express'
import cors from 'cors'
import path from 'path'

const app = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type']
}
app.use(cors(corsOptions))

app.get('/api', (req, res) => {
    return res.status(200).json({ msg: 'hello express' })
})

app.get('/api/profile', (req, res) => {
    return res.status(200).json({ msg: 'hello profile' })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`NODE_ENV is ${String(process.env.NODE_ENV)}`)
    console.log(`server running port 5000 at http://localhost:${port}`)
})
