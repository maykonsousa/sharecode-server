import { randomBytes } from 'crypto'
import { PostRepository } from '../../../src/core/domain/PostRepository'
import { UserRepository } from '../../../src/core/domain/UserRepository'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { CreateUser } from '../../../src/core/usecases/accounts/CreateUser'
import { CreatePost } from '../../../src/core/usecases/posts/CreatePost'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Validator } from '../../../src/infra/adapters/Validator'
import { Queue } from '../../../src/infra/queue/Queue'
import { PostRepositoryMemory } from '../../../src/infra/repositories/memory/PostRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let postRepository: PostRepository
let hash: Bcrypt
let validator: Validator
let inputUser: any
let inputPost: any

const mockedQueue: Queue = {
    publish: jest.fn(),
    connect: jest.fn(),
    close: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    postRepository = new PostRepositoryMemory()
    hash = new Bcrypt()
    validator = new Validator()
    const random = randomBytes(16).toString('hex')
    inputUser = { 
        gh_username: UserDefaults.DEFAULT_USER_USERNAME,
        name: UserDefaults.DEFAULT_USER_NAME,
        email: UserDefaults.DEFAULT_USER_EMAIL,
        password: UserDefaults.DEFAULT_USER_PASSWORD,
    }
    inputPost = {
        title: random,
        description: random,
        video_id: random
    }
    await userRepository.clean()
    await postRepository.clean()
})

test('Not should create post if user not found', async () => {
    const createPost = new CreatePost(postRepository, userRepository, validator)
    inputPost.user_id = '1234'
    await expect(createPost.execute(inputPost))
        .rejects.toThrowError('user not found')
})

test('Should create post', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    inputPost.user_id = outputCreateUser.id
    await createPost.execute(inputPost)
    const posts = await postRepository.findByUser(outputCreateUser.id)
    expect(posts).toHaveLength(1)
})
