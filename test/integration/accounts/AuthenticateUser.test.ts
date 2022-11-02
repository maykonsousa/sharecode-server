import 'dotenv/config'
import { randomBytes } from 'crypto'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
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

test('Not should authenticate user if invalid email', async () => {
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    await expect(authenticateUser.execute(inputUser))
        .rejects.toThrowError('invalid login')
})

test('Not should authenticate user if invalid password', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    inputUser.password = '12345'
    await expect(authenticateUser.execute(inputUser))
        .rejects.toThrowError('invalid login')
})

test('Should authenticate user', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    expect(sign.decode(outputAuthenticateUser.token)).toBeTruthy()
})
