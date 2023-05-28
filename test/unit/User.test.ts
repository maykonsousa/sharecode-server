import { randomBytes } from 'crypto'
import { User } from '../../src/core/domain/User'

let random: string

beforeEach(() => {
    random = randomBytes(16).toString('hex')
})

test('return exception if empy id', () => {
    expect(() => {
        User.create(
            '',
            random,
            random,
            `${random}@test.com`,
            random
        )
    }).toThrowError('id is required')
})

test('return exception if empty gh_username', () => {
    expect(() => {
        User.create(
            random,
            '',
            random,
            `${random}@test.com`,
            random
        )
    }).toThrowError('gh_username is required')
})

test('return exception if empty name', () => {
    expect(() => {
        User.create(
            random,
            random,
            '',
            `${random}@test.com`,
            random
        )
    }).toThrowError('name is required')
})

test('return exception if invalid email', () => {
    expect(
        () =>
            User.create(
                random,
                random,
                random,
                `${random}@test.c`,
                random
            )
    ).toThrowError('invalid email')
})

test('return exception if invalid password', () => {
    expect(
        () =>
            User.create(
                random,
                random,
                random,
                `${random}@test.com`,
                '1'
            )
    ).toThrowError('invalid password')
})

test('new user', () => {
    const user = User.create(
        random,
        random,
        random,
        `${random}@test.com`,
        random
    )
    expect(user.gh_username).toBe(random)
})
