import { randomBytes } from 'crypto'
import { User } from '../../src/core/domain/User'
import { ValidationMessages } from '../../src/core/exceptions/ValidationMessages'

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
    }).toThrowError(ValidationMessages.EMPTY_USER_ID)
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
    }).toThrowError(ValidationMessages.EMPTY_USER_USERNAME)
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
    }).toThrowError(ValidationMessages.EMPTY_USER_NAME)
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
    ).toThrowError(ValidationMessages.INVALID_EMAIL)
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
    ).toThrowError(ValidationMessages.INVALID_PASSWORD)
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

test('update rule', () => {
    const user = User.create(
        random,
        random,
        random,
        `${random}@test.com`,
        random
    )
    user.updateRule('admin')
    expect(user.getRule()).toBe('admin')
})

test('update password', () => {
    const user = User.create(
        random,
        random,
        random,
        `${random}@test.com`,
        random
    )
    user.updatePassword('123456')
    expect(user.getPassword()).toBe('123456')
})
