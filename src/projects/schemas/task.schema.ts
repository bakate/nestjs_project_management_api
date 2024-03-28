import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ collection: 'tasks', timestamps: true })
export class Task extends mongoose.Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  title: string;

  @Prop({
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
    trim: true,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  })
  projectId: string;
}

const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export { TaskSchema };
