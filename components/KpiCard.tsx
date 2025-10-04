
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit, icon: Icon }) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow-md sm:px-6 sm:pt-6">
      <dt>
        <div className="absolute rounded-md bg-usace-blue p-3">
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium text-gray-500">{title}</p>
      </dt>
      <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {unit && <p className="ml-2 flex items-baseline text-sm font-semibold text-usace-blue">{unit}</p>}
      </dd>
    </div>
  );
};

export default KpiCard;
