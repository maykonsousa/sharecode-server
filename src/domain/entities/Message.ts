export class Message {
    constructor(
        readonly from: From,
        readonly to: To,
        readonly subject: string,
        readonly content: string
    ) { }
}

type From = {
    name: string;
    address: string;
}

type To = {
    name: string;
    address: string;
}
