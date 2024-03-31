import { faker } from '@faker-js/faker';
import { JwtModule, JwtService } from '@nestjs/jwt';
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

  const token = 'token';
  const mockUser = {
    userId: userId,
    iat: faker.number.int(),
    exp: faker.number.int(),
    email: faker.internet.email(),
  };

  const mockProjectService = {
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValueOnce([mockProject]),
    findOne: jest.fn(),
    findById: jest.fn().mockResolvedValueOnce(mockProject),
    updateById: jest.fn(),
    removeById: jest.fn().mockResolvedValueOnce({ deleted: true }),
    getToken: jest.fn().mockReturnValue(token),
  };

  const mockJwtService = {
    verifyAsync: jest.fn().mockResolvedValue(mockUser),
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
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('get all projects', () => {
    it('should get all projects', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockProject]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('get a project by ID', () => {
    it('should get a project by id', async () => {
      const result = await controller.findById(mockProject.id);

      expect(result).toEqual(mockProject);
      expect(service.findById).toHaveBeenCalledWith(mockProject.id);
    });
  });

  describe('update a project', () => {
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
  });

  describe('remove a project', () => {
    it('should remove a project', async () => {
      const result = await controller.removeById(mockProject.id);

      expect(result).toEqual({ deleted: true });
      expect(service.removeById).toHaveBeenCalledWith(mockProject.id);
    });
  });

  describe('create a project', () => {
    it('should create a project', async () => {
      const expectedOutput = mockProject;
      mockProjectService.create = jest
        .fn()
        .mockResolvedValueOnce(expectedOutput);

      const req = {
        headers: {
          authorization: 'Bearer token',
        },
      } as unknown as Request;

      const result = await controller.create(mockProject, req);

      expect(result).toEqual(expectedOutput);
    });
  });
});
