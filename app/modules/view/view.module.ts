import { Module } from '@nestjs/common';
import { ExtendModule } from '../../extend/extend.module';
import { ViewController } from './view.controller';

// ConfigService 由全局 ConfigModule 提供；LoggerProvider 来自 ExtendModule
@Module({
  imports: [ExtendModule],
  controllers: [ViewController],
})
export class ViewModule {}
