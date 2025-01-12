export default interface Game {
    id: string;
    category: string;
    name: string;
    magnetUri: string;
    size: number;
    image?: string;
    completionOn: number;
    // version: string;
    // releaseDate: string;
    // downloadUrl: string;
}