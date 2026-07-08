import React, { useState, useEffect, useRef } from 'react';
import { submitQuotation } from '../../services/dataService';

export default function QuotationSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const successRef = useRef(null);

  const bgImages = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1523730205978-59fd1b2965e3?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1506461883276-594a12b11ac3?auto=format&fit=crop&w=1920&q=80'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [success]);

  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    pickup_city: '',
    destination: '',
    travel_date: '',
    return_date: '',
    number_of_days: '',
    number_of_adults: '',
    number_of_children: '0',
    approximate_budget: '',
    vehicle_preference: '',
    hotel_required: 'No',
    additional_requirements: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
    setFormData({
      full_name: '', mobile_number: '', email: '', pickup_city: '', destination: '',
      travel_date: '', return_date: '', number_of_days: '', number_of_adults: '',
      number_of_children: '0', approximate_budget: '', vehicle_preference: '',
      hotel_required: 'No', additional_requirements: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await submitQuotation({
        ...formData,
        number_of_days: parseInt(formData.number_of_days, 10),
        number_of_adults: parseInt(formData.number_of_adults, 10),
        number_of_children: parseInt(formData.number_of_children, 10) || 0,
        approximate_budget: parseFloat(formData.approximate_budget) || 0
      });
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || 'Failed to submit quotation request');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sectionIntro = (eyebrow, title, description) => (
    <div className="mb-12 max-w-3xl space-y-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
      <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white md:text-5xl leading-tight">{title}</h2>
      <p className="text-lg font-medium leading-relaxed text-on-surface-variant">{description}</p>
    </div>
  );

  const infoCards = [
    { icon: 'receipt_long', title: 'Free Custom Quotation', desc: 'No hidden charges for customized plans.' },
    { icon: 'timer', title: 'Fast Response', desc: 'Quick turnaround time for all your enquiries.' },
    { icon: 'support_agent', title: 'Experienced Travel Experts', desc: 'Guided by professionals who know the routes.' },
    { icon: 'savings', title: 'Affordable Packages', desc: 'Best competitive pricing without compromising quality.' },
    { icon: 'directions_car', title: 'Flexible Vehicle Options', desc: 'Wide range of clean, well-maintained fleets.' },
    { icon: 'hotel', title: 'Hotel & Tour Assistance', desc: 'End-to-end help with accommodation and sights.' },
    { icon: 'edit_note', title: 'Personalized Planning', desc: 'Itineraries crafted precisely to your needs.' },
    { icon: 'headset_mic', title: 'Reliable Customer Support', desc: '24/7 dedicated support throughout your trip.' }
  ];

  return (
    <section className="relative px-6 py-24 md:px-8">
      {/* Background Image Slideshow with Overlay */}
      <div className="absolute inset-0 z-0 bg-black">
        {bgImages.map((img, index) => (
          <img
            key={img}
            src={img}
            alt={`Quotation Background ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-[4px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {sectionIntro(
          'Quotation',
          'Request a Free Tour Quotation',
          'Provide your travel details below and our team will get back to you with a customized quotation tailored to your requirements.'
        )}

        <div className="grid gap-12 lg:grid-cols-[45%_1fr]">
          
          {/* Left Side: Form or Success State */}
          <div className="w-full">
            {success ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl text-center">
                <span className="material-symbols-outlined mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-4xl text-green-500">
                  check_circle
                </span>
                <h3 ref={successRef} className="font-headline text-2xl font-extrabold text-white md:text-3xl leading-tight">Quotation Sent Successfully</h3>
                <p className="mx-auto mt-4 max-w-sm text-base font-medium leading-relaxed text-on-surface-variant">
                  Thank you for your enquiry. Our travel experts have successfully received your quotation request.
                </p>

                <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 text-left">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:bg-white/5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-base">support_agent</span>
                    </div>
                    <h4 className="mb-2 text-base font-bold text-white leading-snug">Admin Will Contact You Shortly</h4>
                    <p className="text-sm font-medium leading-relaxed text-gray-400">Our travel consultant will review your requirements and contact you soon.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:bg-white/5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    </div>
                    <h4 className="mb-2 text-base font-bold text-white leading-snug">Receive Your Quotation PDF</h4>
                    <p className="text-sm font-medium leading-relaxed text-gray-400">You will receive a professionally generated quotation PDF from our team.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:bg-white/5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-base">timer</span>
                    </div>
                    <h4 className="mb-2 text-base font-bold text-white leading-snug">Quick Response Time</h4>
                    <p className="text-sm font-medium leading-relaxed text-gray-400">Most quotation requests are reviewed and prepared within a short period.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5 transition-all hover:bg-white/5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                      <span className="material-symbols-outlined text-base">tune</span>
                    </div>
                    <h4 className="mb-2 text-base font-bold text-white leading-snug">Personalized Travel Plan</h4>
                    <p className="text-sm font-medium leading-relaxed text-gray-400">Your quotation will be customized exactly to your destination and budget.</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={handleCloseSuccess}
                    className="w-full sm:w-auto rounded-xl border border-white/10 px-8 py-3 text-base font-bold text-white transition-all hover:border-secondary hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl sm:p-8">
                {error && (
                  <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Full Name *</label>
                    <input required name="full_name" value={formData.full_name} onChange={handleChange} type="text" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Mobile Number *</label>
                    <input required name="mobile_number" value={formData.mobile_number} onChange={handleChange} type="tel" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Email Address</label>
                    <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Pickup City</label>
                    <input name="pickup_city" value={formData.pickup_city} onChange={handleChange} type="text" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="e.g. Bangalore" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Destination *</label>
                    <input required name="destination" value={formData.destination} onChange={handleChange} type="text" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="e.g. Ooty, Coorg" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Travel Date *</label>
                    <input required name="travel_date" value={formData.travel_date} onChange={handleChange} type="date" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Number of Days *</label>
                    <input required name="number_of_days" value={formData.number_of_days} onChange={handleChange} type="number" min="1" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-300">Adults *</label>
                      <input required name="number_of_adults" value={formData.number_of_adults} onChange={handleChange} type="number" min="1" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="2" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-300">Children</label>
                      <input name="number_of_children" value={formData.number_of_children} onChange={handleChange} type="number" min="0" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="0" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Approximate Budget (₹)</label>
                    <input name="approximate_budget" value={formData.approximate_budget} onChange={handleChange} type="number" min="0" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="50000" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Vehicle Preference</label>
                    <select name="vehicle_preference" value={formData.vehicle_preference} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors [&>option]:bg-gray-900">
                      <option value="">Any Vehicle</option>
                      <option value="Sedan">Sedan (Etios/Dzire)</option>
                      <option value="SUV">SUV (Innova/Ertiga)</option>
                      <option value="Tempo Traveller">Tempo Traveller</option>
                      <option value="Mini Bus">Mini Bus</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-300">Additional Requirements</label>
                    <textarea name="additional_requirements" value={formData.additional_requirements} onChange={handleChange} rows="3" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-base font-medium text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-colors" placeholder="Specific places to visit, meal preferences, etc."></textarea>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex items-center justify-center rounded-xl bg-primary-container px-8 py-3.5 text-base font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110 hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Side: Informational Cards */}
          <div className="w-full lg:pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              {infoCards.map((card, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                  </div>
                  <h4 className="mb-1 text-base font-bold text-white">{card.title}</h4>
                  <p className="text-sm font-medium leading-relaxed text-on-surface-variant">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
