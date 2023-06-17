import 'dotenv/config'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { AuthenticateUser, AuthenticateUserInput } from '../../../src/core/usecases/accounts/AuthenticateUser'
import { CreateUser, CreateUserInput } from '../../../src/core/usecases/accounts/CreateUser'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Queue } from '../../../src/infra/queue/Queue'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let createUser: CreateUser
let authenticateUser: AuthenticateUser
let inputCreateUser: CreateUserInput

beforeEach(async () => {
    const userRepository = new UserRepositoryMemory()
    const tokenRepository = new TokenRepositoryMemory()
    const hash = new Bcrypt()
    const sign = new JSONWebToken()
    const queue: Queue = {
        publish: jest.fn(),
        connect: jest.fn(),
        close: jest.fn()
    }
    inputCreateUser = {
        gh_username: UserDefaults.DEFAULT_USER_USERNAME,
        name: UserDefaults.DEFAULT_USER_NAME,
        email: UserDefaults.DEFAULT_USER_EMAIL,
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    createUser = new CreateUser(userRepository, hash, queue)
    authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    await userRepository.clean()
})

test('Not should authenticate user if email is required', async () => {
    const inputAuthenticateUser: AuthenticateUserInput = {
        email: '',
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    expect(() => authenticateUser.execute(inputAuthenticateUser)).rejects.toThrowError('email is required')
})

test('Not should authenticate user if password is required', async () => {
    const inputAuthenticateUser: AuthenticateUserInput = {
        email: 'cont.juliano@outlook.com',
        password: '',
    }
    expect(() => authenticateUser.execute(inputAuthenticateUser)).rejects.toThrowError('password is required')
})

test('Should return a invalid login if email is invalid', async () => {
    const inputAuthenticateUser: AuthenticateUserInput = {
        email: 'cont.juliano@outlook.com',
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    expect(() => authenticateUser.execute(inputAuthenticateUser)).rejects.toThrowError('invalid login')
})

test('Should return a invalid login if password is invalid', async () => {
    await createUser.execute(inputCreateUser)
    const inputAuthenticateUser: AuthenticateUserInput = {
        email: inputCreateUser.email,
        password: '@P4ssw0rd',
    }
    expect(() => authenticateUser.execute(inputAuthenticateUser)).rejects.toThrowError('invalid login')
})

test('Should authenticate user', async () => {
    await createUser.execute(inputCreateUser)
    const inputAuthenticateUser: AuthenticateUserInput = {
        email: inputCreateUser.email,
        password: inputCreateUser.password,
    }
    const outputAuthenticateUser = await authenticateUser.execute(inputAuthenticateUser)
    expect(outputAuthenticateUser).toHaveProperty('token')
})
