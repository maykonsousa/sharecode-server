import { randomBytes } from 'crypto'
import { User } from '../../src/domain/entities/User'

let random: string

beforeEach(() => {
    random = randomBytes(16).toString('hex')
})

test('Should create user with valid email', () => {
    const user = new User(
        random,
        random,
        random,
        `${random}@test.com`,
        random,
        'user'
    )
    expect(user.gh_username).toBe(random)
})

test('Not should create user with invalid email', () => {
    expect(
        () =>
            new User(
                random,
                random,
                random,
                `${random}@test.c`,
                random,
                'user'
            )
    ).toThrowError('invalid email')
})

test('Not should create user with invalid password', () => {
    expect(
        () =>
            new User(
                random,
                random,
                random,
                `${random}@test.com`,
                '1',
                'user'
            )
    ).toThrowError('invalid password')
})
