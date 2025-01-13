export default interface Game {
    id: string;
    category: string;
    name: string;
    normalName?: string
    magnetUri: string;
    size: number;
    packageName?: string;
    version?: string;
    lastUpdated?: string;
    completionOn: number;
}