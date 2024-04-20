import type { Props } from 'payload/dist/admin/components/forms/field-types/Select/types';

import SelectInput from 'payload/dist/admin/components/forms/field-types/Select/Input';
import useField from 'payload/dist/admin/components/forms/useField';
import { useConfig } from 'payload/dist/admin/components/utilities/Config';
import React from 'react';

/**
 * This Component Fetch the select option on website
 */
export const ArchiveLink: React.FC<Props> = props => {
  const {
    path,
    name,
    label,
    required,
    admin: { readOnly, style, className, width, description, isClearable, isSortable = true },
  } = props;

  const config = useConfig();
  const collections = config.collections
    .map(collection => {
      // TODO: fix me, maybe there is another better way
      if (collection.slug === `media`) return null;
      if (collection.slug === `pages`) return null;
      if (collection.slug === `users`) return null;
      if (collection.slug === `redirects`) return null;
      if (collection.slug === `payload-preferences`) return null;
      if (collection.slug === `payload-migrations`) return null;

      return {
        label: collection.labels.plural,
        value: collection.slug,
      };
    })
    .filter(e => e !== null);
  const { value, setValue } = useField<Props>({ path });

  const onChange = e => {
    setValue(e.value);
  };

  return (
    <SelectInput
      className={className}
      description={description}
      isClearable={isClearable}
      //   hasMany={hasMany}
      isSortable={isSortable}
      label={label}
      name={name}
      //   showError={showError}
      onChange={onChange}
      options={collections}
      path={path}
      readOnly={readOnly}
      //   errorMessage={errorMessage}
      required={required}
      style={style}
      value={value as any}
      width={width}
    />
  );
};
