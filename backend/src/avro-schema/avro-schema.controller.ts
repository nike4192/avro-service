import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AvroSchemaService,  } from './avro-schema.service';
import { CreateAvroSchemaDto } from './dto/create-avro-schema.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

const ApiParamSchemaName = () => ApiParam({ name: 'schemaName', type: 'string', example: 'schema-1' });
const ApiParamVersion = () => ApiParam({ name: 'version', type: 'string', example: '1' });

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('avro-schema')
@Controller('schema')
export class AvroSchemaController {
  constructor(private readonly avroSchemaService: AvroSchemaService) {}

  @ApiParamSchemaName()
  @ApiOperation({ summary: 'Create schema' })
  @Post(':schemaName/versions')
  async create(
    @Req() req,
    @Param('schemaName') schemaName: string,
    @Body() createAvroSchemaDto: CreateAvroSchemaDto
  ) {
    return await this.avroSchemaService.create(
      req.user.id,
      schemaName,
      createAvroSchemaDto
    );
  }

  @ApiOperation({ summary: 'Get all schemas with versions' })
  @Get()
  async findAll(@Req() req) {
    return this.avroSchemaService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'Get all versions by schema name' })
  @ApiParamSchemaName()
  @Get(':schemaName/versions')
  async findAllVersions(
    @Req() req,
    @Param('schemaName') schemaName: string
  ) {
    return this.avroSchemaService.findAllVersions(req.user.id, schemaName);
  }

  @ApiOperation({ summary: 'Get one latest version' })
  @ApiParamSchemaName()
  @Get(':schemaName/versions/latest')
  async findLastVersions(
    @Req() req,
    @Param('schemaName') schemaName: string
  ) {
    return this.avroSchemaService.findLatestVersions(req.user.id, schemaName);
  }

  @ApiOperation({ summary: 'Get one specific version' })
  @ApiParamSchemaName()
  @ApiParamVersion()
  @Get(':schemaName/versions/:version')
  async findSpecificVersion(
    @Req() req,
    @Param('schemaName') schemaName: string,
    @Param('version') version: number
  ) {
    const schemaVersion = await this.avroSchemaService.findSpecificVersion(
      req.user.id,
      schemaName,
      +version
    );

    if (!schemaVersion) {
      throw new NotFoundException();
    }

    return schemaVersion;
  }

  @ApiOperation({ summary: 'Get one version by uuid' })
  @Get('versions/:id')
  async findOne(@Req() req, @Param('id') id: string) {
    const schemaVersion = await this.avroSchemaService.findOne(req.user.id, id);

    if (!schemaVersion) {
      throw new NotFoundException();
    }

    return schemaVersion;
  }

  @ApiOperation({ summary: 'Delete one schema with versions' })
  @ApiParamSchemaName()
  @Delete(':schemaName')
  async remove(@Req() req, @Param('schemaName') schemaName: string) {
    return this.avroSchemaService.remove(req.user.id, schemaName);
  }

  @ApiOperation({ summary: 'Delete one latest version' })
  @ApiParamSchemaName()
  @Delete(':schemaName/versions/latest')
  async removeLatestVersion(
    @Req() req,
    @Param('schemaName') schemaName: string,
  ) {
    return this.avroSchemaService.removeLatestVersion(
      req.user.id,
      schemaName,
    );
  }

  @ApiOperation({ summary: 'Delete one specific version Copy' })
  @ApiParamSchemaName()
  @ApiParamVersion()
  @Delete(':schemaName/versions/:version')
  async removeSpecificVersion(
    @Req() req,
    @Param('schemaName') schemaName: string,
    @Param('version') version: number
  ) {
    return this.avroSchemaService.removeSpecificVersion(
      req.user.id,
      schemaName,
      +version
    );
  }
}
