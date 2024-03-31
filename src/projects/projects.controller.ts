import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/project.schema';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(AuthGuard())
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
  ): Promise<Project> {
    // retrieve the user from the req
    const authorization: string = req.headers['authorization'];
    const token = this.projectsService.getToken(authorization);
    const user: { userId: string; iat: number; exp: number; email: string } =
      await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

    return this.projectsService.create({
      ...createProjectDto,
      userId: user.userId,
    });
  }

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findById(id);
  }

  @UseGuards(AuthGuard())
  @Patch(':id')
  updateById(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project[]> {
    return this.projectsService.updateById(id, updateProjectDto);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  removeById(@Param('id') id: string): Promise<Project> {
    return this.projectsService.removeById(id);
  }

  @UseGuards(AuthGuard())
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

  @UseGuards(AuthGuard())
  @Patch(':id/tasks/:taskId')
  updateTaskById(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.projectsService.updateTaskById(id, taskId, updateTaskDto);
  }

  @UseGuards(AuthGuard())
  @Delete(':id/tasks/:taskId')
  removeTaskById(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
  ): Promise<{
    message: string;
  }> {
    return this.projectsService.removeTaskById(id, taskId);
  }
}
