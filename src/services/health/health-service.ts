import api from "../../api/api";

interface HealthService {
  getHealth(): Promise<any>;
}

const getHealth = () =>
  api
    .get("/api/v1/health", { signal: AbortSignal.timeout(3000) })
    .then((r) => r.json());

export const healthService: HealthService = {
  getHealth,
};
