export interface Hash {
    encrypt(password: string): string
    decrypt(password: string, encryptedPassword: string): boolean
}
