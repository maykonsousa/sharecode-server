import { randomBytes } from 'crypto'
import { Email } from '../../src/core/domain/value-objects/Email'

test('return exception if invalid email', () => {
    const random = randomBytes(16).toString('hex')
    expect(() => new Email(`${random}@test.c`)).toThrowError('invalid email')
})

test('new email', () => {
    const random = randomBytes(16).toString('hex')
    const email = new Email(`${random}@test.com`)
    expect(email.getValue()).toBe(`${random}@test.com`)
})
