export interface Queue {
    connect(): Promise<void>
    close(): Promise<void>
    publish(eventName: string, data: any): Promise<void>
}
