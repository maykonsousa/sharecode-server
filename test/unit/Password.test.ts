import { Password } from '../../src/core/domain/value-objects/Password'

test('return exception if invalid password', () => {
    expect(() => new Password('12345')).toThrowError('invalid password')
})

test('new password', () => {
    const password = new Password('P4ssw0rd@')
    expect(password.getValue()).toBe('P4ssw0rd@')
})
