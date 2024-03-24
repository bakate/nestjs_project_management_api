import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project Name',
    description: 'The name of the project',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  readonly name: string;

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
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    example: 'Project User',
    description: 'The user of the project',
    required: false,
  })
  @IsEmpty({ message: 'You cannot pass the user id' })
  userId: string;
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
}
