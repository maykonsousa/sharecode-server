export class Pagination {
    execute(items: any, page?: number, limit?: number) {
        const CURRENT_PAGE = page || 1
        const ITEMS_PER_PAGE = limit || 10
        const START_INDEX = (CURRENT_PAGE - 1) * ITEMS_PER_PAGE
        const END_INDEX = CURRENT_PAGE * ITEMS_PER_PAGE
        return items.slice(START_INDEX, END_INDEX)
    }
}
