import ejs from 'ejs'

import { Template } from './Template'

export class Ejs implements Template {
    async render(path: string, data: any): Promise<string> {
        return ejs.renderFile(path, data)
    }
}
