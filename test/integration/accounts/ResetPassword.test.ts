import { randomBytes } from 'crypto'
import 'dotenv/config'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { ForgotPassword } from '../../../src/application/usecases/accounts/ForgotPassword'
import { ResetPassword } from '../../../src/application/usecases/accounts/ResetPassword'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Ejs } from '../../../src/infra/adapters/Ejs'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { Template } from '../../../src/infra/adapters/Template'
import { Validator } from '../../../src/infra/adapters/Validator'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let sign: Sign
let hash: Hash
let template: Template
let validator: Validator
let inputUser = null

const mailMock = {
    send: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    sign = new JSONWebToken()
    template = new Ejs()
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

test('Should reset password', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mailMock, template)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    await resetPassword.execute({
        token: outputForgotPassword.token,
        password: '123456'
    })
    const [user] = await userRepository.findAll()
    const passwordMatch = hash.decrypt('123456', user.password.getValue())
    expect(passwordMatch).toBeTruthy()
})

test('Not should reset password with old password', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mailMock, template)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign, validator)
    await expect(resetPassword.execute({
        token: outputForgotPassword.token,
        password: inputUser.password
    })).rejects.toThrowError(
        'password should be diff to old password'
    )
})
