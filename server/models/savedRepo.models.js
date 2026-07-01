import mongoose from "mongoose";

const savedRepoSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cachedRepoId: { type: mongoose.Schema.Types.ObjectId, ref: 'CachedRepo', required: true }
}, { timestamps: true });

const SavedRepo = mongoose.model("SavedRepo", savedRepoSchema);

export default SavedRepo;