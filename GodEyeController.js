import { SituationRoom } from './situation-room.js';

export const GodEyeController = {
    async getFinalConsensus(archiveDb, liveLoad, bajiNum, currentResultsWithNull) {
        const consensus = await SituationRoom.getConsensus(archiveDb, liveLoad, bajiNum, currentResultsWithNull);
        return consensus; // পুরো অবজেক্ট রিটার্ন করি
    }
};