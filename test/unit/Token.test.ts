import { randomUUID } from 'crypto'
import { Token } from '../../src/core/domain/Token'

test('return exception if expired token', () => {
    const expiredToken = new Date()
    expiredToken.setDate(expiredToken.getDate() - 1)
    expect(() => new Token(
        randomUUID(),
        randomUUID(),
        randomUUID(),
        'forgot',
        false,
        expiredToken
    )).toThrowError('expired token')
})

test('new token', () => {
    const token = new Token(
        randomUUID(),
        randomUUID(),
        randomUUID(),
        'forgot',
        false,
        new Date('2029-09-03T20:21:00')
    )
    expect(token.type).toBe('forgot')
})
