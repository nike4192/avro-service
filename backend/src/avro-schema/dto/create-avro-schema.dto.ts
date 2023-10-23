import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as avroSchemaExample from '../examples/avro-schema-example.json';

export class CreateAvroSchemaDto {
  @ApiProperty({ example: avroSchemaExample })
  @IsObject()
  schema: any;
}
