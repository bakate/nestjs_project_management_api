import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { CreateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/project.schema';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let model: Model<Project>;
  const userId = new mongoose.Types.ObjectId().toString();
  const currentProjectId = new mongoose.Types.ObjectId().toString();

  const mockProject = {
    id: currentProjectId,
    name: faker.internet.domainName(),
    description: faker.lorem.sentence(),
    status: 'active',
    userId,
  };
  const mockUser = {
    id: userId,
    name: faker.internet.displayName(),
    email: faker.internet.email(),
  };

  const mockProjectService = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    model = module.get<Model<Project>>(getModelToken(Project.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const expectedOutput = [mockProject];
      jest.spyOn(model, 'find').mockImplementation(() => expectedOutput as any);
      const result = await service.findAll();

      expect(result).toBe(expectedOutput);
      expect(model.find).toHaveBeenCalledTimes(1);
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
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockProject as any));

      const result = await service.create({
        ...newProject,
        userId: mockUser.id,
      } as CreateProjectDto);
      expect(result).toBe(expectedOutput);
      expect(model.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should find and return a project by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockProject as any);

      const result = await service.findById(mockProject.id);

      expect(result).toEqual(mockProject);
      expect(model.findById).toHaveBeenCalledWith(mockProject.id);
    });

    it('should throw NotFoundException if project is not found', async () => {
      const fakeProjectId = 'invalid-id';
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(null);

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
      };
      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockResolvedValue(mockProject as any);

      const result = await service.updateById(
        mockProject.id,
        updatedProject as any,
      );

      expect(result).toEqual(mockProject);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProject.id,
        updatedProject,
        { new: true },
      );
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      jest
        .spyOn(model, 'findByIdAndDelete')
        .mockResolvedValue(mockProject as any);

      const result = await service.removeById(mockProject.id);

      expect(result).toEqual(mockProject);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockProject.id);
    });
  });
});
