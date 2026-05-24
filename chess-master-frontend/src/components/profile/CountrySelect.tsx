import React, { useMemo } from "react";
import { getSelectableCountries } from "@chess-master/schemas";

interface CountrySelectProps {
  country?: string | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  country,
  onChange,
  className,
}) => {
  const countries = useMemo(() => getSelectableCountries(), []);

  return (
    <select
      id="country"
      name="country"
      value={country || ""}
      onChange={onChange}
      className={className}
    >
      <option value="">Select country</option>
      {countries.map(({ code, name, flag }) => (
        <option key={code} value={code}>
          {flag} {name}
        </option>
      ))}
    </select>
  );
};
