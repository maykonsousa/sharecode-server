import 'dotenv/config'
import { randomBytes } from 'crypto'
import { CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import { ActivePost } from '../../../src/application/usecases/posts/ActivePost/ActivePost'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost/CreatePost'
import { CreatePostInput } from '../../../src/application/usecases/posts/CreatePost/CreatePostOutput'
import { PostRepository } from '../../../src/domain/repositories/PostRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { PostRepositoryPrisma } from '../../../src/infra/repositories/database/PostRepositoryPrisma'
import { UserRepositoryPrisma } from '../../../src/infra/repositories/database/UserRepositoryPrisma'
import { TokenRepositoryPrisma } from '../../../src/infra/repositories/database/TokenRepositoryPrisma'
import { PostRepositoryMemory } from '../../../src/infra/repositories/memory/PostRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { CreateSuperUser } from '../../../src/application/usecases/accounts/CreateSuperUser/CreateSuperUser'

let postRepository: PostRepository
let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Hash
let sign: Sign
let inputUser: CreateUserInput
let inputPost: CreatePostInput

beforeEach(async () => {
    postRepository = new PostRepositoryMemory()
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    sign = new JSONWebToken()
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

test('Should active post', async () => {
    const createSuperUser = new CreateSuperUser(userRepository, hash)
    await createSuperUser.execute(inputUser)
    const users = await userRepository.findAll()
    const createPost = new CreatePost(postRepository, userRepository)
    inputPost.user_id = users[0].id
    await createPost.execute(inputPost)
    const activePost = new ActivePost(postRepository, userRepository, tokenRepository, sign)
    const beforePost = await postRepository.findAll()
    await activePost.execute(beforePost[0].id)
    const afterPost = await postRepository.findAll()
    expect(afterPost[0].is_active).toBeTruthy()
})
