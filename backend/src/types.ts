import { IsNumber, IsOptional, IsString } from 'class-validator'

class RootEnvironmentConfig {
  @IsOptional()
  @IsString()
  BACKEND_PROTOCOL: string;

  @IsString()
  BACKEND_HOST: string;

  @IsOptional()
  @IsNumber()
  BACKEND_PORT: number;

  @IsOptional()
  @IsString()
  FRONTEND_PROTOCOL: string;

  @IsString()
  FRONTEND_HOST: string;

  @IsOptional()
  @IsNumber()
  FRONTEND_PORT: number;
}

export class LocalEnvironmentConfig extends RootEnvironmentConfig {
  @IsString()
  JWT_SECRET_KEY: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  CORS_ORIGIN: string;
}