import 'dotenv/config'
import { randomBytes } from 'crypto'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser/CreateUser'
import { CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import { ForgotPassword } from '../../../src/application/usecases/accounts/ForgotPassword/ForgotPassword'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Ejs } from '../../../src/infra/adapters/Ejs'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Mail } from '../../../src/infra/adapters/Mail'
import { Nodemailer } from '../../../src/infra/adapters/Nodemailer'
import { Template } from '../../../src/infra/adapters/Template'
import { Sign } from '../../../src/infra/adapters/Sign'
import { UserRepositoryPrisma } from '../../../src/infra/repositories/database/UserRepositoryPrisma'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { TokenRepositoryPrisma } from '../../../src/infra/repositories/database/TokenRepositoryPrisma'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let sign: Sign
let hash: Hash
let mail: Mail
let template: Template
let inputUser: CreateUserInput

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

test('Should forgot password', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const mailMock: Mail = {
        send: jest.fn(async (message) => {
            expect(message.to.name).toBe(inputUser.name)
            expect(message.to.address).toBe(inputUser.email)
        })
    }
    const forgotPassword = new ForgotPassword(
        userRepository,
        tokenRepository,
        sign,
        mailMock,
        template
    )
    const output = await forgotPassword.execute(inputUser.email)
    const tokens = await tokenRepository.findAll()
    expect(mailMock.send).toHaveBeenCalled()
    expect(output).toHaveProperty('token')
    expect(tokens[0].id).toBe(output.token)
})

test('Not should forgot password if email is required', async () => {
    const forgotPassword = new ForgotPassword(
        userRepository,
        tokenRepository,
        sign,
        mail,
        template
    )
    await expect(forgotPassword.execute(''))
        .rejects.toThrowError('email is required')
})