import { randomBytes } from 'crypto'
import { AuthenticateUser } from '../../../src/application/usecases/accounts/AuthenticateUser'
import { CreateUser } from '../../../src/application/usecases/accounts/CreateUser'
import { CreatePost } from '../../../src/application/usecases/posts/CreatePost'
import { FindPostsByUser } from '../../../src/application/usecases/posts/FindPostsByUser'
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
})

test('Shoud get posts by user', async () => {
    const createUser = new CreateUser(userRepository, hash, validator)
    await createUser.execute(inputUser)
    const [user] = await userRepository.findAll()
    inputPost.user_id = user.id
    const createPost = new CreatePost(postRepository, userRepository, validator)
    await createPost.execute(inputPost)
    await createPost.execute(inputPost)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign, validator)
    const outputAuthenticateUser = await authenticateUser.execute(inputUser)
    const getPostsByUser = new FindPostsByUser(postRepository, userRepository, sign, validator)
    const posts = await getPostsByUser.execute({
        id: user.id,
        token: outputAuthenticateUser.token
    })
    expect(posts).toHaveLength(2)
})
