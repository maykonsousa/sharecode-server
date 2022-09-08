import { randomBytes } from 'crypto'
import { CreateSuperUser } from '../../../src/application/usecases/accounts/CreateSuperUser/CreateSuperUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser/CreateUser'
import { CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let hash: Hash
let inputUser: CreateUserInput

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    hash = new Bcrypt()
    const random = randomBytes(16).toString('hex')
    inputUser = {
        gh_username: random,
        name: random,
        email: `${random}@test.com`,
        password: random
    }
    await userRepository.clean()
})

test('Should create a user', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const [user] = await userRepository.findAll()
    expect(user.type).toBe('user')
})

test('Should create a super user', async () => {
    const createSuperUser = new CreateSuperUser(userRepository, hash)
    await createSuperUser.execute(inputUser)
    const [user] =  await userRepository.findAll()
    expect(user.type).toBe('admin')
})

test('not should create a user with already exists', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    await expect(createUser.execute(inputUser)).rejects.toThrowError(
        'user already exists'
    )
})

test('not should create a user with gh_username is required', async () => {
    const createUser = new CreateUser(userRepository, hash)
    inputUser.gh_username = ''
    await expect(createUser.execute(inputUser)).rejects.toThrowError(
        'gh_username is required'
    )
})

test('not should create a user with name is required', async () => {
    const createUser = new CreateUser(userRepository, hash)
    inputUser.name = ''
    await expect(createUser.execute(inputUser)).rejects.toThrowError(
        'name is required'
    )
})

test('not should create a user with email is required', async () => {
    const createUser = new CreateUser(userRepository, hash)
    inputUser.email = ''
    await expect(createUser.execute(inputUser)).rejects.toThrowError(
        'email is required'
    )
})

test('not should create a user with password is required', async () => {
    const createUser = new CreateUser(userRepository, hash)
    inputUser.password = ''
    await expect(createUser.execute(inputUser)).rejects.toThrowError(
        'password is required'
    )
})
