import { randomBytes } from 'crypto'
import 'dotenv/config'
import { PostRepository } from '../../../src/core/domain/PostRepository'
import { TokenRepository } from '../../../src/core/domain/TokenRepository'
import { UserRepository } from '../../../src/core/domain/UserRepository'
import { UserDefaults } from '../../../src/core/domain/defaults/UserDefaults'
import { AuthenticateUser } from '../../../src/core/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/core/usecases/accounts/CreateUser'
import { SetUserType } from '../../../src/core/usecases/accounts/SetUserType'
import { CreatePost } from '../../../src/core/usecases/posts/CreatePost'
import { FindPosts } from '../../../src/core/usecases/posts/FindPosts'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Pagination } from '../../../src/infra/adapters/Pagination'
import { Sign } from '../../../src/infra/adapters/Sign'
import { Validator } from '../../../src/infra/adapters/Validator'
import { Queue } from '../../../src/infra/queue/Queue'
import { PostRepositoryMemory } from '../../../src/infra/repositories/memory/PostRepositoryMemory'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let userRepository: UserRepository
let tokenRepository: TokenRepository
let postRepository: PostRepository
let hash: Bcrypt
let sign: Sign
let validator: Validator
let pagination: Pagination
let inputUser: any
let inputPost: any

const mockedQueue: Queue = {
    publish: jest.fn(),
    connect: jest.fn(),
    close: jest.fn()
}

beforeEach(async () => {
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    postRepository = new PostRepositoryMemory()
    hash = new Bcrypt()
    sign = new JSONWebToken()
    validator = new Validator()
    pagination = new Pagination()
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

test('Not should find posts if missing param', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const setUserType = new SetUserType(userRepository)
    await setUserType.execute({
        id: outputCreateUser.id,
        rule: 'admin'
    })
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    await createPost.execute(inputPost)
    const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
    await expect(findPosts.execute({
        token: ''
    })).rejects.toThrowError('token is required')
})

test('Not should find posts if invalid token', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const setUserType = new SetUserType(userRepository)
    await setUserType.execute({
        id: outputCreateUser.id,
        rule: 'admin'
    })
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    await createPost.execute(inputPost)
    const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
    await expect(findPosts.execute({
        token: '1234'
    })).rejects.toThrowError('invalid token')
})

test('Not should find posts if user not found', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const setUserType = new SetUserType(userRepository)
    await setUserType.execute({
        id: outputCreateUser.id,
        rule: 'admin'
    })
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    await createPost.execute(inputPost)
    const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
    await userRepository.clean()
    await expect(findPosts.execute({
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('user not found')
})

test('Not should find posts if not allowed', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    await createPost.execute(inputPost)
    const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
    await expect(findPosts.execute({
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('not allowed')
})

test('Should find posts', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const setUserType = new SetUserType(userRepository)
    await setUserType.execute({
        id: outputCreateUser.id,
        rule: 'admin'
    })
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    await createPost.execute(inputPost)
    const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
    const posts = await findPosts.execute({
        token: outputAuthenticateUser.token
    })
    expect(posts).toHaveLength(1)
})
