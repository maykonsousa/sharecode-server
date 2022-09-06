export interface Template {
    render(path: string, data: any): Promise<string>
}
