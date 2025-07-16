import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { t } from '@/lib/translations';

interface SyncStatusProps {
  isConnected: boolean;
  loading: boolean;
  error?: string | null;
  lastUpdated?: string;
  onRefresh?: () => void;
  className?: string;
}

export function SyncStatus({ 
  isConnected, 
  loading, 
  error, 
  lastUpdated,
  onRefresh,
  className = ''
}: SyncStatusProps) {
  const getStatusColor = () => {
    if (error) return 'destructive';
    if (!isConnected) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (error) return t('sync.error');
    if (loading) return t('sync.syncing');
    if (!isConnected) return t('sync.disconnected');
    return t('sync.connected');
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-3 w-3" />;
    if (loading) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (!isConnected) return <WifiOff className="h-3 w-3" />;
    return <Wifi className="h-3 w-3" />;
  };

  const formatLastUpdated = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return t('sync.justNow');
    if (diffMinutes < 60) return `${diffMinutes} ${t('sync.minutesAgo')}`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ${t('sync.hoursAgo')}`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={getStatusColor()} className="flex items-center space-x-1">
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>
      
      {lastUpdated && (
        <span className="text-xs text-muted-foreground">
          {formatLastUpdated(lastUpdated)}
        </span>
      )}
      
      {onRefresh && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={loading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      )}
      
      {error && (
        <div className="text-xs text-destructive max-w-xs truncate" title={error}>
          {error}
        </div>
      )}
    </div>
  );
}

// Compact version for headers/toolbars
export function SyncStatusCompact(props: SyncStatusProps) {
  return <SyncStatus {...props} className="scale-90" />;
}

// Detailed version for status pages
export function SyncStatusDetailed({ 
  isConnected, 
  loading, 
  error, 
  lastUpdated,
  onRefresh 
}: SyncStatusProps) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{t('sync.title')}</h4>
        <SyncStatus 
          isConnected={isConnected}
          loading={loading}
          error={error}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
        />
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <div>
          <span className="font-medium">{t('sync.status')}: </span>
          {error ? t('sync.errorDetails') : 
           loading ? t('sync.syncingDetails') :
           isConnected ? t('sync.connectedDetails') : t('sync.disconnectedDetails')}
        </div>
        
        {lastUpdated && (
          <div>
            <span className="font-medium">{t('sync.lastUpdate')}: </span>
            {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
        
        {error && (
          <div className="text-destructive">
            <span className="font-medium">{t('sync.errorMessage')}: </span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
