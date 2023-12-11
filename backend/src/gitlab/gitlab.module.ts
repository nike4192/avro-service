import { Module } from '@nestjs/common';
import { GitlabService } from '@/gitlab/gitlab.service'
import { GitlabApiService } from '@/gitlab/gitlab.api.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [GitlabApiService, GitlabService],
  exports: [GitlabService],
})
export class GitlabModule {}
