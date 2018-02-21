namespace Neo.IO.Caching
{
    export interface ITrackable<TKey>
    {
        key: TKey;
        trackState: TrackState;
    }
}
