import api from "../../api/api";

interface TransferService {
  startTransfer(body: CreateTransferRequest): Promise<Transfer>;
}

const basePath = "/api/v1/transfers";

const startTransfer = (body: CreateTransferRequest): Promise<Transfer> => {
  return api.post(basePath, { body }).then((r) => r.json());
};

export const transferService: TransferService = {
  startTransfer,
};
