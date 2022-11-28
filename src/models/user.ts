import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';

const UserSchema: Schema = new Schema(
    {
        email: { type: String, require: true },
        password: { type: String, required: true },
        editor: { type: String, required: false },
        code: { type: String, required: false },
        team: { type: Array, required: true }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IUser>('User', UserSchema);
