import { api } from "./api";

export type ProjectStatus =
  | "DRAFT"
  | "ACTIVE"
  | "FUNDED"
  | "COMPLETED"
  | "CANCELLED";

export interface Project {
  id: string;
  title: string;
  description: string;
  goalAmount: string;
  imageUrl?: string;
  contractAddress?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  data: Project[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: string;
  order: number;
  released: boolean;
  txHash?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  projectId: string;
  donorId: string;
  amount: string;
  txHash: string;
  createdAt: string;
}

export interface QueryProjectParams {
  search?: string;
  status?: ProjectStatus;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "title" | "goalAmount";
  order?: "asc" | "desc";
}

export async function getProjects(
  params?: QueryProjectParams,
): Promise<ProjectsResponse> {
  const response = await api.get<ProjectsResponse>("/projects", { params });
  return response.data;
}

export async function getProjectById(id: string): Promise<Project> {
  const response = await api.get<Project>(`/projects/${id}`);
  return response.data;
}

export async function getProjectMilestones(id: string): Promise<Milestone[]> {
  const response = await api.get<Milestone[]>(`/projects/${id}/milestones`);
  return response.data;
}

export async function getProjectDonations(id: string): Promise<Donation[]> {
  const response = await api.get<Donation[]>(`/projects/${id}/donations`);
  return response.data;
}
