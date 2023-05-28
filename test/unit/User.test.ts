import { randomBytes } from 'crypto'
import { User } from '../../src/core/domain/User'

let random: string

beforeEach(() => {
    random = randomBytes(16).toString('hex')
})

test('Return exception if empy id', () => {
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

test('Not should create a  if gh_username is required', () => {
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

test('Not should create a user if name is required', () => {
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

test('Not should create user if invalid email', () => {
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

test('Not should create user if invalid password', () => {
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

test('Should create user', () => {
    const user = User.create(
        random,
        random,
        random,
        `${random}@test.com`,
        random
    )
    expect(user.gh_username).toBe(random)
})
