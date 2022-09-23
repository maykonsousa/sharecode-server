import { randomBytes } from 'crypto'
import 'dotenv/config'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateSuperUser } from '../../../src/application/usecases/accounts/CreateSuperUser'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost'
import { FindPublicPosts } from '../../../src/application/usecases/posts/FindPublicPosts'
import { PostRepository } from '../../../src/domain/repositories/PostRepository'
import { TokenRepository } from '../../../src/domain/repositories/TokenRepository'
import { UserRepository } from '../../../src/domain/repositories/UserRepository'
import { Bcrypt } from '../../../src/infra/adapters/Bcrypt'
import { Hash } from '../../../src/infra/adapters/Hash'
import { JSONWebToken } from '../../../src/infra/adapters/JSONWebToken'
import { Pagination } from '../../../src/infra/adapters/Pagination'
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
let pagination: Pagination

beforeEach(async () => {
    postRepository = new PostRepositoryMemory()
    userRepository = new UserRepositoryMemory()
    tokenRepository = new TokenRepositoryMemory()
    hash = new Bcrypt()
    sign = new JSONWebToken()
    pagination = new Pagination()
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

test('Should find all public posts', async () => {
    const createSuperUser = new CreateSuperUser(userRepository, hash, validator)
    await createSuperUser.execute(inputUser)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const [user] = await userRepository.findAll()
    inputPost.user_id = user.id
    await createPost.execute(inputPost)
    const findPublicPosts = new FindPublicPosts(postRepository, userRepository, sign, pagination)
    const posts = await findPublicPosts.execute({
        token: outputAuthenticateUser.token
    })
    expect(posts).toHaveLength(1)
})
