export interface Sign {
    encode(payload: object, expiresIn: string | number): string
    decode(token: string): any
}
