export class CurrentDate {
    constructor(
        readonly value: Date = new Date()
    ) { }

    addMinutes(minutes: number): Date {
        return new Date(this.value.setMinutes(this.value.getMinutes() + minutes))
    }

    addHours(hours: number): Date {
        return new Date(this.value.setHours(this.value.getHours() + hours))
    }
}
