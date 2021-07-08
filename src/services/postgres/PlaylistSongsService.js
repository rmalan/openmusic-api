const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistSongsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addSongToPlaylist(playlistId, { songId }) {
    const id = nanoid(16);
    const query = {
      text: 'INSERt INTO playlistsongs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: 'SELECT songs.id, title, performer FROM playlistsongs LEFT JOIN songs ON songs.id = playlistsongs.song_id WHERE playlist_id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, { songId }) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this._collaborationService.verifyCollaborator(playlistId, userId);
    } catch (error) {
      if (error instanceof InvariantError) {
        throw error;
      }

      try {
        await this.verifyPlaylistOwner(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistSongsService;
