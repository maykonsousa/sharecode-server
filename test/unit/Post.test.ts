import { randomUUID } from 'crypto'
import { Post } from '../../src/core/domain/Post'

test('Should create post', () => {
    const post = new Post(
        randomUUID(),
        randomUUID(),
        'https://www.youtube.com',
        'Teste',
        'teste unitário post',
        false,
        true
    )
    expect(post.title).toBe('Teste')
})
