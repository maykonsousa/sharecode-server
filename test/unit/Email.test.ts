import { randomBytes } from 'crypto'
import { Email } from '../../src/domain/entities/value-objects/Email'

test('Not create email if is required', () => {
    expect(() => new Email('')).toThrowError('email is required')
})

test('Not create email if invalid email', () => {
    const random = randomBytes(16).toString('hex')
    expect(() => new Email(`${random}@test.c`)).toThrowError('invalid email')
})
