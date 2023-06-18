import { NextFunction, Request, Response } from 'express'
import { CustomError } from '../../../core/exceptions/CustomError'
import { JSONWebToken } from '../../adapters/JSONWebToken'

export interface CustomRequest extends Request {
    token: string;
}

export default (req: CustomRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers
    if (!authorization) throw new CustomError(400, 'token is required')
    const [, token] = authorization.split(' ')
    try {
        const jwt = new JSONWebToken()
        jwt.decode(token)
        req.token = token
        next()
    } catch (err) {
        throw new CustomError(401, 'invalid token')
    }
}
