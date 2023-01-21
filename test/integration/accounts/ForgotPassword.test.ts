import { randomBytes } from 'crypto'
import 'dotenv/config'
import { CreateUser, CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser'
import { ForgotPassword } from '../../../src/application/usecases/accounts/ForgotPassword'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Queue } from '../../../src/infra/queue/Queue'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let forgotPassword: ForgotPassword
let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Bcrypt
let inputUser: CreateUserInput
const queue: Queue = {
    publish: jest.fn(),
    connect: jest.fn(),
    close: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    const sign = new JSONWebToken()
    const random = randomBytes(16).toString('hex')
    inputUser = {
        gh_username: random,
        name: random,
        email: `${random}@test.com`,
        password: random
    }
    forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, queue)
    await userRepository.clean()
})

test('Not should forgot password if email is required', async () => {
    await expect(forgotPassword.execute('')).rejects.toThrowError('email is required')
})

test('Not should forgot password if user not found', async () => {
    await expect(forgotPassword.execute(inputUser.email)).resolves.toBeUndefined()
})

test('Should forgot password', async () => {
    const createUser = new CreateUser(userRepository, hash, queue)
    await createUser.execute(inputUser)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const token = await tokenRepository.find(outputForgotPassword.token)
    expect(token.type).toBe('forgot_password')
})
