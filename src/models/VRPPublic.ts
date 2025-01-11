export interface VRPPublic {
    fetchPublicGames(): Promise<string[]>;
    getGameDetails(gameId: string): Promise<Record<string, any>>;
}