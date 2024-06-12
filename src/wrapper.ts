import axios, { AxiosRequestConfig } from "axios";
import qs from 'qs';

export interface WrapperOptions {
    clientId: string;
    clientSecret: string;
}

export interface Playlist {
    id: string;
    name: string;
    tracks: {
        items: Array<{ track: Track }>;
    };
}

export interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
}

export interface Album {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    tracks: {
        items: Track[];
    }
}

export interface Followers {
    total: number
}


export interface Artist {
    id: string;
    name: string;
    genres: string[];
    popularity: number;
    followers: Followers;
}

export interface UserProfile {
    id: string;
    display_name: string;
    followers: Followers;
    images: Array<{ url: string }>;
}

export class SpotifyApi {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null;
  
    constructor(clientId: string, clientSecret: string) {
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.accessToken = null;
    }
  
    private async authenticate(): Promise<void> {
      const tokenUrl = 'https://accounts.spotify.com/api/token';
      const data = qs.stringify({ grant_type: 'client_credentials' });
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
  
    public async getPlaylist(playlistId: string): Promise<Playlist | undefined> {
      return this.makeRequest<Playlist>(`https://api.spotify.com/v1/playlists/${playlistId}`);
    }
  
    public async searchTracks(query: string): Promise<Track[] | undefined> {
      const data = await this.makeRequest<{ tracks: { items: Track[] } }>('https://api.spotify.com/v1/search', { q: query, type: 'track' });
      return data?.tracks.items;
    }
  
    public async getAlbum(albumId: string): Promise<Album | undefined> {
      return this.makeRequest<Album>(`https://api.spotify.com/v1/albums/${albumId}`);
    }
  
    public async getArtist(artistId: string): Promise<Artist | undefined> {
      return this.makeRequest<Artist>(`https://api.spotify.com/v1/artists/${artistId}`);
    }
  
    public async getUserProfile(userId: string): Promise<UserProfile | undefined> {
      return this.makeRequest<UserProfile>(`https://api.spotify.com/v1/users/${userId}`);
    }
 }