import { Module } from '@nestjs/common';
import { AppGateway } from './channel.gateway';
import { StatusGateway } from './status.gateway';
import { MatchLauncherGateway } from './matchLauncher.gateway';
import { AppService } from './app.service';
import { GameService } from './game.service';

@Module({
    imports: [
    ],
    exports: [AppGateway, StatusGateway, MatchLauncherGateway, AppService, GameService],
    controllers: [],
    providers: [AppGateway, StatusGateway, MatchLauncherGateway, AppService, GameService],
})

export class ChannelModule {}