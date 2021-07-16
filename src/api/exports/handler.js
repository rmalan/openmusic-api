const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
  }

  async postExportNotesHandler(request, h) {
    try {
      this._validator.validateExportNotesPayload(request.payload);

      const { id: userId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { targetEmail } = request.payload;

      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._producerService.sendMessage('export:playlistSongs', JSON.stringify({ playlistId, targetEmail }));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
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
}

module.exports = ExportsHandler;
