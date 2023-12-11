import { Gitlab } from '@gitbeaker/rest'
import { ConfigService } from '@nestjs/config'
import { LocalEnvironmentConfig } from '@/types'
import { Injectable } from '@nestjs/common'

@Injectable()
export class GitlabApiService extends Gitlab {
  constructor(private configService: ConfigService<LocalEnvironmentConfig>) {
    super({
      host: configService.get('GITLAB_API_URL'),
      token: configService.get('GITLAB_PERSONAL_ACCESS_TOKEN'),
    })
  }
}