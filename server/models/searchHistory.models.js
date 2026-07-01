import mongoose from "mongoose";

const searchHistorySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true }
}, { timestamps: true });

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

export default SearchHistory;