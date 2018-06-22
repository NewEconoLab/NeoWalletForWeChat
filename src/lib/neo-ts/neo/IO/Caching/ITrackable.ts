import { TrackState } from './TrackState'
export interface ITrackable<TKey> {
    key: TKey;
    trackState: TrackState;
}
