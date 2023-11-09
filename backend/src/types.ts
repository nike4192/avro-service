import { IsNumber, IsString } from 'class-validator'

class RootEnvironmentConfig {
  @IsString()
  BACKEND_HOST: string;

  @IsNumber()
  BACKEND_PORT: number;

  @IsString()
  FRONTEND_HOST: string;

  @IsNumber()
  FRONTEND_PORT: number;
}

export class LocalEnvironmentConfig extends RootEnvironmentConfig {
  @IsString()
  JWT_SECRET_KEY: string;

  @IsString()
  JWT_EXPIRES_IN: string;
}