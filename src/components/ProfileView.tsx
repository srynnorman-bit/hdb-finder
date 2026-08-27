import React, { useState } from 'react';
import { USER_PROFILE_DEFAULT } from '../data/hdbData';

export const ProfileView: React.FC = () => {
  const [income, setIncome] = useState<number>(USER_PROFILE_DEFAULT.monthlyIncome);
  const [buyerType, setBuyerType] = useState<string>(USER_PROFILE_DEFAULT.buyerType);
  const [preferredFlat, setPreferredFlat] = useState<string>('4-Room');
  const [carparkAlerts, setCarparkAlerts] = useState<boolean>(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Singapore CPF Grant Calculation Estimate
  // EHG scales inversely with income up to $9,000 for couples
  const calculateEHG = (inc: number) => {
    if (inc <= 1500) return 80000;
    if (inc <= 2500) return 75000;
    if (inc <= 3500) return 65000;
    if (inc <= 4500) return 55000;
    if (inc <= 5500) return 45000;
    if (inc <= 6500) return 35000;
    if (inc <= 7500) return 25000;
    if (inc <= 8500) return 15000;
    if (inc <= 9000) return 5000;
    return 0; // Income ceiling for EHG
  };

  // Singapore 30% MSR (Mortgage Servicing Ratio) Max Monthly Installment
  const maxMonthlyInstallmentMSR = Math.round(income * 0.30);
  // Estimate max loan based on 25 years @ 2.6% HDB Concessionary Loan
  const estimatedMaxLoanHDB = Math.round(maxMonthlyInstallmentMSR * 220);
  const estimatedGrant = calculateEHG(income) + 50000; // Plus CPF Family Grant $50k for 4-room/smaller

  const handleSaveProfile = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-[34px] font-bold text-[#091c35] tracking-tight">
          Buyer Profile & Settings
        </h1>
        <p className="text-[14px] leading-[20px] text-[#434654]">
          Personalize grant estimates, mortgage limits, and price alerts
        </p>
      </div>

      {/* User Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs flex items-center gap-4">
        <img
          alt="Ryan Norman"
          className="w-16 h-16 rounded-full object-cover ring-2 ring-[#dfe8ff]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByZr8-_fD44_scv9mcVzF1M5xE5vy-luWK0VrJKVnicNTgUOa1fRaaFx9XPLnio53zPdMMhuSJoobr-Sqz3iAk4jHPX_nRlfJmh6B8J7_uns85Md_HV2gg1qm_KryHzjG4ekwXNzppoIJ9vJL--Sh-WI3XqZLGyGb6y4iBFrRhw4nuHS6VZpPCGcqLpbJhaZcwCrWQ_koFZFcYMlObIG8H6Jf8Kqz8xWtIbrh5gAokbHZEMpBF0dcOew"
        />
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-[#091c35]">{USER_PROFILE_DEFAULT.name}</h2>
          <span className="text-[13px] text-[#737685]">{USER_PROFILE_DEFAULT.email}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#dfe8ff] text-[#003d9b]">
              Verified HDB Buyer
            </span>
            <span className="text-[11px] font-medium text-[#00687a]">
              Singapore Citizen / SC Couple
            </span>
          </div>
        </div>
      </div>

      {/* Financial & Grant Eligibility Form */}
      <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs flex flex-col gap-4">
        <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#003d9b]">
          Household Financial Profile
        </h3>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#091c35]">
            Combined Gross Monthly Income: <strong className="text-[#003d9b]">${income.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={2000}
            max={20000}
            step={250}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full h-2 bg-[#e7eeff] rounded-lg appearance-none cursor-pointer accent-[#003d9b]"
          />
          <div className="flex justify-between text-[11px] text-[#737685]">
            <span>$2,000/mo</span>
            <span>$10,000/mo</span>
            <span>$20,000/mo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#091c35]">Applicant Scheme</label>
            <select
              value={buyerType}
              onChange={(e) => setBuyerType(e.target.value)}
              className="bg-[#f0f3ff] text-[#091c35] text-[13px] px-3 py-2 rounded-xl border border-[#dfe8ff] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
            >
              <option value="First-Timer (Couple / Family)">First-Timer (Couple / Family)</option>
              <option value="First-Timer (Single SC Age 35+)">First-Timer (Single SC Age 35+)</option>
              <option value="Second-Timer Upgrader">Second-Timer Upgrader</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#091c35]">Target Flat Type</label>
            <select
              value={preferredFlat}
              onChange={(e) => setPreferredFlat(e.target.value)}
              className="bg-[#f0f3ff] text-[#091c35] text-[13px] px-3 py-2 rounded-xl border border-[#dfe8ff] focus:outline-none focus:ring-2 focus:ring-[#003d9b]"
            >
              <option value="3-Room">3-Room Flat</option>
              <option value="4-Room">4-Room Flat</option>
              <option value="5-Room">5-Room Flat</option>
              <option value="Executive">Executive Apartment / Maisonette</option>
            </select>
          </div>
        </div>

        {/* Calculated Grant & Loan Output */}
        <div className="mt-2 p-4 bg-[#f0f3ff] rounded-xl border border-[#cadbfc] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#00687a] font-bold">
                Estimated CPF Housing Grants
              </span>
              <p className="text-[20px] font-bold text-[#004e32]">
                Up to ${estimatedGrant.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#434654] font-semibold">
                30% MSR Max Monthly
              </span>
              <p className="text-[20px] font-bold text-[#003d9b]">
                ${maxMonthlyInstallmentMSR.toLocaleString()}/mo
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#434654] border-t border-[#cadbfc] pt-2">
            Includes Enhanced CPF Housing Grant (EHG) and CPF Family Grant. Estimated max HDB Concessionary Loan eligibility: <strong>${estimatedMaxLoanHDB.toLocaleString()}</strong>.
          </p>
        </div>
      </div>

      {/* Alert Preferences */}
      <div className="bg-white p-5 rounded-2xl border border-[#e7eeff] shadow-xs flex flex-col gap-3">
        <h3 className="text-[12px] font-bold tracking-wider uppercase text-[#003d9b]">
          Real-time Alerts & Notifications
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-[#f0f3ff]">
          <div>
            <h4 className="text-[14px] font-semibold text-[#091c35]">Live Carpark Status Alerts</h4>
            <p className="text-[12px] text-[#434654]">Notify if available lots drop below 20 in saved estates</p>
          </div>
          <button
            onClick={() => setCarparkAlerts(!carparkAlerts)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              carparkAlerts ? 'bg-[#003d9b]' : 'bg-[#c3c6d6]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                carparkAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-[14px] font-semibold text-[#091c35]">Resale Price Movement</h4>
            <p className="text-[12px] text-[#434654]">Notify on new transactions matching Tampines and Bishan</p>
          </div>
          <button
            onClick={() => setPriceDropAlerts(!priceDropAlerts)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              priceDropAlerts ? 'bg-[#003d9b]' : 'bg-[#c3c6d6]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                priceDropAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSaveProfile}
          className="w-full py-3 bg-[#003d9b] text-white text-[14px] font-bold rounded-xl hover:bg-[#003d9b]/90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          <span>Save Preferences</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#82f9be]/30 border border-[#004e32]/30 text-[#002113] rounded-xl text-center text-[13px] font-semibold animate-in fade-in">
          ✓ Profile and budget preferences saved successfully!
        </div>
      )}
    </div>
  );
};
