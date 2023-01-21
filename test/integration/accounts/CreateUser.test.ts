import { randomBytes } from 'crypto'
import { CreateUser, CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Queue } from '../../../src/infra/queue/Queue'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'


let createUser: CreateUser
let inputUser: CreateUserInput
let userRepository: UserRepository

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    const hash = new Bcrypt()
    const random = randomBytes(16).toString('hex')
    const queue: Queue = {
        publish: jest.fn(),
        connect: jest.fn(),
        close: jest.fn()
    }    
    inputUser = {
        gh_username: random,
        name: random,
        email: `${random}@test.com`,
        password: random
    }
    createUser = new CreateUser(userRepository, hash, queue)
    await userRepository.clean()
})

test('Not sould create user if user already exists', async () => {
    await createUser.execute(inputUser)
    await expect(createUser.execute(inputUser))
        .rejects.toThrowError('user already exists')
})

test('Not sould create user if missing param', async () => {
    inputUser.name = ''
    await expect(createUser.execute(inputUser))
        .rejects.toThrowError('name is required')
})

test('Should create user', async () => {
    const outputCreateUser = await createUser.execute(inputUser)
    const user = await userRepository.find(outputCreateUser.id)
    expect(user.name).toBe(inputUser.name)
})
