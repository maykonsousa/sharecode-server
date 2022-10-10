import { Password } from '../../src/domain/entities/value-objects/Password'

test('Should create password', () => {
    const password = new Password('123456')
    password.setValue('1234567')
    expect(password.getValue()).toBe('1234567')
})

test('Not should set password if is required', () => {
    const password = new Password('123456')
    expect(() => password.setValue('')).toThrowError('invalid password')
})

test('Not should create password if is required', () => {
    expect(() => new Password('')).toThrowError('invalid password')
})

test('Not should create password if invalid length', () => {
    expect(() => new Password('12345')).toThrowError('invalid password')
})
