/**
 * Interface for wrapper options.
 */
interface WrapperOptions {
    clientId: string;
    clientSecret: string;
}
/**
 * Interface for a playlist.
 */
interface Playlist {
    id: string;
    name: string;
    tracks: {
        items: Array<{
            track: Track;
        }>;
    };
}
/**
 * Interface for a track.
 */
interface Track {
    id: string;
    name: string;
    artists: Array<{
        name: string;
    }>;
}
/**
 * Interface for an album.
 */
interface Album {
    id: string;
    name: string;
    artists: Array<{
        name: string;
    }>;
    tracks: {
        items: Track[];
    };
}
/**
 * Interface for followers.
 */
interface Followers {
    total: number;
}
/**
 * Interface for an artist.
 */
interface Artist {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    followers: Followers;
}
/**
 * Interface for a user profile.
 */
interface UserProfile {
    id: string;
    display_name: string;
    followers: Followers;
    images: Array<{
        url: string;
    }>;
}
/**
 * Interface for a paging object.
 */
interface PagingObject<T> {
    items: T[];
}
/**
 * Class to interact with the Spotify API.
 */
declare class Wrapper {
    private clientId;
    private clientSecret;
    private accessToken;
    constructor(clientId: string, clientSecret: string);
    /**
     * Authenticate with the Spotify API to obtain an access token.
     */
    private authenticate;
    /**
     * Make a request to the Spotify API.
     * @param url - The endpoint URL.
     * @param params - Optional parameters for the request.
     */
    makeRequest<T>(url: string, params?: any): Promise<T | undefined>;
    /**
     * Get a playlist by its ID.
     * @param playlistId - The ID of the playlist.
     */
    getPlaylist(playlistId: string): Promise<Playlist | undefined>;
    /**
     * Search for tracks.
     * @param query - The search query.
     */
    searchTracks(query: string): Promise<Track[] | undefined>;
    /**
     * Get an album by its ID.
     * @param albumId - The ID of the album.
     */
    getAlbum(albumId: string): Promise<Album | undefined>;
    /**
     * Get an artist by their ID.
     * @param artistId - The ID of the artist.
     */
    getArtist(artistId: string): Promise<Artist | undefined>;
    /**
     * Get a user profile by their ID.
     * @param userId - The ID of the user.
     */
    getUserProfile(userId: string): Promise<UserProfile | undefined>;
    /**
     * Get an artist's top tracks.
     * @param artistId - The ID of the artist.
     * @param market - The market (country code) for the tracks.
     */
    getArtistTopTracks(artistId: string, market: string): Promise<Track[] | undefined>;
    /**
     * Get albums by an artist.
     * @param artistId - The ID of the artist.
     */
    getArtistAlbums(artistId: string): Promise<Album[] | undefined>;
    /**
     * Create a playlist for a user.
     * @param userId - The ID of the user.
     * @param name - The name of the playlist.
     * @param description - The description of the playlist.
     * @param publicStatus - The public status of the playlist.
     */
    createPlaylist(userId: string, name: string, description: string, publicStatus: boolean): Promise<Playlist | undefined>;
    /**
     * Add tracks to a playlist.
     * @param playlistId - The ID of the playlist.
     * @param trackUris - The URIs of the tracks to add.
     */
    addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void>;
}
/**
 * Class for analyzing track features.
 */
declare class TrackAnalysis {
    private wrapper;
    constructor(wrapper: Wrapper);
    /**
     * Get audio features for a track.
     * @param trackId - The ID of the track.
     */
    getTrackFeatures(trackId: string): Promise<any>;
    /**
     * Analyze a playlist to get features for each track.
     * @param playlistId - The ID of the playlist.
     */
    analyzePlaylist(playlistId: string): Promise<any[] | undefined>;
}

export { type Album, type Artist, type Followers, type PagingObject, type Playlist, type Track, TrackAnalysis, type UserProfile, Wrapper, type WrapperOptions };
