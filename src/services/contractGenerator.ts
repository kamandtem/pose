import { OfficeProject, StudioProfile, ServiceType } from '../types/pose';

const fa = (n: number) => n.toLocaleString('fa-IR');
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fa-IR');
};

export function generateContractHTML(project: OfficeProject, profile: StudioProfile | null): string {
  const ceremonyTotal = project.ceremonyInvoice?.total || 0;
  const formalityTotal = project.formalityInvoice?.total || 0;
  const total = ceremonyTotal + formalityTotal;

  const ceremonyServices = project.ceremony?.services ? Object.entries(project.ceremony.services)
    .filter(([_, v]) => v.checked)
    .map(([name, v]) => `<li style="margin-bottom: 8px"><strong>${name}${v.notes ? ': ' + v.notes : ''}</strong></li>`)
    .join('') : '';

  const ceremonyCameras = project.ceremony?.cameras ? Object.entries(project.ceremony.cameras)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => `<li style="margin-bottom: 8px">${name}: ${fa(count)} دستگاه</li>`)
    .join('') : '';

  const formalityServices = project.formality ? `
    <li>لوکیشن: ${project.formality.location || '-'}</li>
    <li>نوع کلیپ: ${project.formality.clipType || '-'}</li>
    <li>تم درخواستی: ${project.formality.theme || '-'}</li>
  ` : '';

  const invoiceRows = [...(project.ceremonyInvoice?.items || []), ...(project.formalityInvoice?.items || [])]
    .map(item => `
      <tr style="border-bottom: 1px solid #e0e0e0">
        <td style="padding: 8px; text-align: right">${item.name}</td>
        <td style="padding: 8px; text-align: center">${fa(item.count)}</td>
        <td style="padding: 8px; text-align: center">${fa(item.price)}</td>
        <td style="padding: 8px; text-align: center">${fa(item.count * item.price)}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <title>قرارداد خدمات عکاسی و فیلمبرداری</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Tahoma', sans-serif; line-height: 1.6; color: #333; }
    .page { width: 21cm; height: 29.7cm; padding: 2cm; page-break-after: always; position: relative; }
    .header { text-align: center; margin-bottom: 2cm; border-bottom: 2px solid #8B008B; padding-bottom: 10px; }
    .logo { width: 50px; height: 50px; margin: 0 auto 10px; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    h1 { font-size: 18px; font-weight: bold; color: #8B008B; margin-bottom: 5px; }
    .date { font-size: 12px; color: #666; }
    .content { font-size: 13px; margin-bottom: 1.5cm; }
    .section-title { font-weight: bold; color: #8B008B; margin-top: 15px; margin-bottom: 8px; }
    .section-list { margin-right: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #f0f0f0; padding: 8px; text-align: right; border: 1px solid #ddd; }
    td { padding: 8px; border: 1px solid #ddd; }
    .total-row { background: #f9f9f9; font-weight: bold; }
    .footer { position: absolute; bottom: 2cm; left: 2cm; right: 2cm; font-size: 11px; color: #666; text-align: center; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <!-- Page 1: Header & Conditions -->
  <div class="page">
    <div class="header">
      ${profile?.logo ? `<div class="logo"><img src="${profile.logo}" alt="logo"></div>` : ''}
      <h1>${profile?.name || 'استودیو/اتلیه'}</h1>
      <p>قرارداد خدمات عکاسی و فیلمبرداری</p>
      <p class="date">تاریخ: ${formatDate(new Date().toISOString())}</p>
    </div>

    <div class="content">
      <div class="section-title">۱) موضوع قرارداد:</div>
      <p style="margin-right: 20px; margin-bottom: 10px;">
        ارائه خدمات عکاسی و فیلمبرداری برای پروژه "${project.name}" مطابق مشخصات زیر:
      </p>
      ${project.ceremony ? `
        <div style="margin-right: 20px;">
          <strong>الف) مراسم - تاریخ: ${formatDate(project.ceremony.date)}</strong>
          <ul class="section-list" style="margin-top: 5px;">
            ${ceremonyCameras ? `<li style="margin-bottom: 5px;"><strong>تجهیزات:</strong><ul>${ceremonyCameras}</ul></li>` : ''}
            ${ceremonyServices ? `<li style="margin-bottom: 5px;"><strong>موارد مورد نظر:</strong><ul>${ceremonyServices}</ul></li>` : ''}
          </ul>
        </div>
      ` : ''}
      ${project.formality ? `
        <div style="margin-right: 20px; margin-top: 10px;">
          <strong>ب) فرمالیته - تاریخ: ${formatDate(project.formality.recordDate)}</strong>
          <ul class="section-list" style="margin-top: 5px;">${formalityServices}</ul>
        </div>
      ` : ''}
    </div>

    <div class="content">
      <div class="section-title">۲) شرایط و مسئولیت‌ها:</div>
      <ul class="section-list">
        <li style="margin-bottom: 8px;">تحویل خدمات براساس تاریخ‌های مشخص‌شده</li>
        <li style="margin-bottom: 8px;">حفاظت از حقوق مالکیت فکری و اخلاقی</li>
        <li style="margin-bottom: 8px;">عدم انتشار بدون اجازه‌ی صریح</li>
        <li style="margin-bottom: 8px;">تحویل فایل‌های نهایی در قالب‌های توافق‌شده</li>
      </ul>
    </div>

    <div class="footer">
      امضای طرفین قرارداد<br>
      ${profile?.phone ? 'تلفن: ' + profile.phone : ''}<br>
      ${profile?.craftCode ? 'شماره صنفی: ' + profile.craftCode : ''}
    </div>
  </div>

  <!-- Page 2: Invoice -->
  <div class="page">
    <div class="header">
      <h1>فاکتور خدمات</h1>
      <p>${project.name}</p>
      <p class="date">تاریخ: ${formatDate(new Date().toISOString())}</p>
    </div>

    <div class="content">
      <table>
        <thead>
          <tr>
            <th>نام خدمت/تجهیز</th>
            <th>تعداد</th>
            <th>قیمت واحد (تومان)</th>
            <th>جمع (تومان)</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceRows}
          <tr class="total-row">
            <td colspan="3" style="text-align: left;">جمع کل</td>
            <td>${fa(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      پرداخت تمام مبلغ الزامی است<br>
      برای اطلاعات بیشتر با ما تماس بگیرید
    </div>
  </div>
</body>
</html>
  `;
}
