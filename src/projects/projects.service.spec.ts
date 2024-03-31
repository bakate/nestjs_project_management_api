import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { CreateProjectDto } from './dto/project.dto';
import { CreateTaskDto } from './dto/task.dto';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/project.schema';
import { Task } from './schemas/task.schema';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: Model<Project>;
  let taskModel: Model<Task>;
  const userId = new mongoose.Types.ObjectId().toString();
  const currentProjectId = new mongoose.Types.ObjectId().toString();
  const taskId = new mongoose.Types.ObjectId().toString();

  const mockProject = {
    id: currentProjectId,
    name: faker.internet.domainName(),
    description: faker.lorem.sentence(),
    status: 'active',
    userId,
    tasks: [],
  };
  const mockUser = {
    id: userId,
    name: faker.internet.displayName(),
    email: faker.internet.email(),
  };
  const mockTask = {
    id: taskId,
    title: faker.lorem.words(),
    status: 'in_progress',
    projectId: currentProjectId,
    name: mockProject.name,
    description: mockProject.description,

    userId,
    tasks: [],
  };

  const mockProjectService = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    createTask: jest.fn(),
    updateTaskById: jest.fn(),
    findAllTasks: jest.fn(),
    findTaskById: jest.fn(),
    removeTaskById: jest.fn(),
    insertMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectService,
        },
        {
          provide: getModelToken(Task.name),
          useValue: mockProjectService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get<Model<Project>>(getModelToken(Project.name));
    taskModel = module.get<Model<Task>>(getModelToken(Task.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const expectedOutput = [mockProject];

      jest.spyOn(projectModel, 'find').mockImplementation(() => {
        return {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(expectedOutput),
        } as any;
      });
      const result = await service.findAll();

      expect(result).toBe(expectedOutput);
      expect(projectModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a project', async () => {
      const newProject = {
        name: faker.lorem.words(),
        description: faker.lorem.sentence(),
        status: 'active',
      };
      const expectedOutput = mockProject;
      jest
        .spyOn(projectModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockProject as any));

      const result = await service.create({
        ...newProject,

        userId: mockUser.id,
      } as CreateProjectDto);
      expect(result).toBe(expectedOutput);
      expect(projectModel.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should find and return a project by ID', async () => {
      jest
        .spyOn(projectModel, 'findById')
        .mockResolvedValue(mockProject as any);

      const result = await service.findById(mockProject.id);

      expect(result).toEqual(mockProject);
      expect(projectModel.findById).toHaveBeenCalledWith(mockProject.id);
    });

    it('should throw NotFoundException if project is not found', async () => {
      const fakeProjectId = 'invalid-id';
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(projectModel, 'findById').mockResolvedValue(null);

      await expect(service.findById(fakeProjectId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if id is invalid', async () => {
      const fakeProjectId = 'invalid-id';
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(service.findById(fakeProjectId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updatedProject = {
        name: faker.lorem.words(),
        description: faker.lorem.sentence(),
        status: 'active',
        tasks: [],
      };
      jest
        .spyOn(projectModel, 'findByIdAndUpdate')
        .mockResolvedValue(mockProject as any);

      const result = await service.updateById(
        mockProject.id,
        updatedProject as any,
      );

      expect(result).toEqual(mockProject);
      expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProject.id,
        updatedProject,
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      jest
        .spyOn(projectModel, 'findByIdAndDelete')
        .mockResolvedValue(mockProject as any);

      const result = await service.removeById(mockProject.id);

      expect(result).toEqual(mockProject);
      expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockProject.id,
      );
    });
  });

  describe('Add a task', () => {
    it('should add a task to a project', async () => {
      const expectedOutput = mockProject;
      // need to mock save method also
      jest.spyOn(projectModel, 'findById').mockImplementationOnce(() => {
        return {
          save: jest.fn().mockResolvedValueOnce(mockProject as any),
        } as any;
      });

      jest
        .spyOn(taskModel, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockTask as any));

      const result = await service.createTask(
        mockProject.id,
        mockTask as CreateTaskDto,
      );
      expect(result).toBe(expectedOutput);
      expect(taskModel.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update a task', () => {
    it('should update a task', async () => {
      const updatedTask = {
        title: mockTask.title,
      };

      jest.spyOn(taskModel, 'findOne').mockResolvedValue(mockTask as any);
      jest
        .spyOn(taskModel, 'findByIdAndUpdate')
        .mockResolvedValue(mockTask as any);

      const result = await service.updateTaskById(
        mockProject.id,
        mockTask.id,
        updatedTask as any,
      );

      expect(result).toEqual(mockTask);
      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTask.id,
        updatedTask,
        { new: true },
      );
    });
  });

  describe('Find all tasks', () => {
    it('should return an array of tasks', async () => {
      const expectedOutput = [mockTask];

      jest.spyOn(taskModel, 'find').mockImplementation(() => {
        return {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(expectedOutput),
        } as any;
      });
      const result = await service.findAllTasks(mockProject.id);

      expect(result).toBe(expectedOutput);
      expect(taskModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('Find task by ID', () => {
    it('should find and return a task by ID', async () => {
      jest.spyOn(taskModel, 'findOne').mockResolvedValue(mockTask as any);

      const result = await service.findTaskById(mockProject.id, mockTask.id);
      expect(result).toEqual(mockTask);
      expect(taskModel.findOne).toHaveBeenCalledWith({
        projectId: mockProject.id,
        _id: mockTask.id,
      });
    });
  });

  describe('Remove task by ID', () => {
    it('should remove a task by ID', async () => {
      jest.spyOn(projectModel, 'findById').mockImplementationOnce(() => {
        return {
          save: jest.fn().mockResolvedValueOnce(mockProject as any),
        } as any;
      });

      jest.spyOn(taskModel, 'findOne').mockResolvedValue(mockTask as any);
      jest
        .spyOn(taskModel, 'findByIdAndDelete')
        .mockResolvedValue(mockTask as any);

      const result = await service.removeTaskById(mockProject.id, mockTask.id);

      expect(result).toEqual({ message: 'Task deleted successfully' });
      expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith(mockTask.id);
    });
  });
});
