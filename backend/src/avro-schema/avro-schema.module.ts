import { Module } from '@nestjs/common';
import { AvroSchemaService } from './avro-schema.service';
import { AvroSchemaController } from './avro-schema.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AvroSchemaController],
  providers: [PrismaService, AvroSchemaService],
})
export class AvroSchemaModule {}
