import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { SetUserType } from '../../../src/application/usecases/accounts/SetUserType'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost'
import { DeactivePost } from '../../../src/application/usecases/posts/DeactivePost'
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

test('Not should deactive post if post not found', async () => {
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    await expect(deactivePost.execute({
        id: '1234',
        token: '1234'
    })).rejects.toThrowError('post not found')
})

test('Not should deactive post if post already deactivated', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    inputPost.user_id = outputCreateUser.id
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    await expect(deactivePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('post already deactivated')
})

test('Not should deactive post if invalid token', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    inputPost.user_id = outputCreateUser.id
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    const outputCreatePost = await createPost.execute(inputPost)
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    await expect(deactivePost.execute({
        id: outputCreatePost.id,
        token: '1234'
    })).rejects.toThrowError('invalid token')
})

test('Not should deactive post if user not found', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    inputPost.user_id = outputCreateUser.id
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    await userRepository.clean()
    await expect(deactivePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('user not found')
})

test('Not should deactive post if not allowed', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    inputPost.user_id = outputCreateUser.id
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'user'
    })
    await expect(deactivePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })).rejects.toThrowError('not allowed')
})

test('Should deactive post', async () => {
    const createUser = new CreateUser(userRepository, hash, mockedQueue)
    const outputCreateUser = await createUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const setUserType = new SetUserType(userRepository, validator)
    await setUserType.execute({
        id: outputCreateUser.id,
        type: 'admin'
    })
    inputPost.user_id = outputCreateUser.id
    const outputCreatePost = await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    await deactivePost.execute({
        id: outputCreatePost.id,
        token: outputAuthenticateUser.token
    })
    const post = await postRepository.find(outputCreatePost.id)
    expect(post.is_active).toBeFalsy()
})
