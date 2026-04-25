import { useParams } from 'react-router-dom';
import { ResourceFormShell, type ResourceFormCopy } from '../components/forms';

const REPORT_FORM_BASE: ResourceFormCopy = {
  breadcrumbManagement: 'Manajemen Laporan',
  breadcrumbCurrent: 'Upload Laporan',
  sectionDataTitle: 'Data Laporan',
  sectionDataDescription: 'Lengkapi informasi utama laporan sebelum mengunggah berkas.',
  titleLabel: 'Judul Laporan',
  titlePlaceholder: 'Contoh: Laporan Aktivitas Tambang Site Riha',
  descriptionLabel: 'Deskripsi Laporan',
  descriptionPlaceholder:
    'Jelaskan ringkasan isi laporan, periode, atau konteks yang relevan untuk tim Anda.',
  sectionFileTitle: 'Upload File Laporan',
  sectionFileDescription: 'Unggah dokumen laporan dalam format PDF atau sesuai kebijakan perusahaan.',
};

export default function ReportFormPage() {
  const { id } = useParams();
  const isEdit = id != null;

  const copy: ResourceFormCopy = {
    ...REPORT_FORM_BASE,
    breadcrumbCurrent: isEdit ? 'Edit Laporan' : 'Upload Laporan',
  };

  return <ResourceFormShell copy={copy} listPath="/laporan" />;
}
