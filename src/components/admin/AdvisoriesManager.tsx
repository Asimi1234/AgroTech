import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAsync } from '@/hooks/useAsync';
import { api } from '@/services/api';
import { crops, cropLabel } from '@/data/mockData';
import { advisoryDetail, advisoryTitle, advisoryWindow } from '@/i18n/catalog';
import type { Advisory, AdvisoryInput } from '@/types';

const severityTone: Record<Advisory['severity'], 'brand' | 'warning' | 'danger'> =
  {
    info: 'brand',
    action: 'warning',
    warning: 'danger',
  };

const emptyDraft = (): AdvisoryInput => ({
  cropType: 'maize',
  title: '',
  window: '',
  detail: '',
  severity: 'info',
});

const AdvisoryForm = ({
  initial,
  busy,
  onSubmit,
  onCancel,
}: {
  initial: AdvisoryInput;
  busy: boolean;
  onSubmit: (input: AdvisoryInput) => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('admin');
  const [draft, setDraft] = useState<AdvisoryInput>(initial);

  const cropOptions = crops.map((c) => ({ value: c.id, label: c.label }));
  const severityOptions: { value: Advisory['severity']; label: string }[] = [
    { value: 'info', label: t('advisories.sev.info') },
    { value: 'action', label: t('advisories.sev.action') },
    { value: 'warning', label: t('advisories.sev.warning') },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.detail.trim()) return;
    onSubmit({
      ...draft,
      title: draft.title.trim(),
      window: draft.window.trim(),
      detail: draft.detail.trim(),
    });
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-earth-200 bg-earth-50 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={t('advisories.fieldTitle')}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
        />
        <Input
          label={t('advisories.fieldWindow')}
          value={draft.window}
          onChange={(e) => setDraft({ ...draft, window: e.target.value })}
        />
        <Select
          label={t('advisories.fieldCrop')}
          options={cropOptions}
          value={draft.cropType}
          onChange={(e) =>
            setDraft({ ...draft, cropType: e.target.value as Advisory['cropType'] })
          }
        />
        <Select
          label={t('advisories.fieldSeverity')}
          options={severityOptions}
          value={draft.severity}
          onChange={(e) =>
            setDraft({
              ...draft,
              severity: e.target.value as Advisory['severity'],
            })
          }
        />
      </div>
      <div className="mt-3">
        <label className="mb-1.5 block text-sm font-semibold text-slate-800">
          {t('advisories.fieldDetail')}
        </label>
        <textarea
          value={draft.detail}
          onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
          rows={3}
          required
          className="focus-ring w-full rounded-lg border-2 border-earth-200 bg-white px-3 py-2 text-base text-slate-900"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="submit" size="sm" disabled={busy}>
          {t('advisories.save')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t('advisories.cancel')}
        </Button>
      </div>
    </form>
  );
};

export const AdvisoriesManager = () => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useAsync(
    () => api.getAdvisories(),
    [],
  );
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await reload();
      setAdding(false);
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t('advisories.title')}</CardTitle>
          <p className="mt-0.5 text-sm text-slate-500">
            {t('advisories.subtitle')}
          </p>
        </div>
        {!adding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
          >
            <Icon name="plus" className="h-4 w-4" />
            {t('advisories.add')}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {loading && <Skeleton className="h-56 w-full" />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data && (
          <div className="space-y-3">
            {adding && (
              <AdvisoryForm
                initial={emptyDraft()}
                busy={busy}
                onSubmit={(input) => run(() => api.createAdvisory(input))}
                onCancel={() => setAdding(false)}
              />
            )}

            {data.map((advisory) =>
              editingId === advisory.id ? (
                <AdvisoryForm
                  key={advisory.id}
                  initial={{
                    cropType: advisory.cropType,
                    title: advisory.title,
                    window: advisory.window,
                    detail: advisory.detail,
                    severity: advisory.severity,
                  }}
                  busy={busy}
                  onSubmit={(input) =>
                    run(() => api.updateAdvisory(advisory.id, input))
                  }
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  key={advisory.id}
                  className="rounded-lg border border-earth-200 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {advisoryTitle(advisory)}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Badge tone={severityTone[advisory.severity]}>
                        {t(`advisories.sev.${advisory.severity}`)}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setEditingId(advisory.id);
                        }}
                        aria-label={t('advisories.editAction')}
                        className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-brand-50 hover:text-brand-800"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(() => api.deleteAdvisory(advisory.id))
                        }
                        aria-label={t('advisories.deleteAction')}
                        className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {advisoryDetail(advisory)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {cropLabel(advisory.cropType)} · {advisoryWindow(advisory)}
                  </p>
                </div>
              ),
            )}
            <p className="pt-1 text-xs text-slate-400">
              {t('advisories.persistNote')}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
