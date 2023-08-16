export class Post {
    constructor(
        public id: string,
        public user_id: string,
        public video_id: string,
        public title: string,
        public description: string,
        public is_private: boolean,
        public is_active: boolean
    ) { }

    activePost(): void {
        this.is_active = true
    }
}
