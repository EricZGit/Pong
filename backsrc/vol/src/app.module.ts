import { Module } from '@nestjs/common';
import { AppController, AuthController, ChatController, GameController} from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { ChannelModule } from './channel.module';
import { HttpModule } from '@nestjs/axios';
// import config from './typeorm.config';

@Module({
  imports: [
    ChannelModule,
    HttpModule,
  ],
  exports: [AuthService, AppService, ChatService],
  controllers: [AppController, AuthController, ChatController, GameController],
  providers: [AppService, AuthService, ChatService],
})
export class AppModule {}

