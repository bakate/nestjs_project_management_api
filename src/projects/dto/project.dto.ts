import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Task } from '../schemas/task.schema';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project Name',
    description: 'The name of the project',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'Project Description',
    description: 'The description of the project',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'Project Status',
    description: 'The status of the project',
    enum: ['active', 'suspended', 'completed'],
    default: 'active',
    required: false,
  })
  status: string;

  @ApiProperty({
    example: 'Project User',
    description: 'The user of the project',
    required: false,
  })
  @IsEmpty({ message: 'You cannot pass the user id' })
  userId: string;

  @ApiProperty({
    example: 'Project Tasks',
    description: 'The tasks of the project',
    required: false,
  })
  tasks?: Task[];
}

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Project Name',
    description: 'The name of the project',
    required: false,
  })
  readonly name: string;

  @ApiProperty({
    example: 'Project Description',
    description: 'The description of the project',
    required: false,
  })
  description: string;

  @ApiProperty({
    example: 'Project Status',
    description: 'The status of the project',
    enum: ['active', 'suspended', 'completed'],
    default: 'active',
  })
  status: string;

  @ApiProperty({
    example: 'Project User',
    description: 'The user of the project',
    required: false,
  })
  @IsEmpty({ message: 'You cannot pass the user id' })
  userId: string;

  @ApiProperty({
    example: 'Project Tasks',
    description: 'The tasks of the project',
    required: false,
  })
  tasks?: Task[];
}
