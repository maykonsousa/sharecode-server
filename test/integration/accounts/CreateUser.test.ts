import { randomBytes } from 'crypto'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Validator } from '../../../src/infra/adapters/Validator'
import { Queue } from '../../../src/infra/queue/Queue'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let hash: Bcrypt
let validator: Validator
let inputUser: any

const mockedQueue: Queue = {
    publish: jest.fn(),
    connect: jest.fn(),
    close: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    hash = new Bcrypt()
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

test('Not sould create user if user already exists', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    await createUser.execute(inputUser)
    await expect(createUser.execute(inputUser))
        .rejects.toThrowError('user already exists')
})

test('Not sould create user if missing param', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    inputUser.name = ''
    await expect(createUser.execute(inputUser))
        .rejects.toThrowError('name is required')
})

test('Should create user', async () => {
    const createUser = new CreateUser(userRepository, hash, validator, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const user = await userRepository.find(outputCreateUser.id)
    expect(user.name).toBe(inputUser.name)
})
