import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { RefreshSession } from './auth/entities/refresh-session.entity';
import { AuthModule } from './auth/auth.module';
import { FileEntity } from './file/entities/file.entity';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'rest_api_task',
      entities: [User, RefreshSession, FileEntity],
      synchronize: true,
    }),
    AuthModule,
    FileModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
