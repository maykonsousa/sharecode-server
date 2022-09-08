import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser/CreateUser'
import { CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Hash
let token: Sign
let inputUser: CreateUserInput

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    token = new JSONWebToken()
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
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token)
    const outputAuthenticateUser = await authenticateUser.execute({
        email: inputUser.email,
        password: inputUser.password
    })
    const tokens = await tokenRepository.findAll()
    expect(outputAuthenticateUser).toHaveProperty('token')
    expect(tokens[0].token).toBe(outputAuthenticateUser.token)
})

test('Not should authenticate user with invalid email', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token)
    await expect(authenticateUser.execute({
        email: 'mail@test.com',
        password: inputUser.password
    })).rejects.toThrowError('invalid login')
})

test('Not should authenticate user with invalid password', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token)
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
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token)
    await expect(authenticateUser.execute(inputAuthenticateUser))
        .rejects.toThrowError('email is required')
})

test('Not should authenticate user with password is required', async () => {
    const inputAuthenticateUser = {
        email: inputUser.email,
        password: ''
    }
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, token)
    await expect(authenticateUser.execute(inputAuthenticateUser))
        .rejects.toThrowError('password is required')
})
