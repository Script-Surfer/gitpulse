import mongoose from "mongoose";

const cachedRepoSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        unique: true
    },
    ownerAvatarUrl: String,
    description: String,
    stars: Number,
    forks: Number,
    openIssues: Number,
    primaryLanguage: String,
    license: String,
    lastUpdated: Date,
    languages: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    commitActivity: [{ week: Number, total: Number, days: [Number] }],
    contributors: [{ login: String, avatarUrl: String, commits: Number }],
    issueVelocity: [{ month: String, opened: Number, closed: Number }],
    prVelocity: [{ month: String, opened: Number, merged: Number }],
    fetchedAt: { type: Date, default: Date.now }
});

const CachedRepo = mongoose.model("CachedRepo", cachedRepoSchema);

export default CachedRepo;