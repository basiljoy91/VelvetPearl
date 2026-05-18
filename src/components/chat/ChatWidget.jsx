import React, { useState } from 'react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Expanded Chat Widget Overlay */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 z-[110] w-[350px] md:w-[380px] h-[550px] md:h-[600px] flex flex-col glass-panel rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 animate-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-primary-container px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white text-xl" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-primary-container rounded-full"></div>
              </div>
              <div>
                <h4 className="text-white font-headline font-bold text-sm">Velvet Pearl Concierge</h4>
                <p className="text-white/60 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Online & Ready
                </p>
              </div>
            </div>
            <button className="text-white/70 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest custom-scrollbar">
            {/* Greeting */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-sm">travel_explore</span>
              </div>
              <div className="bg-surface-container-high rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                <p className="text-on-surface text-sm leading-relaxed">
                  Hello! We create <span className="text-secondary font-bold">journeys</span>, not just trips. How can we help you today?
                </p>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">Contact Inquiry</p>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input className="w-full bg-white/5 border border-white/10 focus:border-secondary transition-all p-3 rounded-md text-xs text-white placeholder:text-white/20 outline-none" placeholder="Full Name" type="text" />
                </div>
                <div>
                  <input className="w-full bg-white/5 border border-white/10 focus:border-secondary transition-all p-3 rounded-md text-xs text-white placeholder:text-white/20 outline-none" placeholder="Email Address" type="email" />
                </div>
                <div className="flex gap-2">
                  <input className="w-16 bg-white/5 border border-white/10 p-3 rounded-md text-center text-xs text-white outline-none" defaultValue="91" type="number" />
                  <input className="flex-1 bg-white/5 border border-white/10 focus:border-secondary transition-all p-3 rounded-md text-xs text-white placeholder:text-white/20 outline-none" placeholder="Phone Number" type="tel" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select className="bg-white/5 border border-white/10 focus:border-secondary transition-all p-3 rounded-md text-xs text-white appearance-none outline-none">
                    <option className="bg-surface">India</option>
                    <option className="bg-surface">USA</option>
                    <option className="bg-surface">UK</option>
                    <option className="bg-surface">UAE</option>
                  </select>
                  <select className="bg-white/5 border border-white/10 focus:border-secondary transition-all p-3 rounded-md text-xs text-white appearance-none outline-none">
                    <option className="bg-surface" value="cab">Cab Services</option>
                    <option className="bg-surface" value="tours">Tailored Tours</option>
                    <option className="bg-surface" value="rooms">Room Bookings</option>
                    <option className="bg-surface" value="events">Event Planning</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full bg-primary-container text-white text-xs font-bold py-3 rounded-md uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">book_online</span>
                Book Now
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="border border-secondary/30 text-secondary text-[10px] font-bold py-3 rounded-md uppercase tracking-widest hover:bg-secondary/5 transition-all text-center">Check Prices</button>
                <button className="border border-white/10 text-white text-[10px] font-bold py-3 rounded-md uppercase tracking-widest hover:bg-white/5 transition-all text-center">Support</button>
              </div>
            </div>
          </div>

          {/* Chat Footer */}
          <div className="bg-surface-container p-4 border-t border-white/5 space-y-3">
            <div className="relative flex items-center">
              <input className="w-full bg-black/40 border-none focus:ring-1 focus:ring-secondary/50 rounded-full py-3 pl-4 pr-12 text-xs text-white placeholder:text-white/20 outline-none" placeholder="Type your message..." type="text" />
              <button className="absolute right-2 w-8 h-8 flex items-center justify-center text-secondary hover:text-white transition-colors">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>send</span>
              </button>
            </div>
            <div className="flex items-center justify-center">
              <a className="flex items-center gap-2 group" href="https://wa.me/919943139353" target="_blank" rel="noreferrer">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                  <svg className="w-3 h-3 fill-green-500 group-hover:fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
                </div>
                <span className="text-[10px] text-on-surface-variant group-hover:text-secondary transition-colors font-bold uppercase tracking-widest">Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Buttons Trigger Area */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3 md:bottom-12 md:right-12">
        {/* Main Messenger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-none ${isOpen ? 'bg-secondary' : 'bg-primary-container'}`}
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12" style={{fontVariationSettings: "'FILL' 1"}}>
            {isOpen ? 'close' : 'chat'}
          </span>
          {!isOpen && (
            <div className="absolute right-full mr-4 whitespace-nowrap rounded bg-[#201f20] px-3 py-1.5 text-xs font-label uppercase tracking-widest text-[#EFBF04] opacity-0 transition-opacity group-hover:opacity-100 border border-white/10 pointer-events-none">
              Chat Concierge
            </div>
          )}
        </button>
      </div>
    </>
  );
}
