import { faker } from '@faker-js/faker';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

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
    findAll: jest.fn().mockResolvedValueOnce([mockProject]),
    findOne: jest.fn(),
    findById: jest.fn().mockResolvedValueOnce(mockProject),
    updateById: jest.fn(),
    removeById: jest.fn().mockResolvedValueOnce({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: process.env.JWT_SECRET }),
      ],
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should get all projects', async () => {
    const result = await controller.findAll();

    expect(result).toEqual([mockProject]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should get a project by id', async () => {
    const result = await controller.findById(mockProject.id);

    expect(result).toEqual(mockProject);
    expect(service.findById).toHaveBeenCalledWith(mockProject.id);
  });

  it('should update a project', async () => {
    const updateProjectDto = {
      ...mockProject,
      description: faker.lorem.sentence(),
    };
    mockProjectService.updateById = jest
      .fn()
      .mockResolvedValueOnce(updateProjectDto);

    const result = await controller.updateById(
      mockProject.id,
      updateProjectDto,
    );

    expect(result).toEqual(updateProjectDto);
  });

  it('should remove a project', async () => {
    const result = await controller.removeById(mockProject.id);

    expect(result).toEqual({ deleted: true });
    expect(service.removeById).toHaveBeenCalledWith(mockProject.id);
  });

  // it('should create a project', async () => {
  //   const createProjectDto = {
  //     name: mockProject.name,
  //     description: mockProject.description,
  //     status: mockProject.status,
  //   };
  //   mockProjectService.create = jest.fn().mockResolvedValueOnce(mockProject);

  //   const result = await controller.create({
  //     ...createProjectDto,
  //     userId: mockUser.id,
  //   }, );

  //   expect(result).toEqual(mockProject);
  //   expect(service.create).toHaveBeenCalledWith({
  //     ...createProjectDto,
  //     userId: mockUser.id,
  //   });
  // });
});
