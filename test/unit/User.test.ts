import { randomBytes } from 'crypto'
import { User } from '../../src/core/domain/User'

let random: string

beforeEach(() => {
    random = randomBytes(16).toString('hex')
})

test('Not should create a new user if id is required', () => {
    expect(() => {
        new User(
            '',
            random,
            random,
            `${random}@test.c`,
            random
        )
    }).toThrowError('id is required')
})

test('Not should create a new user if gh_username is required', () => {
    expect(() => {
        new User(
            random,
            '',
            random,
            `${random}@test.c`,
            random
        )
    }).toThrowError('gh_username is required')
})

test('Not should create a new user if name is required', () => {
    expect(() => {
        new User(
            random,
            random,
            '',
            `${random}@test.c`,
            random
        )
    }).toThrowError('name is required')
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
