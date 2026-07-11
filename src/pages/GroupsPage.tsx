import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { cropLabel, regionLabel } from '@/data/mockData';
import {
  cooperativeDescription,
  cooperativeName,
  memberRole,
  messageBody,
} from '@/i18n/catalog';
import { useAuthStore } from '@/store/authStore';
import { isGroupLead, isGroupMember, useGroupStore } from '@/store/groupStore';
import { cn } from '@/lib/cn';
import type { Cooperative, GroupMessage } from '@/types';

const initials = (name: string): string =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

const GroupMessaging = ({
  group,
  canPost,
}: {
  group: Cooperative;
  canPost: boolean;
}) => {
  const { t } = useTranslation('groups');
  const userName = useAuthStore((s) => s.user?.name ?? 'You');
  const [messages, setMessages] = useState<GroupMessage[]>(group.messages);
  const [draft, setDraft] = useState('');

  useEffect(() => setMessages(group.messages), [group]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        author: userName,
        timestamp: t('justNow'),
        body,
      },
    ]);
    setDraft('');
  };

  return (
    <div>
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => {
          const mine = message.author === userName;
          return (
            <div
              key={message.id}
              className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2',
                  mine
                    ? 'rounded-br-sm bg-brand-700 text-white'
                    : 'rounded-bl-sm bg-earth-100 text-slate-800',
                )}
              >
                {!mine && (
                  <p className="text-xs font-bold text-brand-800">
                    {message.author}
                  </p>
                )}
                <p className="text-sm">{messageBody(message)}</p>
              </div>
              <span className="mt-0.5 text-xs text-slate-400">
                {message.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {canPost ? (
        <>
          <form onSubmit={send} className="mt-3 flex items-end gap-2">
            <Input
              placeholder={t('messagePlaceholder')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={t('messagePlaceholder')}
            />
            <Button
              type="submit"
              disabled={!draft.trim()}
              aria-label={t('sendMessage')}
            >
              <Icon name="send" className="h-5 w-5" />
            </Button>
          </form>
          <p className="mt-2 text-xs text-slate-400">{t('messagingNote')}</p>
        </>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-earth-300 bg-earth-50 px-3 py-2.5 text-sm text-slate-600">
          {t('joinToPost')}
        </p>
      )}
    </div>
  );
};

const Announcements = ({
  group,
  isLead,
}: {
  group: Cooperative;
  isLead: boolean;
}) => {
  const { t } = useTranslation('groups');
  const userName = useAuthStore((s) => s.user?.name ?? 'You');
  const announcements = useGroupStore((s) => s.announcements[group.id] ?? []);
  const addAnnouncement = useGroupStore((s) => s.addAnnouncement);
  const [draft, setDraft] = useState('');

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    addAnnouncement(group.id, {
      id: `${group.id}-ann-${announcements.length + 1}`,
      author: userName,
      timestamp: t('justNow'),
      body,
    });
    setDraft('');
  };

  if (!isLead && announcements.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('announcementsTitle')}</CardTitle>
        {isLead && (
          <p className="mt-0.5 text-sm text-slate-500">
            {t('announcementsLeadNote')}
          </p>
        )}
      </CardHeader>
      <CardBody>
        {isLead && (
          <form onSubmit={post} className="mb-4 flex items-end gap-2">
            <Input
              placeholder={t('announcementPlaceholder')}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={t('announcementPlaceholder')}
            />
            <Button type="submit" disabled={!draft.trim()}>
              <Icon name="pin" className="h-5 w-5" />
              <span className="hidden sm:inline">{t('post')}</span>
            </Button>
          </form>
        )}

        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500">{t('noAnnouncements')}</p>
        ) : (
          <ul className="space-y-3">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border-l-4 border-brand-600 bg-brand-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
                  <Icon name="pin" className="h-3.5 w-3.5" />
                  {a.author}
                  <span className="font-medium text-slate-400">
                    · {a.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
};

const GroupSummaryButton = ({
  group,
  active,
  lead,
  onSelect,
}: {
  group: Cooperative;
  active: boolean;
  lead: boolean;
  onSelect: () => void;
}) => {
  const { t } = useTranslation('groups');
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'focus-ring w-full rounded-xl border p-4 text-left transition-colors',
        active
          ? 'border-brand-600 bg-brand-50'
          : 'border-earth-200 bg-white hover:border-brand-300',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-slate-900">{cooperativeName(group)}</p>
        {lead && <Badge tone="brand">{t('leadBadge')}</Badge>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <Badge tone="earth">{cropLabel(group.cropFocus)}</Badge>
        <span className="flex items-center gap-1 text-slate-500">
          <Icon name="location" className="h-3.5 w-3.5" />
          {regionLabel(group.region)}
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <Icon name="groups" className="h-3.5 w-3.5" />
          {t('members', { count: group.memberCount })}
        </span>
      </div>
    </button>
  );
};

const DescriptionBlock = ({
  group,
  isLead,
}: {
  group: Cooperative;
  isLead: boolean;
}) => {
  const { t } = useTranslation('groups');
  const stored = useGroupStore((s) => s.descriptions[group.id]);
  const setDescription = useGroupStore((s) => s.setDescription);
  const effective = stored ?? cooperativeDescription(group);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(effective);

  const start = () => {
    setDraft(effective);
    setEditing(true);
  };
  const save = () => {
    setDescription(group.id, draft.trim() || cooperativeDescription(group));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mt-1">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="focus-ring w-full rounded-lg border-2 border-earth-200 px-3 py-2 text-sm text-slate-900"
          aria-label={t('editDescription')}
        />
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={save}>
            {t('save')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-start justify-between gap-3">
      <p className="text-sm text-slate-600">{effective}</p>
      {isLead && (
        <button
          type="button"
          onClick={start}
          className="focus-ring flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-brand-800 hover:bg-brand-50"
        >
          <Icon name="edit" className="h-4 w-4" />
          {t('edit')}
        </button>
      )}
    </div>
  );
};

export const GroupsPage = () => {
  const { t } = useTranslation('groups');
  const userName = useAuthStore((s) => s.user?.name);
  const joinOverrides = useGroupStore((s) => s.joinOverrides);
  const join = useGroupStore((s) => s.join);
  const leave = useGroupStore((s) => s.leave);
  const { data, loading, error, reload } = useAsync(
    () => api.getCooperatives(),
    [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const groups = useMemo(() => data ?? [], [data]);
  const mine = groups.filter((g) => isGroupMember(g, userName, joinOverrides));
  const discover = groups.filter(
    (g) => !isGroupMember(g, userName, joinOverrides),
  );

  const selected =
    groups.find((g) => g.id === selectedId) ?? mine[0] ?? groups[0] ?? null;

  const selectedIsMember = selected
    ? isGroupMember(selected, userName, joinOverrides)
    : false;
  const selectedIsLead = selected ? isGroupLead(selected, userName) : false;

  return (
    <div>
      <PageHeading title={t('title')} subtitle={t('subtitle')} />

      {loading && (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {error && !loading && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && selected && (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="space-y-6">
            <section>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                {t('myGroups')} ({mine.length})
              </h2>
              {mine.length === 0 ? (
                <p className="rounded-xl border border-dashed border-earth-300 bg-earth-50 p-4 text-sm text-slate-600">
                  {t('noMemberships')}
                </p>
              ) : (
                <ul className="space-y-3">
                  {mine.map((group) => (
                    <li key={group.id}>
                      <GroupSummaryButton
                        group={group}
                        active={group.id === selected.id}
                        lead={isGroupLead(group, userName)}
                        onSelect={() => setSelectedId(group.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {discover.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  {t('discover')} ({discover.length})
                </h2>
                <ul className="space-y-3">
                  {discover.map((group) => (
                    <li key={group.id}>
                      <GroupSummaryButton
                        group={group}
                        active={group.id === selected.id}
                        lead={false}
                        onSelect={() => setSelectedId(group.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle>{cooperativeName(selected)}</CardTitle>
                  {selectedIsLead ? (
                    <Badge tone="brand">{t('leadBadge')}</Badge>
                  ) : selectedIsMember ? (
                    <div className="flex items-center gap-2">
                      <Badge tone="success">
                        <Icon name="check" className="mr-1 h-3.5 w-3.5" />
                        {t('joined')}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => leave(selected.id)}
                        className="focus-ring flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-earth-100 hover:text-slate-700"
                      >
                        <Icon name="leave" className="h-4 w-4" />
                        {t('leave')}
                      </button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => join(selected.id)}>
                      <Icon name="join" className="h-4 w-4" />
                      {t('join')}
                    </Button>
                  )}
                </div>
                <DescriptionBlock group={selected} isLead={selectedIsLead} />
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <Badge tone="brand">{cropLabel(selected.cropFocus)}</Badge>
                  <Badge tone="earth">
                    {regionLabel(selected.region)} {t('common:profile.state')}
                  </Badge>
                  <Badge tone="neutral">
                    {t('members', { count: selected.memberCount })}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  {t('membersHeading')}
                </h3>
                <ul className="divide-y divide-earth-100">
                  {selected.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-earth-200 text-sm font-bold text-earth-800">
                          {initials(member.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {memberRole(member.role)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`tel:${member.phone.replace(/\s/g, '')}`}
                        className="focus-ring flex min-h-tap min-w-tap items-center gap-1 rounded-lg px-2 text-sm font-medium text-brand-800 hover:bg-brand-50"
                      >
                        <Icon name="phone" className="h-4 w-4" />
                        <span className="hidden sm:inline">{member.phone}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Announcements group={selected} isLead={selectedIsLead} />

            <Card>
              <CardHeader>
                <CardTitle>{t('messagesTitle')}</CardTitle>
              </CardHeader>
              <CardBody>
                <GroupMessaging group={selected} canPost={selectedIsMember} />
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
