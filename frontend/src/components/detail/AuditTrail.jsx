import React from 'react';
import { Panel } from './AISummaryPanel';
import StatusDot from '../ui/StatusDot';
import { format } from 'date-fns';

const AuditTrail = ({ events = [] }) => {
  return (
    <Panel eyebrow="AUDIT TRAIL">
      <div className="flex flex-col gap-[10px]">
        {events.map((event, idx) => (
          <div key={event.id || idx} className="grid grid-cols-[auto_1fr_auto] gap-[10px] items-start">
            <StatusDot 
              status={event.severity === 'success' ? 'analyzed' : event.severity === 'warning' ? 'processing' : event.severity === 'danger' ? 'failed' : 'queued'} 
              size="xs" 
              className="mt-[6px]"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-fg-primary">{event.label}</span>
              {event.sub && <span className="text-[11px] text-fg-tertiary">{event.sub}</span>}
            </div>
            <span className="text-mono text-[11px] text-fg-tertiary">
              {event.timestamp ? format(new_date(event.timestamp), 'HH:mm:ss') : '14:32:04'}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default AuditTrail;
