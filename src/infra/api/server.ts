import 'dotenv/config'
import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import { CustomError } from '../../application/exceptions/CustomError'

import AuthRoute from './routes/AuthRoute'
import PostRoute from './routes/PostRoute'
import UserRoute from './routes/UserRoute'

const app = express()
const port = process.env.port || 3000

app.use(express.json())
app.use(cors())

app.use('/v1/', UserRoute)
app.use('/v1/', PostRoute)
app.use('/v1/', AuthRoute)

app.use((req, res, next) => {
    res.status(404).json({
        message: 'resource not found',
        status: res.statusCode,
    })
    next()
})

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500
    const message = err.message || 'internal server error'
    res.status(status).json({
        message,
        status
    })
    next()
})

app.listen(port, () => console.log(`Starting server in ${port}`))
