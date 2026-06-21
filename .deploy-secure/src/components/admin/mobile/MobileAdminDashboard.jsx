import React, { useState } from 'react';
import MobileAdminBottomNav from './MobileAdminBottomNav';
import MobileAdminFab from './MobileAdminFab';
import MobileAdminTopBar from './MobileAdminTopBar';
import MobileAddDriverForm from './MobileAddDriverForm';
import MobileAddEnquiryForm from './MobileAddEnquiryForm';
import MobileAddFleetForm from './MobileAddFleetForm';
import MobileEnquiries from './MobileEnquiries';
import MobileEnquiryDetail from './MobileEnquiryDetail';
import MobileFeedback from './MobileFeedback';
import MobileFleet from './MobileFleet';
import MobileDrivers from './MobileDrivers';
import MobileNewEntrySheet from './MobileNewEntrySheet';
import MobileOverview from './MobileOverview';
import MobileSettings from './MobileSettings';

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
  filteredFeedback,
  filteredFleet,
  filteredDrivers,
  enquiryFilters,
  setEnquiryFilters,
  feedbackFilters,
  setFeedbackFilters,
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
  onSaveFeedback,
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
  const [operationsView, setOperationsView] = useState('drivers');
  const mobileNavItems = navItems.filter((item) => item.id !== 'fleet');
  const normalizedActiveTab = activeTab === 'fleet' ? 'drivers' : activeTab;
  const currentTitle = normalizedActiveTab === 'drivers'
    ? 'Drivers & Fleet'
    : navItems.find((item) => item.id === normalizedActiveTab)?.label || 'Overview';
  const canCreate = ['dashboard', 'bookings', 'drivers', 'fleet'].includes(activeTab);

  const topSubtitle = {
    dashboard: 'Manual operations snapshot for today.',
    bookings: 'Review, contact, assign, and update customer enquiries.',
    feedback: 'Approve, decline, hide, and feature customer feedback.',
    drivers: 'Keep driver and vehicle records within reach.',
    fleet: 'Keep driver and vehicle records within reach.',
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
    if (type === 'fleet') {
      setOperationsView('fleet');
      setActiveTab('drivers');
    } else if (type === 'drivers') {
      setOperationsView('drivers');
      setActiveTab('drivers');
    } else {
      setActiveTab(type === 'bookings' ? 'bookings' : type);
    }
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
            onOpenDrivers={() => {
              setOperationsView('drivers');
              setActiveTab('drivers');
            }}
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

        {activeTab === 'feedback' && (
          <MobileFeedback
            filteredFeedback={filteredFeedback}
            feedbackFilters={feedbackFilters}
            setFeedbackFilters={setFeedbackFilters}
            isLoading={isLoading}
            onSaveFeedback={onSaveFeedback}
          />
        )}

        {normalizedActiveTab === 'drivers' && (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-2 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOperationsView('drivers');
                    setSearchQuery('');
                  }}
                  className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                    operationsView === 'drivers'
                      ? 'bg-[#EFBF04]/12 text-[#EFBF04]'
                      : 'bg-white/[0.03] text-gray-300'
                  }`}
                >
                  Drivers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOperationsView('fleet');
                    setSearchQuery('');
                  }}
                  className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                    operationsView === 'fleet'
                      ? 'bg-[#EFBF04]/12 text-[#EFBF04]'
                      : 'bg-white/[0.03] text-gray-300'
                  }`}
                >
                  Fleet
                </button>
              </div>
            </div>

            {operationsView === 'drivers' ? (
              <MobileDrivers
                drivers={filteredDrivers}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
              />
            ) : (
              <MobileFleet
                fleet={filteredFleet}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoading={isLoading}
              />
            )}
          </div>
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

      <MobileAdminBottomNav items={mobileNavItems} activeTab={normalizedActiveTab} onChange={setActiveTab} />
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
