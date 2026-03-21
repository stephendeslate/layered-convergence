export declare enum DisputeResolution {
    REFUNDED = "REFUNDED",
    RELEASED = "RELEASED"
}
export declare class ResolveDisputeDto {
    resolution: DisputeResolution;
}
