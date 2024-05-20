export type DownloadInfo = {
  id: string;
  status:
    | "complete"
    | "in_progress"
    | "pending"
    | "processing_complete"
    | "complete"
    | "failed"
    | "expired";

  failureReason: string;
  targetId: string;
  expiry: string;
};

export type CompleteDownloadProps = {
  downloadInfo: DownloadInfo;
};
