import { Module } from '@nestjs/common';
import { ModelService } from './model.service';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController],
  providers: [ModelService, ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
