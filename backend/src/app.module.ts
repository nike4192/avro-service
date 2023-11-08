import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AvroSchemaModule } from '@/avro-schema/avro-schema.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    AvroSchemaModule
  ],
  controllers: [AppController],
  providers: [
    {
      // Default guard for all routes of module
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService
  ],
})
export class AppModule {}