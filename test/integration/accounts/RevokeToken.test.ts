import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { RevokeToken } from '../../../src/application/usecases/accounts/RevokeToken'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { Validator } from '../../../src/infra/adapters/Validator'
import { Queue } from '../../../src/infra/queue/Queue'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Bcrypt
let sign: Sign
let validator: Validator
let inputUser: any

const mockedQueue: Queue = {
    publish: jest.fn(),
    connect: jest.fn(),
    close: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    sign = new JSONWebToken()
    validator = new Validator()
    const random = randomBytes(16).toString('hex')
    inputUser = {
        gh_username: random,
        name: random,
        email: `${random}@test.com`,
        password: random
    }
    await userRepository.clean()
})

test('Not should revoke token if missing param', async () => {
    const revokeToken = new RevokeToken(tokenRepository, sign)
    await expect(revokeToken.execute('')).rejects.toThrowError('id is required')
})

test('Not should revoke token if token not found', async () => {
    const revokeToken = new RevokeToken(tokenRepository, sign)
    await expect(revokeToken.execute('1234')).rejects.toThrowError('token not found')
})

test('Not should revoke token if token not found', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const ouputAuthenticateUser = await authenticateUser.execute(inputUser)
    const revokeToken = new RevokeToken(tokenRepository, sign)
    await revokeToken.execute(ouputAuthenticateUser.refreshToken)
    await expect(revokeToken.execute(ouputAuthenticateUser.refreshToken))
        .rejects.toThrowError('token already revoked')
})

test('Should revoke token', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const ouputAuthenticateUser = await authenticateUser.execute(inputUser)
    const revokeToken = new RevokeToken(tokenRepository, sign)
    const outputRevokeToken = await revokeToken.execute(ouputAuthenticateUser.refreshToken)
    expect(outputRevokeToken).toHaveProperty('token')
})
