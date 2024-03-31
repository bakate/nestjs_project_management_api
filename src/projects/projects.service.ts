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
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Project } from './schemas/project.schema';
import { Task } from './schemas/task.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
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

    if (!createProjectDto.tasks || createProjectDto.tasks.length === 0) {
      return this.projectModel.create({
        ...createProjectDto,
      });
    }

    const { tasks, ...restOfProject } = createProjectDto;

    const projectToInsert = new this.projectModel({
      ...restOfProject,
    });

    const tasksToInsert = tasks.map((task) => {
      return new this.taskModel({
        ...task,
        projectId: projectToInsert.id,
      });
    }) as Task[];

    try {
      // we could implement a transaction here
      projectToInsert.tasks.push(...tasksToInsert);
      await projectToInsert.save();
      await this.taskModel.insertMany(tasksToInsert);
      return projectToInsert.populate('tasks');
    } catch (error: any) {
      throw new HttpException(
        `Error creating project with tasks: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel
      .find()
      .populate('tasks')
      .sort({ createdAt: -1 })
      .exec();
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
    // check if there as some task to update
    const { tasks = [], ...restOfProject } = updateProjectDto;
    let taskIds = [];
    if (tasks.length > 0) {
      // we delete all the tasks that are not in the tasks array
      await this.taskModel.deleteMany({
        projectId: id,
        _id: { $nin: tasks.map((task) => task.id) },
      });

      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          if (!task.id) {
            // we create a new task
            return this.taskModel.create({
              ...task,
              projectId: id,
            });
          } else {
            // we update the task
            const { id, ...restOfTask } = task;
            return this.taskModel.findByIdAndUpdate(id, restOfTask, {
              new: true,
            });
          }
        }),
      );
      // we update the project with the updated tasks
      taskIds = updatedTasks.map((task) => task._id);
    }

    return this.projectModel.findByIdAndUpdate(
      id,
      {
        ...restOfProject,
        tasks: taskIds,
      },
      {
        new: true,
      },
    );
  }

  async removeById(id: string): Promise<Project> {
    return this.projectModel.findByIdAndDelete(id);
  }

  async createTask(projectId: string, createTaskDto: CreateTaskDto) {
    if (!projectId) {
      throw new BadRequestException('Please enter a projectId');
    }
    const project = await this.projectModel.findById(projectId);

    const task = await this.taskModel.create({
      ...createTaskDto,
      projectId,
    });

    if (project) {
      project.tasks?.length
        ? project.tasks.push(task.id)
        : (project.tasks = [task.id]);
      return project.save();
    } else {
      throw new NotFoundException('Project not found');
    }
  }

  async findAllTasks(projectId: string) {
    const tasks = await this.taskModel
      .find({ projectId })
      .sort({ createdAt: -1 })
      .exec();
    if (!tasks) {
      throw new NotFoundException('Tasks not found');
    }
    return tasks;
  }

  async findTaskById(projectId: string, taskId: string) {
    const task = await this.taskModel.findOne({ projectId, _id: taskId });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async updateTaskById(
    projectId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.taskModel.findOne({ projectId, _id: taskId });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskModel.findByIdAndUpdate(taskId, updateTaskDto, {
      new: true,
    });
  }

  async removeTaskById(projectId: string, taskId: string) {
    // update the project
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    project.tasks = (project.tasks ?? []).filter(
      (id) => id.toString() !== taskId,
    );
    await project.save();
    const task = await this.taskModel.findOne({ projectId, _id: taskId });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskModel.findByIdAndDelete(taskId);

    return { message: 'Task deleted successfully' };
  }
  getToken(token: string) {
    if (!token) {
      throw new HttpException('Token is required', HttpStatus.UNAUTHORIZED);
    }

    const [bearer, value] = token.split(' ');

    if (bearer !== 'Bearer' || !value) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    return value;
  }
}
