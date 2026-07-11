import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cooperative, GroupMessage } from '@/types';

/** Roles that unlock group-lead editing (description + announcements). */
const LEAD_ROLES = ['Chairperson', 'Coordinator'];

interface GroupState {
  /** Explicit join(true)/leave(false) decisions, keyed by group id. */
  joinOverrides: Record<string, boolean>;
  /** Lead edits to a group's description, keyed by group id. */
  descriptions: Record<string, string>;
  /** Lead announcements, newest first, keyed by group id. */
  announcements: Record<string, GroupMessage[]>;
  join: (id: string) => void;
  leave: (id: string) => void;
  setDescription: (id: string, text: string) => void;
  addAnnouncement: (id: string, message: GroupMessage) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      joinOverrides: {},
      descriptions: {},
      announcements: {},
      join: (id) =>
        set((s) => ({ joinOverrides: { ...s.joinOverrides, [id]: true } })),
      leave: (id) =>
        set((s) => ({ joinOverrides: { ...s.joinOverrides, [id]: false } })),
      setDescription: (id, text) =>
        set((s) => ({ descriptions: { ...s.descriptions, [id]: text } })),
      addAnnouncement: (id, message) =>
        set((s) => ({
          announcements: {
            ...s.announcements,
            [id]: [message, ...(s.announcements[id] ?? [])],
          },
        })),
    }),
    { name: 'agrotech-groups' },
  ),
);

const isNamedMember = (group: Cooperative, userName?: string): boolean =>
  Boolean(userName) && group.members.some((m) => m.name === userName);

/**
 * A group counts as "mine" if the user has explicitly joined it, or — absent an
 * explicit choice — if they already appear in its member roster. An explicit
 * leave overrides the roster match.
 */
export const isGroupMember = (
  group: Cooperative,
  userName: string | undefined,
  overrides: Record<string, boolean>,
): boolean => {
  const override = overrides[group.id];
  if (typeof override === 'boolean') return override;
  return isNamedMember(group, userName);
};

/** The user leads a group when they hold a lead role in its roster. */
export const isGroupLead = (
  group: Cooperative,
  userName: string | undefined,
): boolean =>
  Boolean(userName) &&
  group.members.some(
    (m) => m.name === userName && LEAD_ROLES.includes(m.role),
  );
