export interface Sign {
    encode(subject: string, expiresIn: string | number): string
    decode(token: string): any
}
