import { randomBytes } from 'crypto'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { SetUserType } from '../../../src/application/usecases/accounts/SetUserType'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost'
import { PostRepository } from '../../../src/domain/repositories/PostRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { Validator } from '../../../src/infra/adapters/Validator'
import { PostRepositoryMemory } from '../../../src/infra/repositories/memory/PostRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let postRepository: PostRepository
let userRepository: UserRepository
let hash: Hash
let validator: Validator
let inputUser = null
let inputPost = null

beforeEach(async () => {
    postRepository = new PostRepositoryMemory()
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
    inputPost = {
        title: random,
        description: random,
        video_id: random,
        user_id: random
    }
    await userRepository.clean()
    await postRepository.clean()
})

test('Should create post with user type', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository,validator)
    const users = await userRepository.findAll()
    inputPost.user_id = users[0].id
    await createPost.execute(inputPost)
    const posts = await postRepository.findAll()
    expect(posts[0].is_active).toBeFalsy()
})

test('Should create post with admin type', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository,validator)
    const setUserType = new SetUserType(userRepository, validator)
    const beforeUser = await userRepository.findAll()
    await setUserType.execute({
        id: beforeUser[0].id,
        type: 'admin'
    })
    const afterUser = await userRepository.findAll()
    inputPost.user_id = afterUser[0].id
    await createPost.execute(inputPost)
    const posts = await postRepository.findAll()
    expect(posts[0].is_active).toBeTruthy()
})
