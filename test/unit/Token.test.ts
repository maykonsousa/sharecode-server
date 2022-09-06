import { randomUUID } from 'crypto'
import { Token } from '../../src/domain/entities/Token'

test('Should create token', () => {
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

test('Should create expired token', () => {
    expect(() => new Token(
        randomUUID(),
        randomUUID(),
        randomUUID(),
        'forgot',
        false,
        new Date('2022-08-03T20:21:00')
    )).toThrowError('expired token')
})
