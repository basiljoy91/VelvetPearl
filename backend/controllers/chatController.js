const processChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid message string is required.'
      });
    }

    const query = message.toLowerCase().trim();
    let reply = '';
    let actions = null;

    // Simple robust intent matching engine
    if (query.match(/\b(hi|hello|hey|greetings|morning|afternoon|evening)\b/)) {
      reply = "Hello! Welcome to Velvet Pearl Concierge. How can I assist you with your premium travel plans today?";
    } else if (query.match(/\b(price|cost|rate|tariff|charge|much)\b/)) {
      reply = "Our premium cab services start at ₹15/km for Executive Sedans, ₹20/km for Premium SUVs, and ₹28/km for Luxury Travelers. Would you like a specific quote for a route?";
    } else if (query.match(/\b(book|reserve|hire|cab|taxi|booking|room|party|event)\b/)) {
      reply = "Please select what you would like to book:";
      actions = [
        { label: "Book a Cab", url: "/book/cab", icon: "local_taxi" },
        { label: "Book a Room", url: "/book/room", icon: "hotel" },
        { label: "Event / Party", url: "/book/event", icon: "celebration" },
        { label: "Tailored Tours", url: "/book/tour", icon: "explore" }
      ];
    } else if (query.match(/\b(contact|support|help|phone|call|number)\b/)) {
      reply = "Our priority support team is available 24/7. You can reach us on WhatsApp at +91-9943139353, or use the quick contact form above.";
    } else if (query.match(/\b(route|destination|city|travel|go)\b/)) {
      reply = "We offer curated expeditions across South India, covering major destinations like Chennai, Bangalore, Ooty, Munnar, and more. Check out our 'Routes' page for detailed pricing.";
    } else if (query.match(/\b(fleet|car|suv|sedan|vehicle|tempo)\b/)) {
      reply = "Our pristine fleet includes Executive Sedans, Premium SUVs, Mini Coaches, and Luxury Travelers—all driven by vetted professional chauffeurs.";
    } else if (query.match(/\b(bye|goodbye|thanks|thank you)\b/)) {
      reply = "You're very welcome! Feel free to reach out anytime. Have a wonderful day!";
    } else {
      reply = "Thank you for reaching out. Our concierge executives will review your query. For immediate or complex assistance, please chat with us on WhatsApp or use the contact form above.";
    }

    // Simulate slight natural typing delay (optimized to 800ms)
    setTimeout(() => {
      res.status(200).json({
        success: true,
        reply,
        ...(actions && { actions })
      });
    }, 800);

  } catch (error) {
    console.error('Chatbot Processing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message. Please try again later.'
    });
  }
};

module.exports = {
  processChatMessage
};
