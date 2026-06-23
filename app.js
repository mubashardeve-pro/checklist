(function () {
  const { jsPDF } = window.jspdf;

  const form = document.getElementById('checklistForm');
  const pdfContent = document.getElementById('pdfContent');
  const btnDownload = document.getElementById('btnDownload');
  const btnWhatsApp = document.getElementById('btnWhatsApp');
  const btnEmail = document.getElementById('btnEmail');
  const toast = document.getElementById('toast');
  const whatsappModal = document.getElementById('whatsappModal');
  const whatsappPhone = document.getElementById('whatsappPhone');
  const whatsappPhoneError = document.getElementById('whatsappPhoneError');
  const btnWhatsAppSend = document.getElementById('btnWhatsAppSend');
  const btnWhatsAppCancel = document.getElementById('btnWhatsAppCancel');
  const whatsappModalOverlay = document.getElementById('whatsappModalOverlay');

  let toastTimer;

  function showToast(message, duration = 3000) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
  }

  function getCheckedValues(name) {
    return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (el) => el.value
    );
  }

  function formatSectionList(items) {
    if (!items.length) return '— None selected';
    return items.map((item) => `✅ ${item}`).join('\n');
  }

  function formatSectionListPlain(items) {
    if (!items.length) return '- None selected';
    return items.map((item) => `- ${item}`).join('\n');
  }

  function buildEmailTemplate() {
    const country = document.getElementById('country').value.trim() || 'Not specified';
    const remarks = document.getElementById('remarks').value.trim() || '-';

    const bio = getCheckedValues('bio');
    const edu = getCheckedValues('edu');
    const english = getCheckedValues('english');
    const support = getCheckedValues('support');
    const attestation = getCheckedValues('attestation');

    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const text = [
      'EDIFY GROUP OF COMPANIES',
      'DOCUMENTS CHECKLIST',
      '',
      '-------------------------',
      `Date: ${date}`,
      `Country: ${country}`,
      '-------------------------',
      '',
      'BIO DOCUMENTS',
      formatSectionListPlain(bio),
      '',
      'EDUCATIONAL DOCUMENTS',
      formatSectionListPlain(edu),
      '',
      'ENGLISH LANGUAGE REQUIREMENTS',
      formatSectionListPlain(english),
      '',
      'SUPPORTING DOCUMENTS',
      formatSectionListPlain(support),
      '',
      'ATTESTATION OF DOCUMENTS',
      formatSectionListPlain(attestation),
      '',
      'REMARKS',
      remarks,
      '',
      '-------------------------',
      'EDIFY GROUP OF COMPANIES',
      'UAN: +92 304 1111 444',
      'info@edify.pk',
      'www.edify.pk',
    ].join('\n');

    return { country, remarks, text };
  }

  function buildShareTemplate() {
    const country = document.getElementById('country').value.trim() || 'Not specified';
    const remarks = document.getElementById('remarks').value.trim() || '—';

    const bio = getCheckedValues('bio');
    const edu = getCheckedValues('edu');
    const english = getCheckedValues('english');
    const support = getCheckedValues('support');
    const attestation = getCheckedValues('attestation');

    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const text = [
      '*EDIFY GROUP OF COMPANIES*',
      '*DOCUMENTS CHECKLIST*',
      '',
      '─────────────────',
      `📅 *Date:* ${date}`,
      `🌍 *Country:* ${country}`,
      '─────────────────',
      '',
      '*BIO DOCUMENTS*',
      formatSectionList(bio),
      '',
      '*EDUCATIONAL DOCUMENTS*',
      formatSectionList(edu),
      '',
      '*ENGLISH LANGUAGE REQUIREMENTS*',
      formatSectionList(english),
      '',
      '*SUPPORTING DOCUMENTS*',
      formatSectionList(support),
      '',
      '*ATTESTATION OF DOCUMENTS*',
      formatSectionList(attestation),
      '',
      '*REMARKS*',
      remarks,
      '',
      '─────────────────',
      '*EDIFY GROUP OF COMPANIES*',
      'UAN: +92 304 1111 444',
      'info@edify.pk',
      'www.edify.pk',
    ].join('\n');

    return { country, remarks, text };
  }

  function validateForm() {
    const country = document.getElementById('country').value.trim();
    const hasAnyChecked = form.querySelector('input[type="checkbox"]:checked');

    if (!country) {
      showToast('Please select a Country before exporting.');
      document.getElementById('country').focus();
      return false;
    }

    if (!hasAnyChecked) {
      showToast('Please select at least one document.');
      return false;
    }

    return true;
  }

  function validatePhoneNumber(input) {
    const digits = input.replace(/\D/g, '');

    if (!digits) {
      return { valid: false, error: 'Please enter client mobile number.' };
    }

    let normalized = digits;

    if (normalized.startsWith('92')) {
      normalized = normalized.slice(2);
    }

    if (normalized.startsWith('0')) {
      normalized = normalized.slice(1);
    }

    if (!/^3[0-9]{9}$/.test(normalized)) {
      return {
        valid: false,
        error: 'Invalid number. Use format: 03001234567 or 3001234567',
      };
    }

    return { valid: true, phone: `92${normalized}` };
  }

  function showPhoneError(message) {
    whatsappPhoneError.textContent = message;
    whatsappPhoneError.classList.remove('hidden');
    whatsappPhone.classList.add('input-error');
  }

  function clearPhoneError() {
    whatsappPhoneError.textContent = '';
    whatsappPhoneError.classList.add('hidden');
    whatsappPhone.classList.remove('input-error');
  }

  function openWhatsAppModal() {
    whatsappPhone.value = '';
    clearPhoneError();
    whatsappModal.classList.remove('hidden');
    whatsappPhone.focus();
  }

  function closeWhatsAppModal() {
    whatsappModal.classList.add('hidden');
    clearPhoneError();
  }

  function openEmailApp(text, country) {
    const subject = `Documents Checklist - ${country} - Edify Group`;
    let body = text;

    if (body.length > 1000) {
      body = `${body.slice(0, 1000)}\n...`;
    }

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:info@edify.pk?subject=${encodedSubject}&body=${encodedBody}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodedSubject}&body=${encodedBody}`;

    if (isMobileDevice()) {
      window.location.href = mailtoUrl;
      return;
    }

    const emailWindow = window.open(gmailUrl, '_blank');
    if (!emailWindow) {
      window.location.href = mailtoUrl;
    }
  }

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function openWhatsApp(phone, text) {
    const encodedText = encodeURIComponent(text);
    const appUrl = `whatsapp://send?phone=${phone}&text=${encodedText}`;
    const webUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
    const waMeUrl = `https://wa.me/${phone}?text=${encodedText}`;

    if (!isMobileDevice()) {
      window.open(webUrl, '_blank');
      return;
    }

    let fallbackTimer;
    const cancelFallback = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', cancelFallback);
      window.removeEventListener('blur', cancelFallback);
    };

    const onVisibilityChange = () => {
      if (document.hidden) cancelFallback();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', cancelFallback);
    window.addEventListener('blur', cancelFallback);

    fallbackTimer = setTimeout(() => {
      cancelFallback();
      window.location.href = waMeUrl;
    }, 2000);

    window.location.href = appUrl;
  }

  async function generatePDF() {
    const countrySelect = document.getElementById('country');
    const countryPdfValue = document.getElementById('countryPdfValue');
    countryPdfValue.textContent = countrySelect.value;

    pdfContent.classList.add('pdf-capture');

    try {
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      return pdf;
    } finally {
      pdfContent.classList.remove('pdf-capture');
    }
  }

  function getFileName() {
    const country = document.getElementById('country').value.trim().replace(/\s+/g, '_');
    const date = new Date().toISOString().slice(0, 10);
    return `Edify_Documents_Checklist_${country}_${date}.pdf`;
  }

  btnDownload.addEventListener('click', async () => {
    if (!validateForm()) return;

    btnDownload.disabled = true;
    showToast('Generating PDF...');

    try {
      const pdf = await generatePDF();
      pdf.save(getFileName());
      showToast('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF. Please try again.');
    } finally {
      btnDownload.disabled = false;
    }
  });

  btnWhatsApp.addEventListener('click', () => {
    if (!validateForm()) return;
    openWhatsAppModal();
  });

  btnWhatsAppCancel.addEventListener('click', closeWhatsAppModal);
  whatsappModalOverlay.addEventListener('click', closeWhatsAppModal);

  whatsappPhone.addEventListener('input', clearPhoneError);

  whatsappPhone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnWhatsAppSend.click();
    }
    if (e.key === 'Escape') closeWhatsAppModal();
  });

  btnWhatsAppSend.addEventListener('click', () => {
    const result = validatePhoneNumber(whatsappPhone.value);

    if (!result.valid) {
      showPhoneError(result.error);
      whatsappPhone.focus();
      return;
    }

    clearPhoneError();
    const messageText = buildShareTemplate().text;
    closeWhatsAppModal();
    openWhatsApp(result.phone, messageText);
    showToast('Opening WhatsApp...');
  });

  btnEmail.addEventListener('click', () => {
    if (!validateForm()) return;

    const summary = buildEmailTemplate();
    openEmailApp(summary.text, summary.country);
    showToast('Opening email...');
  });
})();
