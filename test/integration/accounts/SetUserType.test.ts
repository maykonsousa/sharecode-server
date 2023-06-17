import 'dotenv/config'
import { UserRepository } from '../../../src/core/domain/UserRepository'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { CreateUser } from '../../../src/core/usecases/accounts/CreateUser'
import { SetUserType } from '../../../src/core/usecases/accounts/SetUserType'
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
    inputUser = { 
        gh_username: UserDefaults.DEFAULT_USER_USERNAME,
        name: UserDefaults.DEFAULT_USER_NAME,
        email: UserDefaults.DEFAULT_USER_EMAIL,
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    await userRepository.clean()
})

test('Not should set rule admin if user not found', async () => {
    const setUserType = new SetUserType(userRepository, validator)
    await expect(setUserType.execute({
        id: '1234',
        rule: 'admin'
    })).rejects.toThrowError('user not found')
})

test('Should set rule admin', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        rule: 'admin'
    })
    const user = await userRepository.find(outputCreateUser.id)
    expect(user.getRule()).toBe('admin')
})
