import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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
    required: true,
    trim: true,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  userId: string;
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
