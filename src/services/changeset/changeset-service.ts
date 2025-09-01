import api from '@/api/api';

type changeset = {
  id: string;
  status: string;
  failureReason: string;
  expiry: any;
  type: 'update' | 'delete';
};

type ChangesetService = {
  getChangeset(id: string): Promise<changeset>;
};

export const changesetService: ChangesetService = {
  getChangeset: (id: string) => api.get(`/api/v1/changesets/${id}`).then((r) => r.json()),
};
