import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { LoadingButton } from '../../ui/LoadingState';
import MobileAdminSectionHeader from './MobileAdminSectionHeader';

const panelClassName = 'rounded-[20px] border border-white/10 bg-white/[0.04] p-4';
const inputClassName = 'mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#EFBF04]/50';
const labelClassName = 'text-[11px] font-semibold tracking-[0.12em] text-gray-400';

export default function MobileSettings({
  adminProfile,
  oldPassword,
  newPassword,
  confirmPassword,
  onOldPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmitPasswordChange,
  pwdError,
  pwdMessage,
  isPwdLoading,
  onGenerateSetupKey,
  isSetupKeyLoading,
  setupKeyData,
  onLogout,
}) {
  return (
    <div className="space-y-4">
      <section className={panelClassName}>
        <MobileAdminSectionHeader title="Security" description="Update your admin password on this device." />
        <form aria-busy={isPwdLoading} onSubmit={onSubmitPasswordChange} className="mt-4 space-y-4">
          {pwdError && (
            <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {pwdError}
            </div>
          )}
          {pwdMessage && (
            <div role="status" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {pwdMessage}
            </div>
          )}
          <div>
            <label className={labelClassName}>Current password</label>
            <input type="password" className={inputClassName} value={oldPassword} onChange={onOldPasswordChange} required />
          </div>
          <div>
            <label className={labelClassName}>New password</label>
            <input type="password" className={inputClassName} value={newPassword} onChange={onNewPasswordChange} minLength={6} required />
          </div>
          <div>
            <label className={labelClassName}>Confirm password</label>
            <input type="password" className={inputClassName} value={confirmPassword} onChange={onConfirmPasswordChange} required />
          </div>
          <LoadingButton
            type="submit"
            isLoading={isPwdLoading}
            idleLabel="Update Password"
            loadingLabel="Updating Password..."
            className="bg-[#EFBF04] text-black hover:brightness-100"
            spinnerClassName="text-black"
          />
        </form>
      </section>

      <section className={panelClassName}>
        <MobileAdminSectionHeader
          title="Admin setup key"
          description="Generate a one-time setup key for another admin when needed."
        />
        {adminProfile?.isMainAdmin ? (
          <div className="mt-4 space-y-4">
            <LoadingButton
              type="button"
              onClick={onGenerateSetupKey}
              isLoading={isSetupKeyLoading}
              idleLabel="Generate Setup Key"
              loadingLabel="Generating Setup Key..."
              className="bg-white/10 text-white hover:brightness-100"
            />
            {setupKeyData?.setupKey && (
              <div role="status" className="rounded-[18px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className={labelClassName}>Generated key</p>
                <p className="mt-3 break-all font-mono text-sm text-white">{setupKeyData.setupKey}</p>
                <p className="mt-2 text-sm text-emerald-200">Expires: {setupKeyData.expiresAt}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
            Setup key generation is available only for the main admin account.
          </div>
        )}
      </section>

      <section className={panelClassName}>
        <MobileAdminSectionHeader title="Session" description="Log out of the admin panel on this phone." />
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
        >
          <ShieldCheck className="h-4 w-4" />
          Logout
        </button>
      </section>
    </div>
  );
}
