var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/wrapper.ts
import axios from "axios";
import { stringify } from "qs";
var Wrapper = class {
  static {
    __name(this, "Wrapper");
  }
  clientId;
  clientSecret;
  accessToken;
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
  }
  /**
   * Authenticate with the Spotify API to obtain an access token.
   */
  async authenticate() {
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const data = stringify({ grant_type: "client_credentials" });
    const authOptions = {
      headers: {
        "Authorization": `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };
    try {
      const response = await axios.post(tokenUrl, data, authOptions);
      this.accessToken = response.data.access_token;
    } catch (error) {
      console.error("Failed to authenticate with Spotify API", error);
    }
  }
  /**
   * Make a request to the Spotify API.
   * @param url - The endpoint URL.
   * @param params - Optional parameters for the request.
   */
  async makeRequest(url, params) {
    await this.authenticate();
    const options = {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`
      },
      params
    };
    try {
      const response = await axios.get(url, options);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch from Spotify API: ${url}`, error);
    }
  }
  /**
   * Get a playlist by its ID.
   * @param playlistId - The ID of the playlist.
   */
  async getPlaylist(playlistId) {
    return this.makeRequest(`https://api.spotify.com/v1/playlists/${playlistId}`);
  }
  /**
   * Search for tracks.
   * @param query - The search query.
   */
  async searchTracks(query) {
    const data = await this.makeRequest("https://api.spotify.com/v1/search", { q: query, type: "track" });
    return data?.tracks.items;
  }
  /**
   * Get an album by its ID.
   * @param albumId - The ID of the album.
   */
  async getAlbum(albumId) {
    return this.makeRequest(`https://api.spotify.com/v1/albums/${albumId}`);
  }
  /**
   * Get an artist by their ID.
   * @param artistId - The ID of the artist.
   */
  async getArtist(artistId) {
    return this.makeRequest(`https://api.spotify.com/v1/artists/${artistId}`);
  }
  /**
   * Get a user profile by their ID.
   * @param userId - The ID of the user.
   */
  async getUserProfile(userId) {
    return this.makeRequest(`https://api.spotify.com/v1/users/${userId}`);
  }
  /**
   * Get an artist's top tracks.
   * @param artistId - The ID of the artist.
   * @param market - The market (country code) for the tracks.
   */
  async getArtistTopTracks(artistId, market) {
    const data = await this.makeRequest(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, { market });
    return data?.tracks;
  }
  /**
   * Get albums by an artist.
   * @param artistId - The ID of the artist.
   */
  async getArtistAlbums(artistId) {
    const data = await this.makeRequest(`https://api.spotify.com/v1/artists/${artistId}/albums`);
    return data?.items;
  }
  /**
   * Create a playlist for a user.
   * @param userId - The ID of the user.
   * @param name - The name of the playlist.
   * @param description - The description of the playlist.
   * @param publicStatus - The public status of the playlist.
   */
  async createPlaylist(userId, name, description, publicStatus) {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const options = {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json"
      }
    };
    const data = {
      name,
      description,
      public: publicStatus
    };
    try {
      const response = await axios.post(url, data, options);
      return response.data;
    } catch (error) {
      console.error("Failed to create playlist", error);
    }
  }
  /**
   * Add tracks to a playlist.
   * @param playlistId - The ID of the playlist.
   * @param trackUris - The URIs of the tracks to add.
   */
  async addTracksToPlaylist(playlistId, trackUris) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const options = {
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json"
      }
    };
    const data = {
      uris: trackUris
    };
    try {
      await axios.post(url, data, options);
    } catch (error) {
      console.error("Failed to add tracks to playlist", error);
    }
  }
};
var TrackAnalysis = class {
  static {
    __name(this, "TrackAnalysis");
  }
  wrapper;
  constructor(wrapper) {
    this.wrapper = wrapper;
  }
  /**
   * Get audio features for a track.
   * @param trackId - The ID of the track.
   */
  async getTrackFeatures(trackId) {
    const url = `https://api.spotify.com/v1/audio-features/${trackId}`;
    return this.wrapper.makeRequest(url);
  }
  /**
   * Analyze a playlist to get features for each track.
   * @param playlistId - The ID of the playlist.
   */
  async analyzePlaylist(playlistId) {
    const playlist = await this.wrapper.getPlaylist(playlistId);
    if (!playlist)
      return;
    const trackFeatures = await Promise.all(
      playlist.tracks.items.map((item) => this.getTrackFeatures(item.track.id))
    );
    return trackFeatures;
  }
};
export {
  TrackAnalysis,
  Wrapper
};
//# sourceMappingURL=index.mjs.map