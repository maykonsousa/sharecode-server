import { UserRepository } from '../../../src/core/domain/UserRepository'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { CreateUser, CreateUserInput } from '../../../src/core/usecases/accounts/CreateUser'
import { GetUser } from '../../../src/core/usecases/accounts/GetUser'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Queue } from '../../../src/infra/queue/Queue'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let createUser: CreateUser
let getUser: GetUser
let inputUser: CreateUserInput
let userRepository: UserRepository

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    const hash = new Bcrypt()
    const queue: Queue = {
        publish: jest.fn(),
        connect: jest.fn(),
        close: jest.fn()
    }
    inputUser = { 
        gh_username: UserDefaults.DEFAULT_USER_USERNAME,
        name: UserDefaults.DEFAULT_USER_NAME,
        email: UserDefaults.DEFAULT_USER_EMAIL,
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    createUser = new CreateUser(userRepository, hash, queue)
    getUser = new GetUser(userRepository)
    await userRepository.clean()
})

test('Should get user', async () => {
    const outputCreateUser = await createUser.execute(inputUser)
    const user = await getUser.execute(outputCreateUser.id)
    expect(user.name).toBe(inputUser.name)
    expect(user.email).toBe(inputUser.email)
    expect(user.gh_username).toBe(inputUser.gh_username)
})
