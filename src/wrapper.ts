import axios, { AxiosRequestConfig } from "axios";
import { stringify } from 'qs';

/**
 * Interface for wrapper options.
 */
export interface WrapperOptions {
    clientId: string;
    clientSecret: string;
}

/**
 * Interface for a playlist.
 */
export interface Playlist {
    id: string;
    name: string;
    tracks: {
        items: Array<{ track: Track }>;
    };
}

/**
 * Interface for a track.
 */
export interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
}

/**
 * Interface for an album.
 */
export interface Album {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    tracks: {
        items: Track[];
    }
}

/**
 * Interface for followers.
 */
export interface Followers {
    total: number;
}

/**
 * Interface for an artist.
 */
export interface Artist {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    followers: Followers;
}

/**
 * Interface for a user profile.
 */
export interface UserProfile {
    id: string;
    display_name: string;
    followers: Followers;
    images: Array<{ url: string }>;
}

/**
 * Interface for a paging object.
 */
export interface PagingObject<T> {
  items: T[]
}

/**
 * Class to interact with the Spotify API.
 */
export class Wrapper {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null;

    constructor(clientId: string, clientSecret: string) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.accessToken = null;
    }

    /**
     * Authenticate with the Spotify API to obtain an access token.
     */
    private async authenticate(): Promise<void> {
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const data = stringify({ grant_type: 'client_credentials' });
      const authOptions: AxiosRequestConfig = {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      };

      try {
        const response = await axios.post(tokenUrl, data, authOptions);
        this.accessToken = response.data.access_token;
      } catch (error) {
        console.error('Failed to authenticate with Spotify API', error);
      }
    }

    /**
     * Make a request to the Spotify API.
     * @param url - The endpoint URL.
     * @param params - Optional parameters for the request.
     */
    public async makeRequest<T>(url: string, params?: any): Promise<T | undefined> {
      await this.authenticate();
      const options: AxiosRequestConfig = {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: params
      };

      try {
        const response = await axios.get<T>(url, options);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch from Spotify API: ${url}`, error);
      }
    }

    /**
     * Get a playlist by its ID.
     * @param playlistId - The ID of the playlist.
     */
    public async getPlaylist(playlistId: string): Promise<Playlist | undefined> {
      return this.makeRequest<Playlist>(`https://api.spotify.com/v1/playlists/${playlistId}`);
    }

    /**
     * Search for tracks.
     * @param query - The search query.
     */
    public async searchTracks(query: string): Promise<Track[] | undefined> {
      const data = await this.makeRequest<{ tracks: { items: Track[] } }>('https://api.spotify.com/v1/search', { q: query, type: 'track' });
      return data?.tracks.items;
    }

    /**
     * Get an album by its ID.
     * @param albumId - The ID of the album.
     */
    public async getAlbum(albumId: string): Promise<Album | undefined> {
      return this.makeRequest<Album>(`https://api.spotify.com/v1/albums/${albumId}`);
    }

    /**
     * Get an artist by their ID.
     * @param artistId - The ID of the artist.
     */
    public async getArtist(artistId: string): Promise<Artist | undefined> {
      return this.makeRequest<Artist>(`https://api.spotify.com/v1/artists/${artistId}`);
    }

    /**
     * Get a user profile by their ID.
     * @param userId - The ID of the user.
     */
    public async getUserProfile(userId: string): Promise<UserProfile | undefined> {
      return this.makeRequest<UserProfile>(`https://api.spotify.com/v1/users/${userId}`);
    }

    /**
     * Get an artist's top tracks.
     * @param artistId - The ID of the artist.
     * @param market - The market (country code) for the tracks.
     */
    public async getArtistTopTracks(artistId: string, market: string): Promise<Track[] | undefined> {
      const data = await this.makeRequest<{ tracks: Track[] }>(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, { market });
      return data?.tracks;
    }

    /**
     * Get albums by an artist.
     * @param artistId - The ID of the artist.
     */
    public async getArtistAlbums(artistId: string): Promise<Album[] | undefined> {
      const data = await this.makeRequest<PagingObject<Album>>(`https://api.spotify.com/v1/artists/${artistId}/albums`);
      return data?.items;
    }

    /**
     * Create a playlist for a user.
     * @param userId - The ID of the user.
     * @param name - The name of the playlist.
     * @param description - The description of the playlist.
     * @param publicStatus - The public status of the playlist.
     */
    public async createPlaylist(userId: string, name: string, description: string, publicStatus: boolean): Promise<Playlist | undefined> {
      const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
      const options: AxiosRequestConfig = {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        }
      };
      const data = {
        name,
        description,
        public: publicStatus,
      };

      try {
        const response = await axios.post<Playlist>(url, data, options);
        return response.data;
      } catch (error) {
        console.error('Failed to create playlist', error);
      }
    }

    /**
     * Add tracks to a playlist.
     * @param playlistId - The ID of the playlist.
     * @param trackUris - The URIs of the tracks to add.
     */
    public async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
      const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      const options: AxiosRequestConfig = {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        }
      };
      const data = {
        uris: trackUris,
      };

      try {
        await axios.post(url, data, options);
      } catch (error) {
        console.error('Failed to add tracks to playlist', error);
      }
    }
}

/**
 * Class for analyzing track features.
 */
export class TrackAnalysis {
    private wrapper: Wrapper;

    constructor(wrapper: Wrapper) {
        this.wrapper = wrapper;
    }

    /**
     * Get audio features for a track.
     * @param trackId - The ID of the track.
     */
    public async getTrackFeatures(trackId: string): Promise<any> {
        const url = `https://api.spotify.com/v1/audio-features/${trackId}`;
        return this.wrapper.makeRequest<any>(url);
    }

    /**
     * Analyze a playlist to get features for each track.
     * @param playlistId - The ID of the playlist.
     */
    public async analyzePlaylist(playlistId: string): Promise<any[] | undefined> {
        const playlist = await this.wrapper.getPlaylist(playlistId);
        if (!playlist) return;

        const trackFeatures = await Promise.all(
            playlist.tracks.items.map(item => this.getTrackFeatures(item.track.id))
        );

        return trackFeatures;
    }
}