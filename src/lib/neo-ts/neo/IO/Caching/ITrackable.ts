export interface ITrackable<TKey> {
    key: TKey;
    trackState: TrackState;
}
