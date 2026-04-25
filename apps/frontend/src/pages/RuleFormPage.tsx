import { useParams } from 'react-router-dom';
import { ResourceFormShell, type ResourceFormCopy } from '../components/forms';

const RULE_FORM_BASE: ResourceFormCopy = {
  breadcrumbManagement: 'Manajemen Peraturan',
  breadcrumbCurrent: 'Upload Peraturan',
  sectionDataTitle: 'Data Peraturan',
  sectionDataDescription: 'Lengkapi informasi utama peraturan sebelum mengunggah berkas.',
  titleLabel: 'Judul Peraturan',
  titlePlaceholder: 'Contoh: Peraturan Site Riha',
  descriptionLabel: 'Deskripsi Peraturan',
  descriptionPlaceholder:
    'Peraturan ini bertujuan untuk mencatat proses atau ketentuan yang berlaku di site …',
  sectionFileTitle: 'Upload File Peraturan',
  sectionFileDescription: 'Unggah dokumen peraturan dalam format yang ditetapkan (mis. PDF).',
};

export default function RuleFormPage() {
  const { id } = useParams();
  const isEdit = id != null;

  const copy: ResourceFormCopy = {
    ...RULE_FORM_BASE,
    breadcrumbCurrent: isEdit ? 'Edit Peraturan' : 'Upload Peraturan',
  };

  return <ResourceFormShell copy={copy} listPath="/peraturan" />;
}
