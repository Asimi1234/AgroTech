import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import i18n from '@/i18n';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Replace with a real logging sink in Phase 2.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false, message: '' });

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {i18n.t('error.title', { ns: 'common' })}
        </h1>
        <p className="mt-2 max-w-md text-slate-600">
          {i18n.t('error.body', { ns: 'common' })}
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={this.reset}>{i18n.t('error.retry', { ns: 'common' })}</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {i18n.t('error.reload', { ns: 'common' })}
          </Button>
        </div>
      </div>
    );
  }
}
