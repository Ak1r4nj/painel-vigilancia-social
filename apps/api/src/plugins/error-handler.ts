import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode = error.statusCode ?? 500;

  if (statusCode === 400 && error.validation) {
    return reply.status(400).send({
      error: 'validation_error',
      message: 'Dados inválidos',
      details: error.validation,
    });
  }

  if (statusCode >= 500) {
    reply.log.error(error);
    return reply.status(500).send({ error: 'internal_error', message: 'Erro interno' });
  }

  return reply.status(statusCode).send({ error: error.code ?? 'error', message: error.message });
}
