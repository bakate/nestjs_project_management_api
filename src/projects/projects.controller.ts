import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private jwtService: JwtService,
  ) {}

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
  ) {
    // retrieve the user from the req
    const authorization: string = req.headers['authorization'];
    const token = this.projectsService.getToken(authorization);
    const user: { id: string; iat: number; exp: number } =
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

    return this.projectsService.create({
      ...createProjectDto,
      userId: user.id,
    });
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch(':id')
  updateById(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.updateById(id, updateProjectDto);
  }

  @Delete(':id')
  removeById(@Param('id') id: string) {
    return this.projectsService.removeById(id);
  }

  @Post(':id/tasks')
  createTask(@Param('id') id: string, @Body() createTaskDto: CreateTaskDto) {
    return this.projectsService.createTask(id, createTaskDto);
  }

  @Get(':id/tasks')
  findAllTasks(@Param('id') id: string) {
    return this.projectsService.findAllTasks(id);
  }

  @Get(':id/tasks/:taskId')
  findTaskById(@Param('id') id: string, @Param('taskId') taskId: string) {
    return this.projectsService.findTaskById(id, taskId);
  }

  @Patch(':id/tasks/:taskId')
  updateTaskById(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.projectsService.updateTaskById(id, taskId, updateTaskDto);
  }

  @Delete(':id/tasks/:taskId')
  removeTaskById(@Param('id') id: string, @Param('taskId') taskId: string) {
    return this.projectsService.removeTaskById(id, taskId);
  }
}
