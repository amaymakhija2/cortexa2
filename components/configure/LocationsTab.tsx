import React from 'react';
import { OfficeMapping, RawEHROffice, LocationGroup } from '../OfficeMapping';

export interface LocationsTabProps {
  ehrOffices: RawEHROffice[];
  locationGroups: LocationGroup[];
  onUpdateGroups: (groups: LocationGroup[]) => void;
}

export const LocationsTab: React.FC<LocationsTabProps> = ({
  ehrOffices,
  locationGroups,
  onUpdateGroups,
}) => {
  return (
    <OfficeMapping
      ehrOffices={ehrOffices}
      locationGroups={locationGroups}
      onUpdateGroups={onUpdateGroups}
    />
  );
};
