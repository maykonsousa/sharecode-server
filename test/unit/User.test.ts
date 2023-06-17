import { User } from '../../src/core/domain/User'
import { UserDefaults } from '../../src/core/domain/defaults/UserDefaults'
import { ValidationMessages } from '../../src/core/exceptions/ValidationMessages'

test('return exception if empy id', () => {
    expect(() => {
        User.create(
            '',
            UserDefaults.DEFAULT_USER_USERNAME,
            UserDefaults.DEFAULT_USER_NAME,
            UserDefaults.DEFAULT_USER_EMAIL,
            UserDefaults.DEFAULT_USER_PASSWORD
        )
    }).toThrowError(ValidationMessages.EMPTY_USER_ID)
})

test('return exception if empty gh_username', () => {
    expect(() => {
        User.create(
            UserDefaults.DEFAULT_USER_ID,
            '',
            UserDefaults.DEFAULT_USER_NAME,
            UserDefaults.DEFAULT_USER_EMAIL,
            UserDefaults.DEFAULT_USER_PASSWORD
        )
    }).toThrowError(ValidationMessages.EMPTY_USER_USERNAME)
})

test('return exception if empty name', () => {
    expect(() => {
        User.create(
            UserDefaults.DEFAULT_USER_ID,
            UserDefaults.DEFAULT_USER_USERNAME,
            '',
            UserDefaults.DEFAULT_USER_EMAIL,
            UserDefaults.DEFAULT_USER_PASSWORD
        )
    }).toThrowError(ValidationMessages.EMPTY_USER_NAME)
})

test('return exception if invalid email', () => {
    expect(
        () =>
            User.create(
                UserDefaults.DEFAULT_USER_ID,
                UserDefaults.DEFAULT_USER_USERNAME,
                UserDefaults.DEFAULT_USER_NAME,
                '',
                UserDefaults.DEFAULT_USER_PASSWORD
            )
    ).toThrowError(ValidationMessages.INVALID_EMAIL)
})

test('return exception if invalid password', () => {
    expect(
        () =>
            User.create(
                UserDefaults.DEFAULT_USER_ID,
                UserDefaults.DEFAULT_USER_USERNAME,
                UserDefaults.DEFAULT_USER_NAME,
                UserDefaults.DEFAULT_USER_EMAIL,
                ''
            )
    ).toThrowError(ValidationMessages.INVALID_PASSWORD)
})

test('new user', () => {
    const user = User.create(
        UserDefaults.DEFAULT_USER_ID,
        UserDefaults.DEFAULT_USER_USERNAME,
        UserDefaults.DEFAULT_USER_NAME,
        UserDefaults.DEFAULT_USER_EMAIL,
        UserDefaults.DEFAULT_USER_PASSWORD
    )
    expect(user).toBeDefined()
})

test('update rule', () => {
    const user = User.create(
        UserDefaults.DEFAULT_USER_ID,
        UserDefaults.DEFAULT_USER_USERNAME,
        UserDefaults.DEFAULT_USER_NAME,
        UserDefaults.DEFAULT_USER_EMAIL,
        UserDefaults.DEFAULT_USER_PASSWORD
    )
    user.updateRule('admin')
    expect(user.getRule()).toBe('admin')
})

test('update password', () => {
    const user = User.create(
        UserDefaults.DEFAULT_USER_ID,
        UserDefaults.DEFAULT_USER_USERNAME,
        UserDefaults.DEFAULT_USER_NAME,
        UserDefaults.DEFAULT_USER_EMAIL,
        UserDefaults.DEFAULT_USER_PASSWORD
    )
    user.updatePassword('@P4ssw0rd')
    expect(user.getPassword()).toBe('@P4ssw0rd')
})
