const tabs = document.querySelectorAll('.tab');
const identifierLabel = document.getElementById('identifierLabel');
const identifierInput = document.getElementById('identifierInput');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const otpGroup = document.getElementById('otpGroup');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');

const authSection = document.getElementById('authSection');
const accountSection = document.getElementById('accountSection');
const accountList = document.getElementById('accountList');

const invoiceSection = document.getElementById('invoiceSection');
const selectedAccountTag = document.getElementById('selectedAccountTag');
const itemsContainer = document.getElementById('itemsContainer');
const addItemBtn = document.getElementById('addItemBtn');
const previewBtn = document.getElementById('previewBtn');
const printBtn = document.getElementById('printBtn');
const pdfBtn = document.getElementById('pdfBtn');
const linkBtn = document.getElementById('linkBtn');
const shareArea = document.getElementById('shareArea');
const shareLink = document.getElementById('shareLink');
const logoInput = document.getElementById('logoInput');
const invoicePreview = document.getElementById('invoicePreview');

const accounts = ['Praxinvoicx Retail', 'Praxinvoicx Services', 'Praxinvoicx Exports'];
let loginMode = 'email';
let logoDataUrl = '';

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    loginMode = tab.dataset.mode;

    if (loginMode === 'email') {
      identifierLabel.textContent = 'Business E-mail';
      identifierInput.type = 'email';
      identifierInput.placeholder = 'you@company.com';
    } else {
      identifierLabel.textContent = 'Mobile Number';
      identifierInput.type = 'tel';
      identifierInput.placeholder = '+91 98xxxxxx98';
    }
  });
});

sendOtpBtn.addEventListener('click', () => {
  if (!identifierInput.value.trim()) {
    alert('Please enter your e-mail or mobile number.');
    return;
  }

  otpGroup.classList.remove('hidden');
});

verifyOtpBtn.addEventListener('click', () => {
  const otp = document.getElementById('otpInput').value;
  if (otp !== '123456') {
    alert('Invalid OTP. Use demo OTP 123456.');
    return;
  }

  authSection.classList.add('hidden');
  accountSection.classList.remove('hidden');
  renderAccounts();
});

function renderAccounts() {
  accountList.innerHTML = '';
  accounts.forEach((account) => {
    const card = document.createElement('div');
    card.className = 'account';
    card.innerHTML = `<span>${account}</span><button class="primary">Open</button>`;

    card.querySelector('button').addEventListener('click', () => {
      accountSection.classList.add('hidden');
      invoiceSection.classList.remove('hidden');
      selectedAccountTag.textContent = account;
      document.getElementById('businessName').value = account;
    });

    accountList.appendChild(card);
  });
}

function createItemRow() {
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <input type="text" placeholder="Item description" class="item-name" />
    <input type="number" placeholder="Qty" min="1" class="item-qty" />
    <input type="number" placeholder="Rate (INR)" min="0" class="item-rate" />
  `;
  itemsContainer.appendChild(row);
}

addItemBtn.addEventListener('click', createItemRow);
createItemRow();

logoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logoDataUrl = reader.result;
  };
  reader.readAsDataURL(file);
});

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
}

function buildInvoicePreview() {
  const businessName = document.getElementById('businessName').value || 'Business Name';
  const clientName = document.getElementById('clientName').value || 'Client';
  const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-0001';
  const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];

  const rows = [...document.querySelectorAll('.item-row')].map((row) => {
    const name = row.querySelector('.item-name').value || 'Item';
    const qty = Number(row.querySelector('.item-qty').value || 1);
    const rate = Number(row.querySelector('.item-rate').value || 0);
    const amount = qty * rate;
    return { name, qty, rate, amount };
  });

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  const tableRows = rows
    .map(
      (row) =>
        `<tr><td>${row.name}</td><td>${row.qty}</td><td>${formatINR(row.rate)}</td><td>${formatINR(
          row.amount
        )}</td></tr>`
    )
    .join('');

  invoicePreview.innerHTML = `
    <header>
      <div>
        <h3>${businessName}</h3>
        <p>Invoice #: ${invoiceNumber}</p>
        <p>Date: ${invoiceDate}</p>
      </div>
      <div>${logoDataUrl ? `<img src="${logoDataUrl}" alt="Business logo" />` : ''}</div>
    </header>
    <p><strong>Bill To:</strong> ${clientName}</p>
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <p class="total">Total: ${formatINR(total)}</p>
  `;

  invoicePreview.classList.remove('hidden');
}

previewBtn.addEventListener('click', buildInvoicePreview);

printBtn.addEventListener('click', () => {
  buildInvoicePreview();
  window.print();
});

pdfBtn.addEventListener('click', () => {
  buildInvoicePreview();
  window.print();
});

linkBtn.addEventListener('click', () => {
  buildInvoicePreview();
  const encoded = btoa(unescape(encodeURIComponent(invoicePreview.innerHTML))).slice(0, 48);
  const link = `${window.location.origin}${window.location.pathname}#invoice=${encoded}`;
  shareArea.classList.remove('hidden');
  shareLink.value = link;
});
