import 'dotenv/config'
import { randomBytes } from 'crypto'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser/CreateUser'
import { CreateUserInput } from '../../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost/CreatePost'
import { CreatePostInput } from '../../../src/application/usecases/posts/CreatePost/CreatePostOutput'
import { RemovePost } from '../../../src/application/usecases/posts/RemovePost/RemovePost'
import { PostRepository } from '../../../src/domain/repositories/PostRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Sign } from '../../../src/infra/adapters/Sign'
import { PostRepositoryPrisma } from '../../../src/infra/repositories/database/PostRepositoryPrisma'
import { UserRepositoryPrisma } from '../../../src/infra/repositories/database/UserRepositoryPrisma'
import { PostRepositoryMemory } from '../../../src/infra/repositories/memory/PostRepositoryMemory'
import { UserRepositoryMemory } from '../../../src/infra/repositories/memory/UserRepositoryMemory'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { TokenRepositoryMemory } from '../../../src/infra/repositories/memory/TokenRepositoryMemory'
import { TokenRepositoryPrisma } from '../../../src/infra/repositories/database/TokenRepositoryPrisma'

let postRepository: PostRepository
let userRepository: UserRepository
let tokenRepository: TokenRepository
let hash: Hash
let token: Sign
let inputUser: CreateUserInput
let inputPost: CreatePostInput

beforeEach(async () => {
    postRepository = new PostRepositoryMemory()
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    token = new JSONWebToken()
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

test('Should remove post', async () => {
    const createUser = new CreateUser(userRepository, hash)
    await createUser.execute(inputUser)
    const users = await userRepository.findAll()
    inputPost.user_id = users[0].id
    const createPost = new CreatePost(postRepository, userRepository)
    await createPost.execute(inputPost)
    const beforePosts = await postRepository.findAll()
    expect(beforePosts).toHaveLength(1)
    const removePost = new RemovePost(postRepository, token)
    await removePost.execute(beforePosts[0].id)
    const afterPosts = await postRepository.findAll()
    expect(afterPosts).toHaveLength(0)
})
