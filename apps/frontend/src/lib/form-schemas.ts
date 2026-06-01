import { z } from 'zod';
import { parseNumberFieldValue } from './form-utils';

const trimmedRequired = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`);

const selectRequired = (label: string) =>
  z
    .string()
    .min(1, `${label} wajib dipilih`);

export const resourceFormSchema = z.object({
  title: trimmedRequired('Judul'),
  description: z.string().optional(),
  file: z.custom<File | null>().nullable(),
});

export function createResourceFormSchema(requireFile: boolean) {
  return resourceFormSchema.superRefine((data, ctx) => {
    if (requireFile && !data.file) {
      ctx.addIssue({
        code: 'custom',
        message: 'Berkas wajib diunggah',
        path: ['file'],
      });
    }
  });
}

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export const siteMetricFormSchema = z.object({
  date: selectRequired('Tanggal'),
  target: z
    .string()
    .min(1, 'Target wajib diisi')
    .refine((value) => Number.isFinite(parseNumberFieldValue(value)), 'Target harus berupa angka'),
  realization: z
    .string()
    .min(1, 'Realisasi wajib diisi')
    .refine((value) => Number.isFinite(parseNumberFieldValue(value)), 'Realisasi harus berupa angka'),
});

export type SiteMetricFormValues = z.infer<typeof siteMetricFormSchema>;

const userIdentitySchema = z.object({
  firstName: trimmedRequired('Nama depan'),
  lastName: trimmedRequired('Nama belakang'),
  gender: selectRequired('Jenis kelamin'),
  nik: trimmedRequired('NIK karyawan'),
  position: trimmedRequired('Jabatan'),
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
});

export const createUserFormSchema = userIdentitySchema.extend({
  username: trimmedRequired('Username'),
  password: trimmedRequired('Password'),
  role: selectRequired('Role'),
});

export const editUserFormSchema = userIdentitySchema.extend({
  username: trimmedRequired('Username'),
  role: selectRequired('Role'),
  password: z.string(),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type EditUserFormValues = z.infer<typeof editUserFormSchema>;

export type UserFormFieldValues = {
  firstName: string;
  lastName: string;
  gender: string;
  nik: string;
  position: string;
  email: string;
  username: string;
  role: string;
  password: string;
};
