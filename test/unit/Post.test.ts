import { randomUUID } from 'crypto'
import { Post } from '../../src/core/domain/Post'

describe('Post', () => {
    const post = new Post(
        randomUUID(),
        randomUUID(),
        'https://www.youtube.com',
        'Teste',
        'teste unitário post',
        false,
        false
    )

    it('Defined post', () => {
        expect(post).toBeDefined()
    })

    it('Active post', () => {
        post.activePost()
        expect(post.is_active).toBeTruthy()
    })
})
