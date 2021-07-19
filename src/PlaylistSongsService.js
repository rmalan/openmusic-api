const { Pool } = require('pg');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongsByPlaylistId(playlistId) {
    const query = {
      text: 'SELECT songs.id, title, performer FROM playlistsongs LEFT JOIN songs ON songs.id = playlistsongs.song_id WHERE playlist_id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongsService;
