import { useParams } from 'react-router-dom';
import { ResourceFormShell, type ResourceFormCopy } from '../components/forms';

const DOCUMENT_FORM_BASE: ResourceFormCopy = {
  breadcrumbManagement: 'Manajemen Dokumen',
  breadcrumbCurrent: 'Upload Dokumen',
  sectionDataTitle: 'Data Dokumen',
  sectionDataDescription: 'Lengkapi informasi utama dokumen sebelum mengunggah berkas.',
  titleLabel: 'Judul Dokumen',
  titlePlaceholder: 'Contoh: Dokumen AMDAL Site Riha',
  descriptionLabel: 'Deskripsi Dokumen',
  descriptionPlaceholder:
    'Jelaskan ringkasan isi dokumen, tujuan, atau konteks yang membantu pencarian nanti.',
  sectionFileTitle: 'Upload File Dokumen',
  sectionFileDescription: 'Unggah berkas dokumen sesuai format yang disyaratkan (mis. PDF, maks. 10MB).',
};

export default function DocumentFormPage() {
  const { id } = useParams();
  const isEdit = id != null;

  const copy: ResourceFormCopy = {
    ...DOCUMENT_FORM_BASE,
    breadcrumbCurrent: isEdit ? 'Edit Dokumen' : 'Upload Dokumen',
  };

  return <ResourceFormShell copy={copy} listPath="/dokumen" />;
}
