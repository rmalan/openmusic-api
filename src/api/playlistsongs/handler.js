const ClientError = require('../../exceptions/ClientError');

class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this._playlistSongsService = playlistSongsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getSongsByPlaylistIdHandler = this.getSongsByPlaylistIdHandler.bind(this);
    this.deleteSongFromPlaylistIdHandler = this.deleteSongFromPlaylistIdHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistSongsService.addSongToPlaylist(playlistId, request.payload);

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      });

      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsByPlaylistIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      const songs = await this._playlistSongsService.getSongsByPlaylistId(playlistId);

      return {
        status: 'success',
        data: {
          songs,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongFromPlaylistIdHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistSongsService.deleteSongFromPlaylist(playlistId, request.payload);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistSongsHandler;
