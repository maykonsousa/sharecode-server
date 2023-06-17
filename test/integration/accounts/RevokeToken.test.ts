import 'dotenv/config'
import { TokenRepository } from '../../../src/core/domain/TokenRepository'
import { UserRepository } from '../../../src/core/domain/UserRepository'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { AuthenticateUser } from '../../../src/core/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/core/usecases/accounts/CreateUser'
import { RevokeToken } from '../../../src/core/usecases/accounts/RevokeToken'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { Queue } from '../../../src/infra/queue/Queue'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Bcrypt
let sign: Sign
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
    inputUser = { 
        gh_username: UserDefaults.DEFAULT_USER_USERNAME,
        name: UserDefaults.DEFAULT_USER_NAME,
        email: UserDefaults.DEFAULT_USER_EMAIL,
        password: UserDefaults.DEFAULT_USER_PASSWORD,
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
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const ouputAuthenticateUser = await authenticateUser.execute(inputUser)
    const revokeToken = new RevokeToken(tokenRepository, sign)
    await revokeToken.execute(ouputAuthenticateUser.refreshToken)
    await expect(revokeToken.execute(ouputAuthenticateUser.refreshToken))
        .rejects.toThrowError('token already revoked')
})

test('Should revoke token', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const ouputAuthenticateUser = await authenticateUser.execute(inputUser)
    const revokeToken = new RevokeToken(tokenRepository, sign)
    const outputRevokeToken = await revokeToken.execute(ouputAuthenticateUser.refreshToken)
    expect(outputRevokeToken).toHaveProperty('token')
})
