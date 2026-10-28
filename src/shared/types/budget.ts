export type Budget = {
  id: string;
  month: string;
  category: string;
  limit: number;
};
export type SaveBudget = Omit<Budget, 'id'> & { id?: string };
