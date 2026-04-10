type Where = Record<string, any>;

const isObject = (value: unknown): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const matchWhere = (item: Record<string, any>, where?: Where): boolean => {
  if (!where) return true;

  if (Array.isArray(where.OR)) {
    return where.OR.some((cond) => matchWhere(item, cond));
  }

  if (Array.isArray(where.AND)) {
    return where.AND.every((cond) => matchWhere(item, cond));
  }

  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR' || key === 'AND') return true;
    const itemValue = item[key];

    if (isObject(value)) {
      if ('contains' in value) {
        const needle = String(value.contains ?? '');
        const hay = itemValue == null ? '' : String(itemValue);
        if (value.mode === 'insensitive') {
          return hay.toLowerCase().includes(needle.toLowerCase());
        }
        return hay.includes(needle);
      }

      if ('equals' in value) {
        return itemValue === value.equals;
      }

      return false;
    }

    if (value === null) {
      return itemValue === null || itemValue === undefined;
    }

    return itemValue === value;
  });
};

const applySelect = <T extends Record<string, any>>(
  record: T,
  select?: Record<string, any>,
): any => {
  if (!select) return record;
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(select)) {
    if (value === true) {
      result[key] = record[key];
      continue;
    }

    if (isObject(value) && 'select' in value) {
      const nested = record[key];
      if (Array.isArray(nested)) {
        result[key] = nested.map((item) => applySelect(item, value.select));
      } else if (nested === undefined || nested === null) {
        result[key] = nested;
      } else {
        result[key] = applySelect(nested, value.select);
      }
    }
  }

  return result;
};

type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  institutionName?: string | null;
  walletAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Project = {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  ownerId: string;
  imageUrl?: string | null;
  contractAddress?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

type Donation = {
  id: string;
  projectId: string;
  donorId: string;
  amount: number;
  txHash?: string | null;
  createdAt: Date;
};

type Milestone = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  order: number;
  released: boolean;
  txHash?: string | null;
  createdAt: Date;
};

type Store = {
  users: User[];
  projects: Project[];
  donations: Donation[];
  milestones: Milestone[];
};

export class PrismaClient {
  private static store: Store = {
    users: [],
    projects: [],
    donations: [],
    milestones: [],
  };

  private static counters = {
    user: 0,
    project: 0,
    donation: 0,
    milestone: 0,
  };

  private nextId(key: 'user' | 'project' | 'donation' | 'milestone') {
    PrismaClient.counters[key] += 1;
    return `${key}-${PrismaClient.counters[key]}`;
  }

  private get store() {
    return PrismaClient.store;
  }

  private withDonationRelations(donation: Donation) {
    const donor = this.store.users.find((user) => user.id === donation.donorId);
    return { ...donation, donor };
  }

  $connect = jest.fn(async () => undefined);
  $disconnect = jest.fn(async () => undefined);

  $transaction = jest.fn(async (operations: Array<Promise<any> | (() => any)>) => {
    const results: any[] = [];
    for (const op of operations) {
      results.push(typeof op === 'function' ? await op() : await op);
    }
    return results;
  });

  user = {
    create: jest.fn(async (args: { data: Partial<User>; select?: any }) => {
      const now = new Date();
      const user: User = {
        id: this.nextId('user'),
        name: args.data.name ?? '',
        email: args.data.email ?? '',
        passwordHash: args.data.passwordHash ?? '',
        role: args.data.role ?? 'DONOR',
        institutionName: args.data.institutionName ?? null,
        walletAddress: args.data.walletAddress ?? null,
        createdAt: now,
        updatedAt: now,
      };
      this.store.users.push(user);
      return applySelect(user, args.select);
    }),
    findUnique: jest.fn(async (args: { where: Where; select?: any }) => {
      const user = this.store.users.find((item) => matchWhere(item, args.where));
      return user ? applySelect(user, args.select) : null;
    }),
    deleteMany: jest.fn(async (args?: { where?: Where }) => {
      const before = this.store.users.length;
      if (!args?.where) {
        this.store.users = [];
      } else {
        this.store.users = this.store.users.filter(
          (item) => !matchWhere(item, args.where),
        );
      }
      return { count: before - this.store.users.length };
    }),
  };

  project = {
    create: jest.fn(async (args: { data: Partial<Project>; select?: any }) => {
      const now = new Date();
      const project: Project = {
        id: this.nextId('project'),
        title: args.data.title ?? '',
        description: args.data.description ?? '',
        goalAmount: Number(args.data.goalAmount ?? 0),
        ownerId: args.data.ownerId ?? '',
        imageUrl: args.data.imageUrl ?? null,
        contractAddress: args.data.contractAddress ?? null,
        status: args.data.status ?? 'DRAFT',
        createdAt: now,
        updatedAt: now,
        deletedAt: args.data.deletedAt ?? null,
      };
      this.store.projects.push(project);
      return applySelect(project, args.select);
    }),
    findFirst: jest.fn(async (args: { where?: Where; select?: any }) => {
      const project = this.store.projects.find((item) =>
        matchWhere(item, args.where),
      );
      return project ? applySelect(project, args.select) : null;
    }),
    findMany: jest.fn(
      async (args: { where?: Where; orderBy?: any; select?: any }) => {
        let projects = this.store.projects.filter((item) =>
          matchWhere(item, args.where),
        );
        if (args.orderBy?.createdAt) {
          const dir = args.orderBy.createdAt;
          projects = projects.sort((a, b) =>
            dir === 'desc'
              ? b.createdAt.getTime() - a.createdAt.getTime()
              : a.createdAt.getTime() - b.createdAt.getTime(),
          );
        }
        return projects.map((item) => applySelect(item, args.select));
      },
    ),
    update: jest.fn(
      async (args: { where: Where; data: Partial<Project>; select?: any }) => {
        const project = this.store.projects.find((item) =>
          matchWhere(item, args.where),
        );
        if (!project) return null;
        Object.assign(project, args.data, { updatedAt: new Date() });
        return applySelect(project, args.select);
      },
    ),
    deleteMany: jest.fn(async (args?: { where?: Where }) => {
      const before = this.store.projects.length;
      if (!args?.where) {
        this.store.projects = [];
      } else {
        this.store.projects = this.store.projects.filter(
          (item) => !matchWhere(item, args.where),
        );
      }
      return { count: before - this.store.projects.length };
    }),
    count: jest.fn(async (args?: { where?: Where }) => {
      return this.store.projects.filter((item) => matchWhere(item, args?.where))
        .length;
    }),
  };

  donation = {
    create: jest.fn(async (args: { data: Partial<Donation>; select?: any }) => {
      const now = new Date();
      const donation: Donation = {
        id: this.nextId('donation'),
        projectId: args.data.projectId ?? '',
        donorId: args.data.donorId ?? '',
        amount: Number(args.data.amount ?? 0),
        txHash: args.data.txHash ?? null,
        createdAt: now,
      };
      this.store.donations.push(donation);
      return applySelect(this.withDonationRelations(donation), args.select);
    }),
    findUnique: jest.fn(async (args: { where: Where; select?: any }) => {
      const donation = this.store.donations.find((item) =>
        matchWhere(item, args.where),
      );
      if (!donation) return null;
      return applySelect(this.withDonationRelations(donation), args.select);
    }),
    findMany: jest.fn(
      async (args: { where?: Where; orderBy?: any; select?: any }) => {
        let donations = this.store.donations.filter((item) =>
          matchWhere(item, args.where),
        );
        if (args.orderBy?.createdAt) {
          const dir = args.orderBy.createdAt;
          donations = donations.sort((a, b) =>
            dir === 'desc'
              ? b.createdAt.getTime() - a.createdAt.getTime()
              : a.createdAt.getTime() - b.createdAt.getTime(),
          );
        }
        return donations.map((item) =>
          applySelect(this.withDonationRelations(item), args.select),
        );
      },
    ),
    deleteMany: jest.fn(async (args?: { where?: Where }) => {
      const before = this.store.donations.length;
      if (!args?.where) {
        this.store.donations = [];
      } else {
        this.store.donations = this.store.donations.filter(
          (item) => !matchWhere(item, args.where),
        );
      }
      return { count: before - this.store.donations.length };
    }),
  };

  milestone = {
    deleteMany: jest.fn(async (args?: { where?: Where }) => {
      const before = this.store.milestones.length;
      if (!args?.where) {
        this.store.milestones = [];
      } else {
        this.store.milestones = this.store.milestones.filter(
          (item) => !matchWhere(item, args.where),
        );
      }
      return { count: before - this.store.milestones.length };
    }),
  };
}
