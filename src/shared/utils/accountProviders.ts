import {
  accountProviders,
  getAccountProvider,
} from '@/shared/constants/accountProviders';
import type { AccountType } from '@/shared/types/finance';

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchAccountProviders(type: AccountType, query: string) {
  const terms = normalize(query).split(' ').filter(Boolean);
  return accountProviders.filter((provider) => {
    const haystack = normalize(
      `${provider.name} ${provider.fullName} ${provider.aliases}`,
    );
    return (
      provider.type === type && terms.every((term) => haystack.includes(term))
    );
  });
}

/** Selection only suggests a name; never replace a user-entered nickname. */
export function suggestAccountName(
  name: string,
  previousId?: string | null,
  nextId?: string | null,
) {
  const previous = getAccountProvider(previousId);
  const next = getAccountProvider(nextId);
  if (!name.trim() || name === previous?.name) return next?.name ?? '';
  return name;
}
