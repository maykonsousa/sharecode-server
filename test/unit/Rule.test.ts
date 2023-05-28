import { Rule } from '../../src/core/domain/value-objects/Rule'

test('return exception if invalid rule', () => {
    expect(() => new Rule('test')).toThrowError('invalid rule')
})

test('new user rule', () => {
    const rule = new Rule('user')
    expect(rule.getValue()).toBe('user')
})

test('new admin rule', () => {
    const rule = new Rule('admin')
    expect(rule.getValue()).toBe('admin')
})

test('new moderator rule', () => {
    const rule = new Rule('moderator')
    expect(rule.getValue()).toBe('moderator')
})
