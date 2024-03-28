import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString } from 'class-validator';
import mongoose from 'mongoose';
import { Task } from './task.schema';

@Schema({ collection: 'projects', timestamps: true })
export class Project extends mongoose.Document {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    enum: ['active', 'suspended', 'completed'],
    default: 'active',
    trim: true,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @IsString()
  userId: string;

  @Prop([
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
  ])
  tasks: Task[];
}

const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export { ProjectSchema };
