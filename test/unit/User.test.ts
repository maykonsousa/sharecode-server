import { randomBytes } from 'crypto'
import { User } from '../../src/domain/entities/User'

let random: string

beforeEach(() => {
    random = randomBytes(16).toString('hex')
})

test('Not should create user if invalid email', () => {
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

test('Not should create user if invalid password', () => {
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

test('Should create user', () => {
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
