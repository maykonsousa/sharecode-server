import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { SetUserType } from '../../../src/application/usecases/accounts/SetUserType'
import { ActivePost } from '../../../src/application/usecases/posts/ActivePost'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost'
import { PostRepository } from '../../../src/domain/repositories/PostRepository'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
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
        video_id: random
    }
    await userRepository.clean()
    await postRepository.clean()
})

test('Not should active post if post not found', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    await expect(activePost.execute({
        id: '1234',
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('post not found')
})

test('Not should active post if post already activated', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    await activePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })
    await expect(activePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('post already activated')
})

test('Not should active post if invalid token', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const outputCreatePost = await createPost.execute(inputPost)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    await expect(activePost.execute({
        id: outputCreatePost.id,
        token: '1234'
    })).rejects.toThrowError('invalid token')
})

test('Not should active post if invalid token', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: outputAuthenticateUser.token
    })
    await userRepository.clean()
    await expect(activePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('user not found')
})

test('Not should active post if not allowed', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    await expect(activePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('not allowed')
})

test('Should active post by user', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    await activePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })
    const post = await postRepository.find(outputCreatePost.id)
    expect(post.is_active).toBeTruthy()
})

test('Should create actived post by admin', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    inputPost.user_id = outputCreateUser.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const outputCreatePost = await createPost.execute(inputPost)
    const post = await postRepository.find(outputCreatePost.id)
    expect(post.is_active).toBeTruthy()
})
