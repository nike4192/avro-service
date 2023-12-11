import { join } from 'path'
import { Injectable } from '@nestjs/common'
import { GitlabApiService } from '@/gitlab/gitlab.api.service'
import { createRequesterFn } from '@gitbeaker/requester-utils'
import { ConfigService } from '@nestjs/config'
import { LocalEnvironmentConfig } from '@/types'
import { CommitAction } from '@gitbeaker/core'
import { AvroSchemaVersion } from '@prisma/client'
import * as http from 'http'

@Injectable()
export class GitlabService {
  constructor(
    private api: GitlabApiService,
    private configService: ConfigService<LocalEnvironmentConfig>
  ) {}

  private buildFilePathForSchema(schema: any) {
    const fileFormat = this.configService.get('AVRO_SCHEMA_FILE_FORMAT');
    const directoryPrefix = this.configService.get('GITLAB_SCHEMAS_DIRECTORY_PREFIX');
    const fullName = schema.namespace + '.' + schema.name;

    return join(directoryPrefix, ...fullName.split(/\./g)) + '.' + fileFormat;
  }

  private normalizeSchemaContent(schema: any) {
    const space = this.configService.get('AVRO_SCHEMA_JSON_INDENT');
    return JSON.stringify(schema, null, space);
  }

  async pushSchema(avroSchemaVersion: AvroSchemaVersion) {
    const { api, configService } = this;
    const projectId = configService.get('GITLAB_PROJECT_ID');

    const schema: any = avroSchemaVersion.schema;

    const filePath = this.buildFilePathForSchema(schema);
    const content = this.normalizeSchemaContent(schema);

    let fileAlreadyExists = false;

    try {
      await api.RepositoryFiles.show(
        projectId,
        filePath + Math.random(),
        'master',  // TODO: replace
      );
      fileAlreadyExists = true;
    } catch (e) {
      const status = e?.cause?.response?.status;
      if (!status || status !== 404) {
        throw e;
      }
    }

    const actions: CommitAction[] = [
      {
        action: fileAlreadyExists ? 'update' : 'create',
        filePath,
        content,
      }
    ];

    return await api.Commits.create(
      projectId,
      'master',  // TODO: replace
      `Create ${schema.name} schema - version ${avroSchemaVersion.number}`,
      actions
    );
  }
}