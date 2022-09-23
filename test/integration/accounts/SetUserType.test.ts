import { randomBytes } from 'crypto'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { SetUserType } from '../../../src/application/usecases/accounts/SetUserType'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { Validator } from '../../../src/infra/adapters/Validator'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let hash: Hash
let validator: Validator
let inputUser = null

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

test('Should update user type', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const users = await userRepository.findAll()
    const inputType = {
        id: users[0].id,
        type: 'admin',
    }
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute(inputType)
    const user = await userRepository.find(inputType.id)
    expect(user?.type).toBe('admin')
})
