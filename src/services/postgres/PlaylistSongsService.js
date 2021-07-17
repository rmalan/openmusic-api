const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSongToPlaylist(playlistId, { songId }) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    await this._cacheService.delete(`playlistSongs:${playlistId}`);
  }

  async getSongsByPlaylistId(playlistId) {
    try {
      const result = await this._cacheService.get(`playlistSongs:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT songs.id, title, performer FROM playlistsongs LEFT JOIN songs ON songs.id = playlistsongs.song_id WHERE playlist_id = $1',
        values: [playlistId],
      };
      const result = await this._pool.query(query);

      await this._cacheService.set(`playlistSongs:${playlistId}`, JSON.stringify(result.rows));

      return result.rows;
    }
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

    await this._cacheService.delete(`playlistSongs:${playlistId}`);
  }
}

module.exports = PlaylistSongsService;
