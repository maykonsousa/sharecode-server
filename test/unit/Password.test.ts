import { Password } from '../../src/core/domain/value-objects/Password'

test('return exception if invalid password', () => {
    expect(() => new Password('12345')).toThrowError('invalid password')
})

test('new password', () => {
    const password = new Password('123456')
    expect(password.getValue()).toBe('123456')
})
