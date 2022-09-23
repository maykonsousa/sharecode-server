import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { Validator } from '../../../src/infra/adapters/Validator'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Hash
let token: Sign
let validator: Validator
let inputUser = null

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    token = new JSONWebToken()
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

test('Should authenticate user', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token, validator)
    const outputAuthenticateUser = await authenticateUser.execute({
        email: inputUser.email,
        password: inputUser.password
    })
    const tokens = await tokenRepository.findAll()
    expect(outputAuthenticateUser).toHaveProperty('token')
    expect(tokens[0].token).toBe(outputAuthenticateUser.token)
})

test('Not should authenticate user with invalid email', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token, validator)
    await expect(authenticateUser.execute({
        email: 'mail@test.com',
        password: inputUser.password
    })).rejects.toThrowError('invalid login')
})

test('Not should authenticate user with invalid password', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token, validator)
    await expect(authenticateUser.execute({
        email: inputUser.email,
        password: '123456'
    })).rejects.toThrowError('invalid login')
})

test('Not should authenticate user with email is required', async () => {
    const inputAuthenticateUser = {
        email: '',
        password: inputUser.password
    }
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token, validator)
    await expect(authenticateUser.execute(inputAuthenticateUser))
        .rejects.toThrowError('email is required')
})

test('Not should authenticate user with password is required', async () => {
    const inputAuthenticateUser = {
        email: inputUser.email,
        password: ''
    }
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token, validator)
    await expect(authenticateUser.execute(inputAuthenticateUser))
        .rejects.toThrowError('password is required')
})
