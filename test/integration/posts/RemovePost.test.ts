import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateSuperUser } from '../../../src/application/usecases/accounts/CreateSuperUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost'
import { RemovePost } from '../../../src/application/usecases/posts/RemovePost'
import { PostRepository } from '../../../src/domain/repositories/PostRepository'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { Validator } from '../../../src/infra/adapters/Validator'
import { PostRepositoryMemory } from '../../../src/infra/repositories/memory/PostRepositoryMemory'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'

let postRepository: PostRepository
let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Hash
let sign: Sign
let validator: Validator
let inputUser = null
let inputPost = null

beforeEach(async () => {
    postRepository = new PostRepositoryMemory()
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
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
        video_id: random,
        user_id: random
    }
    await userRepository.clean()
    await postRepository.clean()
})

test('Should remove post with admin', async () => {
    const createSuperUser = new CreateSuperUser(userRepository, hash, validator)
    await createSuperUser.execute(inputUser)
    const [user] = await userRepository.findAll()
    const createPost = new CreatePost(postRepository, userRepository, validator)
    inputPost.user_id = user.id
    await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const [beforePost] = await postRepository.findAll()
    const removePost = new RemovePost(postRepository, userRepository, sign, validator)
    await removePost.execute({
        id: beforePost.id,
        token: outputAuthenticateUser.token
    })
    const posts = await postRepository.findAll()
    expect(posts).toHaveLength(0)
})

test('Should remove post with user', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const [user] = await userRepository.findAll()
    const createPost = new CreatePost(postRepository, userRepository, validator)
    inputPost.user_id = user.id
    await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const [beforePost] = await postRepository.findAll()
    const removePost = new RemovePost(postRepository, userRepository, sign, validator)
    await removePost.execute({
        id: beforePost.id,
        token: outputAuthenticateUser.token
    })
    const [afterPost] = await postRepository.findAll()
    expect(afterPost.user_id).toBe('4aaa45f8-6035-4fc4-adf2-35ba1fa0bafd')
})
