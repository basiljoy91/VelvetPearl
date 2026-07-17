import React, { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  getChatbotSessionId,
  requestChatbotAssistantHint,
  trackChatbotEvent,
} from '../../services/chatbotService';
import { addEnquiry } from '../../services/dataService';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';
import {
  buildHandoffPayload,
  buildEnquiryPayload,
  buildFollowUpWhatsAppMessage,
  CHATBOT_NAME,
  detectBookingIntent,
  detectHandoffReason,
  detectServiceFromText,
  FAQ_CONTENT,
  FAQ_OPTIONS,
  HANDOFF_FIELDS,
  HANDOFF_CONTENT,
  matchFaqId,
  SERVICE_FLOWS,
  SERVICE_OPTIONS,
} from './chatbotConfig';

const PHONE_REGEX = /^\d{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const START_OPTIONS = [
  ...SERVICE_OPTIONS.map((option) => ({ label: option.label, value: `service:${option.value}` })),
  ...FAQ_OPTIONS.map((option) => ({ label: option.label, value: `faq:${option.value}` })),
];

const CONTINUE_FLOW_OPTION = [{ label: 'Continue Here', value: 'action:continue-flow' }];
const EXIT_FLOW_OPTION = [{ label: 'Exit This Enquiry', value: 'action:exit-flow' }];
const THINKING_DELAY_MS = 350;

const createInitialMessages = () => ([
  {
    id: 'm-1',
    sender: 'bot',
    text: `Hello, I am ${CHATBOT_NAME}. I can help you start a cab, room, tour, or general enquiry from this website.`,
  },
  {
    id: 'm-2',
    sender: 'bot',
    text: 'Choose a service below, or ask about airport pickup, city coverage, family trips, or pricing.',
    options: START_OPTIONS,
  },
]);

const genericWhatsAppHref = buildWhatsAppLink({
  phone: DEFAULT_WHATSAPP_PHONE,
  message: 'Hi, I would like to know more about your travel services. Please help me plan my trip.',
});

const normalizeToken = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const matchesQuestionTone = (value = '') => {
  const text = String(value || '').trim().toLowerCase();
  return text.includes('?') || /^(do|does|can|could|which|what|how|where|when|is|are|who|why)\b/.test(text);
};

const looksLikeConversation = (value = '') => /^(hi|hai|hello|hey|who|what|how|why|can|do|does|is|are|thanks|thank you)\b/i.test(String(value || '').trim());

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const findMatchingOptionValue = (options = [], rawValue = '') => {
  const normalizedInput = normalizeToken(rawValue);

  if (!normalizedInput) return null;

  const directMatch = options.find((option) => (
    normalizeToken(option.value) === normalizedInput || normalizeToken(option.label) === normalizedInput
  ));

  if (directMatch) return directMatch.value;

  if (normalizedInput === 'yes') return options.find((option) => normalizeToken(option.value) === 'yes')?.value || null;
  if (normalizedInput === 'no') return options.find((option) => normalizeToken(option.value) === 'no')?.value || null;

  return null;
};

const normalizePhone = (value = '') => String(value).replace(/\D/g, '');

const hasMeaningfulValue = (value) => {
  if (typeof value === 'boolean') return true;
  if (value === null || value === undefined) return false;
  return String(value).trim() !== '';
};

const getNextFieldIndex = (flow, currentIndex, data) => {
  for (let index = currentIndex + 1; index < flow.fields.length; index += 1) {
    const field = flow.fields[index];
    if ((!field.when || field.when(data)) && !hasMeaningfulValue(data[field.key])) {
      return index;
    }
  }

  return null;
};

const getInputMeta = (field) => {
  if (!field) {
    return { placeholder: 'Type your message', inputMode: 'text' };
  }

  if (field.type === 'date') {
    return { placeholder: 'YYYY-MM-DD', inputMode: 'numeric' };
  }

  if (field.type === 'time') {
    return { placeholder: 'HH:MM', inputMode: 'numeric' };
  }

  if (field.type === 'phone' || field.type === 'integer') {
    return { placeholder: 'Type your answer', inputMode: 'numeric' };
  }

  if (field.type === 'email') {
    return { placeholder: 'name@example.com', inputMode: 'email' };
  }

  return { placeholder: 'Type your answer', inputMode: 'text' };
};

const validateFieldInput = (field, rawValue, currentData) => {
  const value = String(rawValue || '').trim();

  if (!field.required && normalizeToken(value) === 'skip') {
    if (field.type === 'integer') return { value: '0' };
    return { value: '' };
  }

  if (field.type === 'choice') {
    if (!value && !field.required) return { value: '' };

    const matchedValue = findMatchingOptionValue(field.options, value);
    if (!matchedValue) {
      return { error: 'Please choose one of the available options so I can continue.' };
    }

    return { value: matchedValue };
  }

  if (field.type === 'boolean') {
    const normalized = normalizeToken(value);
    if (['yes', 'y', 'true'].includes(normalized)) return { value: true };
    if (['no', 'n', 'false'].includes(normalized)) return { value: false };
    return { error: 'Please reply with yes or no so I can continue.' };
  }

  if (field.type === 'phone') {
    if (field.allowSameAsPhone && normalizeToken(value) === 'same' && currentData.phone_number) {
      return { value: currentData.phone_number };
    }

    const normalizedPhone = normalizePhone(value);
    if (!PHONE_REGEX.test(normalizedPhone)) {
      return { error: 'Please share a valid phone number with 8 to 15 digits.' };
    }

    return { value: normalizedPhone };
  }

  if (field.type === 'email') {
    if (!value) return { value: '' };
    if (!EMAIL_REGEX.test(value)) {
      return { error: 'Please share a valid email address or type skip.' };
    }
    return { value };
  }

  if (field.type === 'date') {
    if (!DATE_REGEX.test(value)) {
      return { error: 'Please use the date format YYYY-MM-DD.' };
    }

    if (field.minField && currentData[field.minField] && value < currentData[field.minField]) {
      return { error: 'Please share a date that is not earlier than the previous date provided.' };
    }

    return { value };
  }

  if (field.type === 'time') {
    if (!TIME_REGEX.test(value)) {
      return { error: 'Please use the time format HH:MM.' };
    }

    return { value };
  }

  if (field.type === 'integer') {
    if (!value && !field.required) {
      return { value: '0' };
    }

    if (!/^\d+$/.test(value)) {
      return { error: 'Please enter numbers only for this answer.' };
    }

    const numericValue = Number.parseInt(value, 10);
    if (Number.isNaN(numericValue) || numericValue < (field.min ?? 0)) {
      return { error: `Please enter a number greater than or equal to ${field.min ?? 0}.` };
    }

    return { value: String(numericValue) };
  }

  if (!value) {
    return field.required ? { error: 'This detail is required before I can continue.' } : { value: '' };
  }

  if (field.minLength && value.length < field.minLength) {
    return { error: `Please share at least ${field.minLength} characters for this answer.` };
  }

  return { value };
};

export default function ChatWidget() {
  const { pathname } = useLocation();
  const showMobileContactDock = !pathname.startsWith('/admin') && !pathname.startsWith('/book/') && !pathname.startsWith('/packages/') && pathname !== '/contact';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => createInitialMessages());
  const [draft, setDraft] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
  const [handoffContext, setHandoffContext] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const messageIdRef = useRef(2);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useMemo(() => getChatbotSessionId(), []);

  const activeFlow = selectedService ? SERVICE_FLOWS[selectedService] : null;
  const activeQuestionFlow = handoffContext ? { fields: HANDOFF_FIELDS } : activeFlow;
  const currentField = activeQuestionFlow && currentFieldIndex !== null ? activeQuestionFlow.fields[currentFieldIndex] : null;
  const currentFieldKey = currentField?.key || null;
  const currentFieldType = currentField?.type || null;
  const lastInteractiveMessageId = [...messages].reverse().find((message) => message.options?.length)?.id || null;
  const followUpWhatsAppHref = submittedEnquiry
    ? buildWhatsAppLink({
      phone: DEFAULT_WHATSAPP_PHONE,
      message: buildFollowUpWhatsAppMessage(submittedEnquiry.serviceKey, submittedEnquiry.referenceId),
    })
    : genericWhatsAppHref;
  const inputMeta = useMemo(() => getInputMeta(currentField), [currentField]);

  const appendMessages = (...nextMessages) => {
    setMessages((currentMessages) => [...currentMessages, ...nextMessages]);
  };

  const emitAnalytics = (eventName, payload = {}) => {
    void trackChatbotEvent(eventName, {
      session_id: sessionId,
      current_page: pathname,
      selected_service: selectedService || null,
      current_field_key: currentField?.key || null,
      handoff_reason: handoffContext?.reason || null,
      submitted_reference_id: submittedEnquiry?.referenceId || null,
      ...payload,
    });
  };

  const createBotMessage = (text, options = undefined) => {
    messageIdRef.current += 1;
    return { id: `m-${messageIdRef.current}`, sender: 'bot', text, options };
  };

  const createUserMessage = (text) => {
    messageIdRef.current += 1;
    return { id: `m-${messageIdRef.current}`, sender: 'user', text };
  };

  const resetConversation = () => {
    messageIdRef.current = 2;
    setMessages(createInitialMessages());
    setDraft('');
    setSelectedService(null);
    setCurrentFieldIndex(null);
    setHandoffContext(null);
    setFormData({});
    setIsSubmitting(false);
    setIsThinking(false);
    setSubmittedEnquiry(null);
  };

  const closeWidget = (reason = 'manual_close') => {
    if (
      !submittedEnquiry
      && (messages.length > 2 || Object.keys(formData).length > 0 || selectedService || handoffContext)
    ) {
      emitAnalytics('chat_abandoned', {
        reason,
        message_count: messages.length,
        collected_field_count: Object.keys(formData).length,
      });
    }

    setIsOpen(false);
  };

  const handleEscapeKey = useEffectEvent((event) => {
    if (event.key === 'Escape') {
      closeWidget('escape_key');
    }
  });

  const emitFieldStarted = useEffectEvent((fieldKey, fieldType) => {
    emitAnalytics('field_started', {
      field_key: fieldKey,
      field_value_type: fieldType,
      flow_type: handoffContext ? 'handoff' : 'lead_capture',
      service_key: selectedService || null,
    });
  });

  const openWidget = () => {
    if (!isOpen) {
      emitAnalytics('chat_opened');
    }

    setIsOpen(true);
  };

  const askField = (field) => {
    if (!field) return;

    const hint = field.hint ? `\n${field.hint}` : '';
    const optionalNote = !field.required ? '\nYou can type `skip` if you would like to leave this blank.' : '';
    const options = field.options?.length
      ? [...field.options, ...EXIT_FLOW_OPTION]
      : EXIT_FLOW_OPTION;
    appendMessages(createBotMessage(`${field.prompt}${hint}${optionalNote}`, options));
  };

  const startServiceFlow = (serviceKey, initialData = {}) => {
    const flow = SERVICE_FLOWS[serviceKey];
    const nextIndex = getNextFieldIndex(flow, -1, initialData);

    setSelectedService(serviceKey);
    setCurrentFieldIndex(nextIndex);
    setHandoffContext(null);
    setFormData(initialData);
    setSubmittedEnquiry(null);
    emitAnalytics('service_selected', {
      service_key: serviceKey,
      prefilled_field_count: Object.keys(initialData).length,
    });
    appendMessages(createBotMessage(flow.intro));

    if (Object.keys(initialData).length > 0) {
      appendMessages(createBotMessage('I already picked up a few details from your message. I will only ask for what is still missing.'));
    }

    if (nextIndex === null) {
      void submitConversation(serviceKey, initialData);
      return;
    }

    askField(flow.fields[nextIndex]);
  };

  const answerFaq = (faqId, shouldRepeatCurrentField = false, serviceToStart = null, replyOverride = '') => {
    emitAnalytics('faq_viewed', {
      faq_id: faqId,
      suggested_service: serviceToStart || null,
    });
    appendMessages(createBotMessage(replyOverride || FAQ_CONTENT[faqId]));

    if (serviceToStart) {
      appendMessages(createBotMessage(`I can start your ${SERVICE_FLOWS[serviceToStart].label.toLowerCase()} now.`));
      startServiceFlow(serviceToStart);
      return;
    }

    if (shouldRepeatCurrentField && currentField) {
      appendMessages(createBotMessage('Whenever you are ready, we can continue here, or you can exit this enquiry.', [...CONTINUE_FLOW_OPTION, ...EXIT_FLOW_OPTION]));
      return;
    }

    appendMessages(createBotMessage('If you would like, I can help you continue with an enquiry now.', START_OPTIONS));
  };

  const submitConversation = async (serviceKey, data) => {
    appendMessages(createBotMessage('Thank you. I have everything I need, and I am submitting your enquiry now.'));
    setIsSubmitting(true);

    try {
      const createdEnquiry = await addEnquiry(buildEnquiryPayload(serviceKey, data));
      const referenceId = createdEnquiry?.reference_id || createdEnquiry?.id || 'Pending';

      setSubmittedEnquiry({ referenceId, serviceKey });
      setCurrentFieldIndex(null);
      setSelectedService(null);
      setHandoffContext(null);
      emitAnalytics('enquiry_submitted', {
        service_key: serviceKey,
        reference_id: referenceId,
        flow_type: 'lead_capture',
      });
      appendMessages(
        createBotMessage(
          `Thank you. Your enquiry has been received.\nReference ID: ${referenceId}\nOur team will contact you.\nAvailability and final pricing are shared after manual review.`,
          [{ label: 'Start Another Enquiry', value: 'action:restart' }]
        )
      );
    } catch (error) {
      appendMessages(
        createBotMessage(
          `${error.message || 'Sorry, I could not submit your enquiry right now.'}\nYou can retry here or continue on WhatsApp.`,
          [
            { label: 'Retry Submission', value: 'action:retry-submit' },
            { label: 'Start Over', value: 'action:restart' },
          ]
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitHandoff = async (context, data) => {
    appendMessages(createBotMessage('Thank you. I am sharing your handoff request with our team now.'));
    setIsSubmitting(true);

    try {
      const createdEnquiry = await addEnquiry(
        buildHandoffPayload(context?.serviceKey, data, context?.reason, context?.requestText)
      );
      const referenceId = createdEnquiry?.reference_id || createdEnquiry?.id || 'Pending';
      const resolvedServiceKey = context?.serviceKey || 'general';

      setSubmittedEnquiry({ referenceId, serviceKey: resolvedServiceKey });
      setCurrentFieldIndex(null);
      setSelectedService(null);
      setHandoffContext(null);
      emitAnalytics('enquiry_submitted', {
        service_key: resolvedServiceKey,
        reference_id: referenceId,
        flow_type: 'handoff',
        handoff_reason: context?.reason || null,
      });
      appendMessages(
        createBotMessage(
          `I have shared your request with our team.\nReference ID: ${referenceId}\nOur team will contact you shortly.\nFor the fastest response, you can continue on WhatsApp now.`,
          [{ label: 'Start Another Enquiry', value: 'action:restart' }]
        )
      );
    } catch (error) {
      appendMessages(
        createBotMessage(
          `${error.message || 'Sorry, I could not send the handoff request right now.'}\nYou can retry here or continue on WhatsApp now.`,
          [
            { label: 'Retry Submission', value: 'action:retry-submit' },
            { label: 'Start Over', value: 'action:restart' },
          ]
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startHandoff = (reason, requestText = '', extraData = {}) => {
    const resolvedServiceKey = selectedService || detectBookingIntent(requestText) || detectServiceFromText(requestText) || 'general';
    const mergedData = {
      ...formData,
      ...extraData,
    };
    const nextData = resolvedServiceKey === 'general' && requestText
      ? {
        ...mergedData,
        topic: mergedData.topic || 'Human handoff',
        message: mergedData.message || requestText,
      }
      : mergedData;
    const nextIndex = getNextFieldIndex({ fields: HANDOFF_FIELDS }, -1, nextData);

    setSelectedService(resolvedServiceKey);
    setFormData(nextData);
    setHandoffContext({ reason, requestText, serviceKey: resolvedServiceKey });
    setCurrentFieldIndex(nextIndex);
    emitAnalytics('handoff_triggered', {
      handoff_reason: reason,
      service_key: resolvedServiceKey,
    });
    appendMessages(createBotMessage(`${HANDOFF_CONTENT[reason] || HANDOFF_CONTENT.human}\nI will collect the minimum contact details now and pass this to our team.`));

    if (nextIndex === null) {
      void submitHandoff({ reason, requestText, serviceKey: resolvedServiceKey }, nextData);
      return;
    }

    askField(HANDOFF_FIELDS[nextIndex]);
  };

  const maybeUseAssistantHint = async (rawValue, shouldRepeatCurrentField = false) => {
    setIsThinking(true);
    await wait(THINKING_DELAY_MS);
    const hint = await requestChatbotAssistantHint({
      message: rawValue,
      pathname,
      sessionId,
      selectedService,
      currentFieldKey: currentField?.key || null,
      formData,
      handoffContext,
    });
    setIsThinking(false);

    if (!hint || typeof hint !== 'object') return false;

    const extractedFields = hint.extracted_fields && typeof hint.extracted_fields === 'object'
      ? hint.extracted_fields
      : {};
    const serviceKey = SERVICE_FLOWS[hint.service_key]
      ? hint.service_key
      : null;
    const faqId = hint.faq_id && FAQ_CONTENT[hint.faq_id] ? hint.faq_id : null;
    const handoffReason = hint.should_handoff
      ? (HANDOFF_CONTENT[hint.handoff_reason] ? hint.handoff_reason : 'human')
      : (HANDOFF_CONTENT[hint.handoff_reason] ? hint.handoff_reason : null);
    const replyText = typeof hint.reply_text === 'string' ? hint.reply_text.trim() : '';

    if (handoffReason) {
      startHandoff(handoffReason, rawValue, extractedFields);
      return true;
    }

    if (faqId) {
      answerFaq(faqId, shouldRepeatCurrentField, serviceKey, replyText);
      return true;
    }

    if (serviceKey) {
      if (replyText) {
        appendMessages(createBotMessage(replyText));
      }

      startServiceFlow(serviceKey, {
        ...formData,
        ...extractedFields,
      });
      return true;
    }

    if (replyText) {
      appendMessages(
        createBotMessage(
          replyText,
          shouldRepeatCurrentField ? CONTINUE_FLOW_OPTION : START_OPTIONS
        )
      );
      return true;
    }

    return false;
  };

  const exitActiveFlow = () => {
    const wasInFlow = Boolean(selectedService || handoffContext || currentField);

    setSelectedService(null);
    setCurrentFieldIndex(null);
    setHandoffContext(null);
    setFormData({});

    if (wasInFlow) {
      emitAnalytics('chat_abandoned', {
        reason: 'user_exit_flow',
        message_count: messages.length,
        collected_field_count: Object.keys(formData).length,
      });
    }

    appendMessages(
      createBotMessage(
        'No problem. I’ve exited the current enquiry flow. You can start a new cab, room, tour, or general enquiry whenever you’re ready.',
        START_OPTIONS
      )
    );
  };

  const handleFieldResponse = async (rawValue) => {
    if (!activeQuestionFlow || currentFieldIndex === null) return;

    if (matchesQuestionTone(rawValue) || looksLikeConversation(rawValue)) {
      const handoffReason = detectHandoffReason(rawValue);
      if (handoffReason) {
        startHandoff(handoffReason, rawValue);
        return;
      }

      const faqId = matchFaqId(rawValue);
      if (faqId) {
        answerFaq(faqId, true);
        return;
      }

      const usedAssistantHint = await maybeUseAssistantHint(rawValue, true);
      if (!usedAssistantHint) {
        appendMessages(createBotMessage('I can continue helping here, or you can use WhatsApp for direct team support.'));
        askField(currentField);
      }
      return;
    }

    const result = validateFieldInput(currentField, rawValue, formData);

    if (result.error) {
      if (currentField.type === 'choice' && looksLikeConversation(rawValue)) {
        const usedAssistantHint = await maybeUseAssistantHint(rawValue, true);
        if (usedAssistantHint) {
          return;
        }
      }

      appendMessages(createBotMessage(result.error));
      askField(currentField);
      return;
    }

    if (currentField.key === 'consent_to_contact' && result.value === false) {
      appendMessages(createBotMessage('No problem. I cannot submit the enquiry without your consent. If you change your mind, choose yes below or restart the chat.', currentField.options));
      return;
    }

    const nextData = {
      ...formData,
      [currentField.key]: result.value,
    };

    setFormData(nextData);
    emitAnalytics('field_completed', {
      field_key: currentField.key,
      field_value_type: currentField.type,
      flow_type: handoffContext ? 'handoff' : 'lead_capture',
      service_key: selectedService || null,
    });

    const nextIndex = getNextFieldIndex(activeQuestionFlow, currentFieldIndex, nextData);

    if (nextIndex === null) {
      setCurrentFieldIndex(null);

      if (handoffContext) {
        void submitHandoff(handoffContext, nextData);
        return;
      }

      void submitConversation(selectedService, nextData);
      return;
    }

    setCurrentFieldIndex(nextIndex);
    askField(activeQuestionFlow.fields[nextIndex]);
  };

  const handleMessage = async (rawValue, label = rawValue) => {
    const trimmedValue = String(rawValue || '').trim();
    if (!trimmedValue || isSubmitting || isThinking) return;

    if (trimmedValue === 'action:restart' || normalizeToken(trimmedValue) === 'restart') {
      resetConversation();
      return;
    }

    if (
      trimmedValue === 'action:exit-flow'
      || ['exit', 'cancel', 'stop', 'leave this enquiry', 'quit'].includes(normalizeToken(trimmedValue))
    ) {
      exitActiveFlow();
      return;
    }

    appendMessages(createUserMessage(String(label).trim()));
    setDraft('');

    if (trimmedValue === 'action:retry-submit') {
      if (handoffContext) {
        void submitHandoff(handoffContext, formData);
        return;
      }

      if (selectedService && Object.keys(formData).length > 0) {
        void submitConversation(selectedService, formData);
      }
      return;
    }

    if (trimmedValue === 'action:continue-flow') {
      if (currentField) {
        askField(currentField);
      }
      return;
    }

    if (trimmedValue.startsWith('faq:')) {
      answerFaq(trimmedValue.replace('faq:', ''), Boolean(currentField));
      return;
    }

    if (trimmedValue.startsWith('service:')) {
      startServiceFlow(trimmedValue.replace('service:', ''));
      return;
    }

    if (currentField) {
      await handleFieldResponse(trimmedValue);
      return;
    }

    const handoffReason = detectHandoffReason(trimmedValue);
    if (handoffReason) {
      startHandoff(handoffReason, trimmedValue);
      return;
    }

    const usedAssistantHint = await maybeUseAssistantHint(trimmedValue);
    if (usedAssistantHint) {
      return;
    }

    const bookingIntentService = detectBookingIntent(trimmedValue);
    if (bookingIntentService) {
      const faqId = matchFaqId(trimmedValue);
      if (faqId) {
        answerFaq(faqId, false, bookingIntentService);
        return;
      }

      startServiceFlow(bookingIntentService);
      return;
    }

    const detectedService = detectServiceFromText(trimmedValue);
    if (detectedService) {
      startServiceFlow(detectedService);
      return;
    }

    const faqId = matchFaqId(trimmedValue);
    if (faqId) {
      answerFaq(faqId);
      return;
    }

    appendMessages(createBotMessage('I can help with cab, room, tour, or general enquiries. Please choose one of the options below so I can guide you properly.', START_OPTIONS));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    void handleMessage(draft);
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current && !isSubmitting) {
      inputRef.current.focus();
    }
  }, [isOpen, currentFieldIndex, isSubmitting]);

  useEffect(() => {
    if (!currentFieldKey || !currentFieldType) return;

    emitFieldStarted(currentFieldKey, currentFieldType);
  }, [currentFieldKey, currentFieldType]);

  return (
    <>
      {isOpen && (
        <>
          <button
            aria-label="Close chatbot overlay"
            className="fixed inset-0 z-[108] bg-black/50 backdrop-blur-[2px] md:hidden"
            onClick={() => closeWidget('overlay_click')}
            type="button"
          />
          <section className="fixed inset-x-4 bottom-24 top-20 z-[110] flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface-container-lowest shadow-[0_24px_80px_rgba(0,0,0,0.6)] md:inset-auto md:bottom-28 md:right-8 md:top-auto md:h-[680px] md:w-[420px]">
            <header className="flex items-center justify-between bg-primary-container px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold">{CHATBOT_NAME}</h4>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/70">Structured website enquiries</p>
                </div>
              </div>
              <button className="text-white/70 transition-colors hover:text-white" onClick={() => closeWidget('header_close')} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col">
              <div aria-live="polite" className="flex-1 overflow-y-auto p-4 sm:p-5" role="log">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isBot = message.sender === 'bot';
                    const isActiveOptions = message.id === lastInteractiveMessageId;

                    return (
                      <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[88%] ${isBot ? '' : 'items-end'} flex flex-col gap-2`}>
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                              isBot
                                ? 'border border-white/10 bg-surface-container-high text-on-surface'
                                : 'bg-primary-container text-white'
                            }`}
                          >
                            <p className="whitespace-pre-line">{message.text}</p>
                          </div>
                          {message.options?.length ? (
                            <div className={`flex flex-wrap gap-2 ${isActiveOptions ? '' : 'pointer-events-none opacity-60'}`}>
                              {message.options.map((option) => (
                                <button
                                  key={`${message.id}-${option.value}`}
                                  className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-secondary transition-all hover:border-secondary hover:bg-secondary/15 disabled:cursor-not-allowed"
                                  disabled={!isActiveOptions || isSubmitting || isThinking}
                                  onClick={() => { void handleMessage(option.value, option.label); }}
                                  type="button"
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  {isSubmitting ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-white/10 bg-surface-container-high px-4 py-3 text-sm text-on-surface">
                        Sending your enquiry...
                      </div>
                    </div>
                  ) : null}
                  {isThinking ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-white/10 bg-surface-container-high px-4 py-3 text-sm text-on-surface">
                        Thinking...
                      </div>
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-white/10 bg-black/25 p-4">
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-secondary"
                      disabled={isSubmitting || isThinking}
                      inputMode={inputMeta.inputMode}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={inputMeta.placeholder}
                      value={draft}
                    />
                    <button
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting || isThinking || !draft.trim()}
                      type="submit"
                    >
                      <span className="material-symbols-outlined">north_east</span>
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-on-surface-variant">
                    Type <span className="font-bold text-white">restart</span> any time to begin again. Final pricing and availability are always shared after manual review.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      className="rounded-xl bg-[#25D366] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
                      href={followUpWhatsAppHref}
                      rel="noreferrer"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                    <Link
                      className="rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white/5"
                      onClick={() => closeWidget('contact_link')}
                      to="/contact"
                    >
                      Contact Page
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </>
      )}

      {showMobileContactDock && !isOpen ? (
        <div className="fixed bottom-24 left-4 z-[96] flex translate-y-0 gap-2 opacity-100 transition-all duration-300 ease-out md:hidden">
          <button
            className="rounded-full border border-secondary/40 bg-secondary/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary backdrop-blur transition-all hover:border-secondary/60 hover:bg-secondary/20"
            onClick={openWidget}
            type="button"
          >
            Chat
          </button>
          <Link
            className="rounded-full border border-primary-container/40 bg-primary-container/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur transition-all hover:border-primary-container/60 hover:bg-primary-container/20"
            to="/feedback"
          >
            Feedback
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition-all hover:bg-black/75"
            to="/contact"
          >
            Contact
          </Link>
        </div>
      ) : null}

      <div className="fixed bottom-8 right-8 z-[100] hidden flex-col items-end gap-3 md:flex md:bottom-12 md:right-12">
        <button
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close website chatbot' : 'Open website chatbot'}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full border-none text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-secondary rotate-90' : 'bg-primary-container'}`}
          onClick={() => {
            if (isOpen) {
              closeWidget('fab_toggle');
              return;
            }

            openWidget();
          }}
          type="button"
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isOpen ? 'close' : 'chat'}
          </span>
          {!isOpen ? (
            <div className="pointer-events-none absolute right-full mr-4 whitespace-nowrap rounded border border-white/10 bg-[#201f20] px-3 py-1.5 text-xs uppercase tracking-widest text-[#EFBF04] opacity-0 transition-opacity group-hover:opacity-100">
              Website Chatbot
            </div>
          ) : null}
        </button>
      </div>
    </>
  );
}
