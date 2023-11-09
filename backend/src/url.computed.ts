import { ConfigService } from '@nestjs/config'
import { LocalEnvironmentConfig } from '@/types'

export function computeUrls(configService: ConfigService<LocalEnvironmentConfig>) {
  const BACKEND_URL = new URL('http://localhost:3000');
  const BACKEND_HOST = configService.get('BACKEND_HOST') ?? 'localhost';
  const BACKEND_PORT = configService.get('BACKEND_PORT') ?? 3000;

  BACKEND_URL.host = BACKEND_HOST ?? BACKEND_URL.host;
  BACKEND_URL.port = BACKEND_PORT ?? BACKEND_URL.port;

  const FRONTEND_URL = new URL('http://localhost:8000');
  const FRONTEND_PROTOCOL = configService.get('FRONTEND_PROTOCOL');
  const FRONTEND_HOST = configService.get('FRONTEND_HOST');
  const FRONTEND_PORT = configService.get('FRONTEND_PORT');

  FRONTEND_URL.protocol = FRONTEND_PROTOCOL ?? FRONTEND_URL.protocol;
  FRONTEND_URL.host = FRONTEND_HOST;
  FRONTEND_URL.port = (
    FRONTEND_PORT
      ? ([80, 443].includes(FRONTEND_PORT) ? '' : FRONTEND_PORT)
      : FRONTEND_URL.port
  );

  const CORS_ORIGIN = configService.get('CORS_ORIGIN') ?? '';

  return {
    BACKEND_URL,
    BACKEND_PORT,
    FRONTEND_URL,
    CORS_ORIGIN,
  }
}