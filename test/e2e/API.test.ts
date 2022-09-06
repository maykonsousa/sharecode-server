import { randomBytes } from 'crypto'
import { CreateUserInput } from '../../src/application/usecases/accounts/CreateUser/CreateUserInput'
import axios from 'axios'

const request = axios.create({
    baseURL: 'http://localhost:3000/v1/',
    validateStatus: () => true,
})
let inputUser: CreateUserInput

beforeEach(async () => {
    const random = randomBytes(16).toString('hex')
    inputUser = {
        gh_username: random,
        name: random,
        email: `${random}@test.com`,
        password: random
    }
    await request('http://localhost:3000/v1/users/clean', {
        method: 'DELETE',
        headers: {
            'content-type': 'application/json',
        },
    })
})

test('Should create user', async () => {
    const response = await request('http://localhost:3000/v1/users', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        data: inputUser,
    })
    expect(response.status).toBe(201)
})

test('Should return 422 if user already exists', async () => {
    await request('http://localhost:3000/v1/users', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data: inputUser
    })
    const response = await request('http://localhost:3000/v1/users', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data: inputUser
    })
    expect(response.status).toBe(422)
})

test('Should authenticate user', async () => {
    await request('http://localhost:3000/v1/users', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        data: inputUser,
    })
    const response = await request('http://localhost:3000/v1/auth', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data: inputUser,
    })
    expect(response.status).toBe(200)
})

test('Not should authenticate user if invalid login', async () => {
    const response = await request('http://localhost:3000/v1/auth', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data: inputUser
    })
    expect(response.status).toBe(401)
})
