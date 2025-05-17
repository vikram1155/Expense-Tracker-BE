import { Schema, model, Document } from "mongoose";

export interface ITransaction {
  id: string;
  type: string;
  amount: number;
  name: string;
  category: string;
  date: string;
  method: string;
  comments?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  transactions: ITransaction[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  dob: { type: String },
  transactions: [
    {
      type: { type: String, required: true },
      amount: { type: Number, required: true },
      name: { type: String, required: true },
      category: { type: String, required: true },
      date: { type: String, required: true },
      method: { type: String, required: true },
      comments: { type: String },
    },
  ],
});

export default model<IUser>("User", userSchema);
