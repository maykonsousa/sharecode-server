import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../../../application/exceptions/CustomError'
import { JSONWebToken } from '../../../infra/adapters/JSONWebToken'

export default (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers
    if (!authorization) throw new CustomError(400, 'token is required')
    const [, token] = authorization.split(' ')
    try {
        const jwt = new JSONWebToken()
        jwt.decode(token)
        next()
    } catch (err) {
        throw new CustomError(401, 'invalid token')
    }
}
