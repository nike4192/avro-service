import * as jsondiffpatch from 'jsondiffpatch';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAvroSchemaDto } from './dto/create-avro-schema.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AvroSchemaVersion } from '@prisma/client';

@Injectable()
export class AvroSchemaService {
  constructor(private prisma: PrismaService) {}
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


    const latestVersionNumber = Math.max(
      0,
      ...avroSchema.versions.map(v => v.version)
    );

    if (latestVersionNumber) {
      const latestVersion = avroSchema.versions.find(
        v => v.version === latestVersionNumber
      );

      const delta = jsondiffpatch.diff(latestVersion.schema, schema);

      if (!delta) {
        throw new BadRequestException('schema is the same as in the previous version');
      }
    }

    return this.prisma.avroSchemaVersion.create({
      data: {
        baseId: avroSchema.id,
        schema,
        createdById: userId,
        version: latestVersionNumber + 1,
      },
      select: {
        id: true,
        version: true,
      }
    });
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
            version: true,
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
        version
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
            version: true
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
        version
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
        version: true
      }
    });
  }

  async getLatestVersionNumber(userId: string, schemaName: string) {
    const latestVersion = await this.prisma.avroSchemaVersion.aggregate({
      _max: {
        version: true
      },
      where: {
        base: {
          name: schemaName,
          createdById: userId,
        }
      }
    });

    return latestVersion._max.version;
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
        version: latestVersionNumber
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
}
