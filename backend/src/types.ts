import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString, Matches, Validate, ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(text: any, args: ValidationArguments) {
    return typeof text === 'number' || typeof text === 'string';
  }

  defaultMessage(args: ValidationArguments) {
    return '($value) must be number or string';
  }
}

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

  @IsString()
  GITLAB_API_URL: string;

  @IsString()
  GITLAB_PERSONAL_ACCESS_TOKEN: string;

  @IsString()
  GITLAB_PROJECT_ID: string;

  @IsString()
  GITLAB_SCHEMAS_DIRECTORY_PREFIX: string = '/';  // root of repository

  @IsDefined()
  @Validate(IsNumberOrString)
  AVRO_SCHEMA_JSON_INDENT: string | number = 2;

  @Matches(/^(json|avsc)$/)
  AVRO_SCHEMA_FILE_FORMAT: string = 'json';
}