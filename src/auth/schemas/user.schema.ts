import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({
    lowercase: true,
    trim: true,
    type: String,
  })
  username: string;

  @Prop({
    unique: true,
    lowercase: true,
    trim: true,
    type: String,
  })
  email: string;

  @Prop({ select: false })
  password: string;
}

const UserSchema = SchemaFactory.createForClass(User);
// we want to remove _id and __v from the response
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

export { UserSchema };
