import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Task Title',
    description: 'The title of the task',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Task Status',
    description: 'The status of the task',
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
    required: false,
  })
  status: string;

  @ApiProperty({
    example: 'Task Project',
    description: 'The project of the task',
    required: true,
  })
  projectId: string;
}

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Task Title',
    description: 'The title of the task',
    required: false,
  })
  title: string;

  @ApiProperty({
    example: 'Task Status',
    description: 'The status of the task',
    enum: ['in_progress', 'completed'],
    required: false,
  })
  status: string;
}
