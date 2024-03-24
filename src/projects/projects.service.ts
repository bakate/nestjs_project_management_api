import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Project } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // make sure the project does not exist
    const existingProject = await this.projectModel.findOne({
      name: createProjectDto.name,
    });
    if (existingProject) {
      throw new HttpException(
        `Project with name:${createProjectDto.name} already exists`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.projectModel.create({
      ...createProjectDto,
    });
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find();
  }

  async findById(id: string): Promise<Project> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Please enter correct id.');
    }
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.projectModel.findById(id);
  }

  async updateById(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project[]> {
    return this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
      new: true,
    });
  }

  async removeById(id: string): Promise<Project> {
    return this.projectModel.findByIdAndDelete(id);
  }
}
