import React, { useState } from 'react';
import MobileAdminBottomNav from './MobileAdminBottomNav';
import MobileAdminFab from './MobileAdminFab';
import MobileAdminTopBar from './MobileAdminTopBar';
import MobileAddDriverForm from './MobileAddDriverForm';
import MobileAddEnquiryForm from './MobileAddEnquiryForm';
import MobileAddFleetForm from './MobileAddFleetForm';
import MobileEnquiries from './MobileEnquiries';
import MobileEnquiryDetail from './MobileEnquiryDetail';
import MobileFleet from './MobileFleet';
import MobileDrivers from './MobileDrivers';
import MobileNewEntrySheet from './MobileNewEntrySheet';
import MobileOverview from './MobileOverview';
import MobileSettings from './MobileSettings';
import UserProfileTab from '../UserProfileTab';
import QuotationTab from '../QuotationTab';

export default function MobileAdminDashboard({
  activeTab,
  setActiveTab,
  navItems,
  enquiries,
  drivers,
  fleet,
  isLoading,
  dashboardError,
  overviewCounts,
  categoryCounts,
  recentEnquiries,
  filteredEnquiries,
  filteredFleet,
  filteredDrivers,
  enquiryFilters,
  setEnquiryFilters,
  searchQuery,
  setSearchQuery,
  selectedEnquiry,
  detailDraft,
  isDetailLoading,
  savingAction,
  openEnquiryDetail,
  markEnquiryContacted,
  onCloseDetail,
  onDraftChange,
  onSaveStatus,
  onSaveNotes,
  onSaveQuote,
  onSaveFollowUp,
  onSaveDriver,
  onSaveVehicle,
  onSaveRoom,
  onSavePackage,
  onArchive,
  getStatusClasses,
  getCustomerName,
  getServiceLabel,
  getTravelDateLabel,
  formatDate,
  formatDateTime,
  typeLabels,
  typeOptions,
  statusOptions,
  handleLogout,
  adminProfile,
  oldPassword,
  newPassword,
  confirmPassword,
  setOldPassword,
  setNewPassword,
  setConfirmPassword,
  handlePasswordChange,
  pwdError,
  pwdMessage,
  isPwdLoading,
  handleGenerateSetupKey,
  isSetupKeyLoading,
  setupKeyData,
  onOpenNewEntrySheet,
  onSubmitMobileEntry,
  onGoHome,
  helpers,
}) {
  const [isEnquiryFilterOpen, setIsEnquiryFilterOpen] = useState(false);
  const [mobileEntryType, setMobileEntryType] = useState('');
  const currentTitle = navItems.find((item) => item.id === activeTab)?.label || 'Overview';
  const canCreate = ['dashboard', 'bookings', 'drivers', 'fleet'].includes(activeTab);

  const topSubtitle = {
    dashboard: 'Manual operations snapshot for today.',
    bookings: 'Review, contact, assign, and update customer enquiries.',
    drivers: 'Keep driver availability and contact details within reach.',
    fleet: 'Track available vehicles, status, and coverage.',
    settings: 'Security, onboarding, and admin access controls.',
  }[activeTab] || 'Manual operations';

  const openBookings = (nextFilters = {}) => {
    setActiveTab('bookings');
    setEnquiryFilters((current) => ({ ...current, ...nextFilters }));
  };

  const mobileHelpers = {
    ...helpers,
    getCustomerName,
    getServiceLabel,
    getStatusClasses,
    formatDate,
    formatDateTime,
    getTravelDateLabel,
    statusOptions,
  };

  const handleOpenCreateType = (type) => {
    helpers.onCloseNewEntrySheet();
    setActiveTab(type === 'bookings' ? 'bookings' : type);
    setMobileEntryType(type);
  };

  const handleCloseCreateForm = () => {
    setMobileEntryType('');
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white lg:hidden">
      <MobileAdminTopBar activeTab={activeTab} title={currentTitle} subtitle={topSubtitle} onGoHome={onGoHome} />

      <div className="space-y-5 px-4 pb-[calc(8.75rem+env(safe-area-inset-bottom))] pt-4">
        {dashboardError && (
          <div aria-live="assertive" role="alert" className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {dashboardError}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <MobileOverview
            enquiries={enquiries}
            overviewCounts={overviewCounts}
            categoryCounts={categoryCounts}
            recentEnquiries={recentEnquiries}
            isLoading={isLoading}
            onOpenEnquiry={openEnquiryDetail}
            onOpenBookings={(type) => openBookings(type ? { type } : {})}
            onOpenStatus={(status) => openBookings({ status })}
            onOpenDrivers={() => setActiveTab('drivers')}
            onOpenNewEntry={onOpenNewEntrySheet}
            getStatusClasses={getStatusClasses}
            getCustomerName={getCustomerName}
            getServiceLabel={getServiceLabel}
          />
        )}

        {activeTab === 'bookings' && (
          <MobileEnquiries
            enquiries={enquiries}
            filteredEnquiries={filteredEnquiries}
            enquiryFilters={enquiryFilters}
            setEnquiryFilters={setEnquiryFilters}
            isLoading={isLoading}
            isFilterOpen={isEnquiryFilterOpen}
            setIsFilterOpen={setIsEnquiryFilterOpen}
            typeOptions={typeOptions}
            typeLabels={typeLabels}
            statusOptions={statusOptions}
            getStatusClasses={getStatusClasses}
            getCustomerName={getCustomerName}
            getServiceLabel={getServiceLabel}
            getTravelDateLabel={getTravelDateLabel}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            buildCustomerReplyHref={helpers.buildCustomerReplyHref}
            openEnquiryDetail={openEnquiryDetail}
            markEnquiryContacted={markEnquiryContacted}
          />
        )}

        {activeTab === 'drivers' && (
          <MobileDrivers
            drivers={filteredDrivers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'fleet' && (
          <MobileFleet
            fleet={filteredFleet}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'user_profile' && (
          <UserProfileTab searchQuery={searchQuery} />
        )}

        {activeTab === 'quotation' && (
          <QuotationTab searchQuery={searchQuery} />
        )}

        {activeTab === 'settings' && (
          <MobileSettings
            adminProfile={adminProfile}
            oldPassword={oldPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            onOldPasswordChange={(event) => setOldPassword(event.target.value)}
            onNewPasswordChange={(event) => setNewPassword(event.target.value)}
            onConfirmPasswordChange={(event) => setConfirmPassword(event.target.value)}
            onSubmitPasswordChange={handlePasswordChange}
            pwdError={pwdError}
            pwdMessage={pwdMessage}
            isPwdLoading={isPwdLoading}
            onGenerateSetupKey={handleGenerateSetupKey}
            isSetupKeyLoading={isSetupKeyLoading}
            setupKeyData={setupKeyData}
            onLogout={handleLogout}
          />
        )}
      </div>

      <MobileAdminBottomNav items={navItems} activeTab={activeTab} onChange={setActiveTab} />
      {canCreate && <MobileAdminFab onClick={onOpenNewEntrySheet} disabled={isLoading && activeTab !== 'dashboard'} />}

      <MobileEnquiryDetail
        enquiry={selectedEnquiry}
        draft={detailDraft}
        drivers={drivers}
        fleet={fleet}
        isLoading={isDetailLoading}
        savingAction={savingAction}
        onClose={onCloseDetail}
        onDraftChange={onDraftChange}
        onSaveStatus={onSaveStatus}
        onSaveNotes={onSaveNotes}
        onSaveQuote={onSaveQuote}
        onSaveFollowUp={onSaveFollowUp}
        onSaveDriver={onSaveDriver}
        onSaveVehicle={onSaveVehicle}
        onSaveRoom={onSaveRoom}
        onSavePackage={onSavePackage}
        onArchive={onArchive}
        onMarkContacted={selectedEnquiry ? () => markEnquiryContacted(selectedEnquiry.id) : null}
        helpers={mobileHelpers}
      />
      <MobileNewEntrySheet
        isOpen={helpers.isNewEntrySheetOpen}
        onClose={helpers.onCloseNewEntrySheet}
        onSelect={handleOpenCreateType}
      />
      <MobileAddEnquiryForm
        isOpen={mobileEntryType === 'bookings'}
        onClose={handleCloseCreateForm}
        onSubmit={(payload) => onSubmitMobileEntry(payload, 'bookings')}
      />
      <MobileAddDriverForm
        isOpen={mobileEntryType === 'drivers'}
        onClose={handleCloseCreateForm}
        onSubmit={(payload) => onSubmitMobileEntry(payload, 'drivers')}
      />
      <MobileAddFleetForm
        isOpen={mobileEntryType === 'fleet'}
        onClose={handleCloseCreateForm}
        onSubmit={(payload) => onSubmitMobileEntry(payload, 'fleet')}
      />
    </div>
  );
}
