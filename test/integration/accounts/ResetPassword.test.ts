import 'dotenv/config'
import { TokenRepository } from '../../../src/core/domain/TokenRepository'
import { UserRepository } from '../../../src/core/domain/UserRepository'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { AuthenticateUser } from '../../../src/core/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/core/usecases/accounts/CreateUser'
import { ForgotPassword } from '../../../src/core/usecases/accounts/ForgotPassword'
import { ResetPassword } from '../../../src/core/usecases/accounts/ResetPassword'
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
    inputUser = { 
        gh_username: UserDefaults.DEFAULT_USER_USERNAME,
        name: UserDefaults.DEFAULT_USER_NAME,
        email: UserDefaults.DEFAULT_USER_EMAIL,
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    await userRepository.clean()
})

test('Not should reset password if token not found', async () => {
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    await expect(resetPassword.execute({
        token: '123456',
        password: inputUser.password
    })).rejects.toThrowError('token not found')
})

test('Not should reset password if not allowed', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    await authenticateUser.execute(inputUser)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    const [token] = await tokenRepository.findAll()
    await expect(resetPassword.execute({
        token: token.id,
        password: inputUser.password
    })).rejects.toThrowError('not allowed')
})

test('Not should reset password if user not found', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mockedQueue)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    await userRepository.clean()
    await expect(resetPassword.execute({
        token: outputForgotPassword.token,
        password: inputUser.password
    })).rejects.toThrowError('user not found')
})

test('Not should reset password if password should be diff to old password', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mockedQueue)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    await expect(resetPassword.execute({
        token: outputForgotPassword.token,
        password: inputUser.password
    })).rejects.toThrowError('password should be diff to old password')
})

test('Should reset password', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mockedQueue)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    await resetPassword.execute({
        token: outputForgotPassword.token,
        password: '@P4ssw0rd'
    })
    const user = await userRepository.find(outputCreateUser.id)
    expect(hash.decrypt('@P4ssw0rd', user.getPassword())).toBeTruthy()
})
