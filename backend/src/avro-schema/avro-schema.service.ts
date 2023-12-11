import * as jsondiffpatch from 'jsondiffpatch';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAvroSchemaDto } from './dto/create-avro-schema.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AvroSchema, AvroSchemaVersion } from '@prisma/client'
import { UpdateAvroSchemaDto } from './dto/update-avro-schema.dto'
import { Type } from '~shared/avro/types'
import { GitlabService } from '@/gitlab/gitlab.service'

@Injectable()
export class AvroSchemaService {
  constructor(
    private prisma: PrismaService,
    private gitlabService: GitlabService
  ) {}

  private validateSchemaBeforeCreate(
    schema: any,
    avroSchema: AvroSchema & { versions: AvroSchemaVersion[] }
  ) {
    const latestVersionNumber = Math.max(
      0,
      ...avroSchema.versions.map(v => v.number)
    );

    if (latestVersionNumber) {
      const latestVersion = avroSchema.versions.find(
        v => v.number === latestVersionNumber
      );

      const delta = jsondiffpatch.diff(latestVersion.schema, schema);

      if (!delta) {
        throw new BadRequestException('schema is the same as in the previous version');
      }
    }

    const errors = Type.validate(schema);

    if (errors.length) {
      throw new BadRequestException({ errors });
    }
  }

  async create(
    userId: string,
    schemaName: string,
    createAvroSchemaDto: CreateAvroSchemaDto
  ) {
    const { schema } = createAvroSchemaDto;

    let avroSchema = await this.prisma.avroSchema.findFirst({
      where: {
        name: schemaName,
        createdById: userId,
      },
      include: {
        versions: true
      }
    });

    if (!avroSchema) {
      avroSchema = await this.prisma.avroSchema.create({
        data: {
          name: schemaName,
          createdById: userId,
        },
        include: {
          versions: true,
        }
      })
    }

    // Important thing
    this.validateSchemaBeforeCreate(schema, avroSchema);

    const latestVersionNumber = Math.max(
      0,
      ...avroSchema.versions.map(v => v.number)
    );

    let avroSchemaVersion = await this.prisma.avroSchemaVersion.create({
      data: {
        baseId: avroSchema.id,
        schema,
        createdById: userId,
        number: latestVersionNumber + 1,
      }
    })

    try {
      await this.gitlabService.pushSchema(avroSchemaVersion);
      avroSchemaVersion = await this.prisma.avroSchemaVersion.update({
        where: {
          id: avroSchemaVersion.id,
        },
        data: {
          isPushed: true,
        }
      });
    } catch (e) {
      // console.error(e);
    }

    return avroSchemaVersion;
  }

  async findAll(userId: string) {
    return this.prisma.avroSchema.findMany({
      where: {
        createdById: userId
      },
      include: {
        versions: {
          select: {
            id: true,
            number: true,
          }
        }
      }
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.avroSchemaVersion.findUnique({
      where: {
        id,
        createdById: userId
      }
    });
  }

  async findSpecificVersion(userId: string, schemaName: string, version: number) {
    return this.prisma.avroSchemaVersion.findFirst({
      where: {
        base: {
          name: schemaName,
        },
        createdById: userId,
        number: version
      }
    });
  }

  async remove(userId: string, schemaName: string) {
    const schema = await this.prisma.avroSchema.findFirst({
      where: {
        name: schemaName,
        createdById: userId
      }
    });

    if (!schema) {
      throw new NotFoundException();
    }

    return this.prisma.avroSchema.delete({
      where: {
        id: schema.id
      },
      include: {
        versions: {
          select: {
            id: true,
            number: true
          }
        }
      }
    })
  }

  async removeSpecificVersion(userId: string, schemaName: string, version: number) {
    const latestVersionNumber = await this.getLatestVersionNumber(userId, schemaName);

    if (!latestVersionNumber) {
      throw new NotFoundException();
    }

    if (latestVersionNumber > version) {
      throw new BadRequestException('you can delete only latest version');
    }

    const schemaVersion = await this.prisma.avroSchemaVersion.findFirst({
      where: {
        base: {
          name: schemaName,
        },
        createdById: userId,
        number: version
      },
      select: {
        id: true
      }
    });

    if (!schemaVersion) {
      throw new NotFoundException();
    }

    return this.prisma.avroSchemaVersion.delete(
      {
        where: {
          id: schemaVersion.id
        },
        select: {
          id: true
        }
      }
    );
  }

  async findAllVersions(userId: string, schemaName: string) {
    const schema = await this.prisma.avroSchema.findFirst({
      where: {
        name: schemaName,
        createdById: userId,
      }
    });

    if (!schema) {
      throw new NotFoundException();
    }

    return this.prisma.avroSchemaVersion.findMany({
      where: {
        baseId: schema.id,
      },
      select: {
        id: true,
        number: true
      }
    });
  }

  async getLatestVersionNumber(userId: string, schemaName: string) {
    const latestVersion = await this.prisma.avroSchemaVersion.aggregate({
      _max: {
        number: true
      },
      where: {
        base: {
          name: schemaName,
          createdById: userId,
        }
      }
    });

    return latestVersion._max.number;
  }

  async findLatestVersions(userId: string, schemaName: string): Promise<AvroSchemaVersion> {
    const latestVersionNumber = await this.getLatestVersionNumber(userId, schemaName);

    if (!latestVersionNumber) {
      throw new NotFoundException();
    }

    return this.prisma.avroSchemaVersion.findFirst({
      where: {
        base: {
          name: schemaName,
        },
        createdById: userId,
        number: latestVersionNumber
      }
    });
  }

  async removeLatestVersion(userId: string, schemaName: string) {
    const latestVersion = await this.findLatestVersions(userId, schemaName);

    return this.prisma.avroSchemaVersion.delete({
      where: {
        id: latestVersion.id
      },
    })
  }

  async update(userId: string, schemaId: string, updateAvroSchemaDto: UpdateAvroSchemaDto) {
    return this.prisma.avroSchema.update({
      where: {
        id: schemaId
      },
      data: updateAvroSchemaDto,
      include: {
        versions: {
          select: {
            id: true,
            number: true
          }
        }
      }
    });
  }

  async deleteSchemaVersion(userId: string, versionId: string) {
    return this.prisma.avroSchemaVersion.delete({
      where: {
        id: versionId
      }
    });
  }
}
