import mongoose, { Schema } from "mongoose";


const meetingSchema = new Schema({
  user_id: { type: String },
  meetingCode: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting }; //we use this when we have to export many things from a single js file

// export default {Meeting} //but in case of default we can import only one things
