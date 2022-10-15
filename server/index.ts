import express from 'express'
import cors from 'cors'
import path from 'path'
import imageRoute from './api/routes/imageRoute'
import TodoSchema from './models/Todo'
import db from './db'
import dotenv from 'dotenv'

// load env files
dotenv.config()

const app = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// const corsOptions = {
//     origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//     allowedHeaders: ['Content-Type']
// }
// app.use(cors(corsOptions))
app.use(cors())

app.get('/api', (req, res) => {
    return res.status(200).json({ msg: 'hello express' })
})

app.get('/api/profile', async (req, res) => {
    return res.status(200).json({ msg: 'this is profile' })
})

app.get('/api/data', async (req, res) => {
    await db.connect()

    const todoDocuments = await TodoSchema.find()

    const todoList = todoDocuments ? todoDocuments.map((doc: {
        todo: string
    }) => {
        return db.convertDocToObj(doc)
    }) : []

    await db.disconnect()

    if(!todoDocuments) return res.status(404).json({ msg: 'no todo'})

    return res.status(200).json({ result: todoList})

    // return res.status(200).json({ msg: 'ok'})
})

app.use('/api/images', imageRoute)

const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`NODE_ENV is ${String(process.env.NODE_ENV)}`)
    console.log(`server running port 5000 at http://localhost:${port}`)
})
