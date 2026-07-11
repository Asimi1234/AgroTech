import { useTranslation } from 'react-i18next';
import { Button } from './Button';

export const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => {
  const { t } = useTranslation('common');
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <h3 className="text-lg font-bold text-red-800">{t('loadError.title')}</h3>
      <p className="mx-auto mt-1 max-w-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          {t('loadError.retry')}
        </Button>
      )}
    </div>
  );
};
