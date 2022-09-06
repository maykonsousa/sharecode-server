import 'dotenv/config'
import { randomBytes } from 'crypto'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser/CreateUser'
import { CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import { ResetPassword } from '../../../src/application/usecases/accounts/ResetPassword/ResetPassword'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { UserRepositoryPrisma } from '../../../src/infra/repositories/database/UserRepositoryPrisma'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { ForgotPassword } from '../../../src/application/usecases/accounts/ForgotPassword/ForgotPassword'
import { Template } from '../../../src/infra/adapters/Template'
import { Ejs } from '../../../src/infra/adapters/Ejs'
import { Nodemailer } from '../../../src/infra/adapters/Nodemailer'
import { Mail } from '../../../src/infra/adapters/Mail'
import { TokenRepositoryPrisma } from '../../../src/infra/repositories/database/TokenRepositoryPrisma'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let sign: Sign
let hash: Hash
let mail: Mail
let template: Template
let inputUser: CreateUserInput

const mailMock = {
    send: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    sign = new JSONWebToken()
    mail = new Nodemailer()
    template = new Ejs()
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
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mailMock, template)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign)
    await resetPassword.execute({
        token: outputForgotPassword.token,
        password: '123456'
    })
    const [user] = await userRepository.findAll()
    const passwordMatch = hash.decrypt('123456', user.password.getValue())
    expect(passwordMatch).toBeTruthy()
})

test('Not should reset password with old password', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mailMock, template)
    const outputForgotPassword = await forgotPassword.execute(inputUser.email)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign)
    await expect(resetPassword.execute({
        token: outputForgotPassword.token,
        password: inputUser.password
    })).rejects.toThrowError(
        'password should be diff to old password'
    )
})
