import { Schema, model, Document } from "mongoose";

interface ITransaction extends Document {
  userId: Schema.Types.ObjectId;
  type: "debit" | "credit";
  amount: number;
  description: string;
  category: string;
  date: string;
  method?: string;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  method: { type: String },
});

export default model<ITransaction>("Transaction", transactionSchema);
