import { IsString } from 'class-validator'

export class UpdateAvroSchemaDto {
  @IsString()
  name: string;
}
