import { useState, useEffect } from 'react';
import { getRegions, getProvinces, getCities, getBarangays, type PsgcLocation } from '../../../features/psgc/api';

export interface PsgcSelection {
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  barangayCode: string;
  barangayName: string;
  fullAddress: string;
}

interface PsgcDropdownsProps {
  onChange: (selection: PsgcSelection) => void;
  error?: string;
}

export default function PsgcDropdowns({ onChange, error }: PsgcDropdownsProps) {
  const [regions, setRegions] = useState<PsgcLocation[]>([]);
  const [provinces, setProvinces] = useState<PsgcLocation[]>([]);
  const [cities, setCities] = useState<PsgcLocation[]>([]);
  const [barangays, setBarangays] = useState<PsgcLocation[]>([]);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');

  const [loading, setLoading] = useState({ regions: true, provinces: false, cities: false, barangays: false });

  // Load regions on mount
  useEffect(() => {
    setLoading(l => ({ ...l, regions: true }));
    getRegions()
      .then(setRegions)
      .catch(() => setRegions([]))
      .finally(() => setLoading(l => ({ ...l, regions: false })));
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (!selectedRegion) {
      setProvinces([]);
      setSelectedProvince('');
      setCities([]);
      setSelectedCity('');
      setBarangays([]);
      setSelectedBarangay('');
      return;
    }
    setLoading(l => ({ ...l, provinces: true }));
    setSelectedProvince('');
    setCities([]);
    setSelectedCity('');
    setBarangays([]);
    setSelectedBarangay('');
    getProvinces(selectedRegion)
      .then(setProvinces)
      .catch(() => setProvinces([]))
      .finally(() => setLoading(l => ({ ...l, provinces: false })));
  }, [selectedRegion]);

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      setSelectedCity('');
      setBarangays([]);
      setSelectedBarangay('');
      return;
    }
    setLoading(l => ({ ...l, cities: true }));
    setSelectedCity('');
    setBarangays([]);
    setSelectedBarangay('');
    getCities(selectedProvince)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoading(l => ({ ...l, cities: false })));
  }, [selectedProvince]);

  // Load barangays when city changes
  useEffect(() => {
    if (!selectedCity) {
      setBarangays([]);
      setSelectedBarangay('');
      return;
    }
    setLoading(l => ({ ...l, barangays: true }));
    setSelectedBarangay('');
    getBarangays(selectedCity)
      .then(setBarangays)
      .catch(() => setBarangays([]))
      .finally(() => setLoading(l => ({ ...l, barangays: false })));
  }, [selectedCity]);

  // Emit selection when barangay is picked (or any level)
  useEffect(() => {
    const regionName = regions.find(r => r.code === selectedRegion)?.name || '';
    const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
    const cityName = cities.find(c => c.code === selectedCity)?.name || '';
    const barangayName = barangays.find(b => b.code === selectedBarangay)?.name || '';

    const parts = [barangayName, cityName, provinceName, regionName].filter(Boolean);
    const fullAddress = parts.join(', ');

    onChange({
      regionCode: selectedRegion,
      regionName,
      provinceCode: selectedProvince,
      provinceName,
      cityCode: selectedCity,
      cityName,
      barangayCode: selectedBarangay,
      barangayName,
      fullAddress,
    });
  }, [selectedRegion, selectedProvince, selectedCity, selectedBarangay]);

  const selectClass = `w-full px-3 py-2.5 rounded-lg border text-sm transition-all outline-none
    border-neutral-200 focus:border-primary focus:ring-2 focus:ring-primary/10
    bg-white text-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-400`;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-neutral-700">Business Address</label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Region */}
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">Region</label>
          <select
            className={selectClass}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            disabled={loading.regions}
          >
            <option value="">{loading.regions ? 'Loading...' : 'Select Region'}</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Province */}
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">Province</label>
          <select
            className={selectClass}
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            disabled={!selectedRegion || loading.provinces}
          >
            <option value="">{loading.provinces ? 'Loading...' : 'Select Province'}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* City/Municipality */}
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">City / Municipality</label>
          <select
            className={selectClass}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedProvince || loading.cities}
          >
            <option value="">{loading.cities ? 'Loading...' : 'Select City'}</option>
            {cities.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Barangay */}
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">Barangay</label>
          <select
            className={selectClass}
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            disabled={!selectedCity || loading.barangays}
          >
            <option value="">{loading.barangays ? 'Loading...' : 'Select Barangay'}</option>
            {barangays.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}
