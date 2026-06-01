import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FormSection, FormSelectField, FormTextField } from '../components/forms';
import PageHeader from '../components/layout/PageHeader';
import { Button } from '../components/ui';
import { COLORS } from '../constants/colors';
import {
  createUser,
  type UserManagementRecord,
  updateUser,
} from '../lib/cngr-api';
import {
  createUserFormSchema,
  editUserFormSchema,
  type CreateUserFormValues,
  type EditUserFormValues,
  type UserFormFieldValues,
} from '../lib/form-schemas';
import { scrollToFirstFieldError } from '../lib/form-utils';
import { useUserDirectory } from '../lib/user-directory-context';
import { EUserRole } from '../lib/navigation-session';
import { readUserManagementListState } from './user-management-list-state';

const GENDER_OPTIONS = [
  { value: '', label: 'Pilih Jenis Kelamin' },
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'Pilih Role' },
  { value: EUserRole.ADMIN, label: 'Admin' },
  { value: EUserRole.SUPERVISOR, label: 'Supervisor' },
  { value: EUserRole.DIRECTOR, label: 'Director' },
];

type FormMode = 'create' | 'edit';

const EMPTY_USER_VALUES: CreateUserFormValues = {
  firstName: '',
  lastName: '',
  gender: '',
  nik: '',
  position: '',
  email: '',
  username: '',
  password: '',
  role: '',
};

function userRecordToFormValues(user: UserManagementRecord): EditUserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    nik: user.nik,
    position: user.position,
    email: user.email,
    username: user.username,
    role: user.role,
    password: '',
  };
}

function UserFormFields({
  register,
  errors,
  isEditMode,
}: {
  register: UseFormRegister<UserFormFieldValues>;
  errors: FieldErrors<UserFormFieldValues>;
  isEditMode: boolean;
}) {
  return (
    <>
      <FormSection
        step={1}
        title="Data User"
        description={
          isEditMode
            ? 'Perbarui identitas dasar user yang tersimpan di sistem.'
            : 'Silahkan lengkapi data user di bawah ini untuk bisa menambahkan akun user.'
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField
            label="Nama Depan"
            isRequired
            placeholder="Masukkan nama depan"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <FormTextField
            label="Nama Belakang"
            isRequired
            placeholder="Masukkan nama belakang"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
          <FormSelectField
            label="Jenis Kelamin"
            isRequired
            options={GENDER_OPTIONS}
            error={errors.gender?.message}
            {...register('gender')}
          />
          <FormTextField
            label="NIK Karyawan"
            isRequired
            placeholder="Masukkan NIK karyawan"
            error={errors.nik?.message}
            {...register('nik')}
          />
          <FormTextField
            label="Jabatan"
            isRequired
            placeholder="Masukkan jabatan user"
            error={errors.position?.message}
            className="sm:col-span-2"
            {...register('position')}
          />
        </div>
      </FormSection>

      <FormSection
        step={2}
        title="Data Akun"
        description={
          isEditMode
            ? 'Perbarui data akun user di bawah ini.'
            : 'Silahkan lengkapi data akun di bawah ini untuk bisa menambahkan akun user.'
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormTextField
            label="Username"
            isRequired
            placeholder="Masukkan username"
            error={errors.username?.message}
            {...register('username')}
          />
          <FormSelectField
            label="Role"
            isRequired
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            {...register('role')}
          />
          <FormTextField
            label="Email"
            isRequired
            type="email"
            placeholder="nama@perusahaan.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormTextField
            label="Password"
            isRequired={!isEditMode}
            type="password"
            placeholder={isEditMode ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
      </FormSection>
    </>
  );
}

function CreateUserForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: EMPTY_USER_VALUES,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const onSubmit = async (values: CreateUserFormValues) => {
    setSubmitError(undefined);
    setIsSubmitting(true);

    try {
      await createUser({
        email: values.email.trim(),
        firstname: values.firstName.trim(),
        gender: values.gender.trim(),
        lastname: values.lastName.trim(),
        nik: values.nik.trim(),
        password: values.password,
        position: values.position.trim(),
        role: values.role.trim(),
        username: values.username.trim(),
      });
      await onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => scrollToFirstFieldError(fieldErrors))}
    >
      <UserFormFields register={register} errors={errors} isEditMode={false} />

      {submitError ? (
        <p className="text-sm" role="alert" style={{ color: COLORS.primary }}>
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          Kembali
        </Button>
        <Button type="submit" variant="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
        </Button>
      </div>
    </form>
  );
}

function EditUserForm({
  detail,
  onBack,
  onSuccess,
}: {
  detail: UserManagementRecord;
  onBack: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: EMPTY_USER_VALUES,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(userRecordToFormValues(detail));
  }, [detail, reset]);

  const onSubmit = async (values: EditUserFormValues) => {
    setSubmitError(undefined);
    setIsSubmitting(true);

    try {
      await updateUser(detail.id, {
        email: values.email.trim(),
        firstname: values.firstName.trim(),
        gender: values.gender.trim(),
        lastname: values.lastName.trim(),
        nik: values.nik.trim(),
        position: values.position.trim(),
        role: values.role.trim(),
        username: values.username.trim(),
        ...(values.password?.trim() ? { password: values.password } : {}),
      });
      await onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-6"
      noValidate
      onSubmit={handleSubmit(onSubmit, (fieldErrors) => scrollToFirstFieldError(fieldErrors))}
    >
      <UserFormFields register={register} errors={errors} isEditMode />

      {submitError ? (
        <p className="text-sm" role="alert" style={{ color: COLORS.primary }}>
          {submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" size="md" onClick={onBack}>
          Kembali
        </Button>
        <Button type="submit" variant="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan…' : 'Simpan Data'}
        </Button>
      </div>
    </form>
  );
}

export default function UserManagementFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const mode: FormMode = id ? 'edit' : 'create';
  const { getUser, refreshUsers } = useUserDirectory();
  const listState = useMemo(
    () => readUserManagementListState(location.state),
    [location.state]
  );

  const returnToList = useCallback(() => {
    navigate('/user-management', { state: listState });
  }, [listState, navigate]);

  const handleSaveSuccess = useCallback(async () => {
    await refreshUsers();
    returnToList();
  }, [refreshUsers, returnToList]);

  const [detail, setDetail] = useState<UserManagementRecord | undefined>();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState<string | undefined>();

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      return;
    }

    let cancelled = false;
    const userId = id;

    async function loadUserDetail() {
      setIsLoading(true);
      setLoadError(undefined);

      try {
        const user = await getUser(userId);
        if (cancelled) {
          return;
        }

        if (user) {
          setDetail(user);
        } else {
          setDetail(undefined);
          setLoadError('Data user tidak ditemukan.');
        }
      } catch (err) {
        if (!cancelled) {
          setDetail(undefined);
          setLoadError(err instanceof Error ? err.message : 'Gagal memuat detail user.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUserDetail();

    return () => {
      cancelled = true;
    };
  }, [getUser, id, mode]);

  const breadcrumb = useMemo(
    () => [
      { label: 'Manajemen User', to: '/user-management' },
      { label: mode === 'edit' ? 'Edit User' : 'Tambah User' },
    ],
    [mode]
  );

  const handleBack = () => returnToList();

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
          Memuat data user...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader breadcrumb={breadcrumb} />

      <div className="flex flex-col gap-6 p-10">
        <div>
          <h1 className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>
            User
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed" style={{ color: COLORS.textSecondary }}>
            {mode === 'edit'
              ? 'Perbarui data user yang sudah terdaftar di sistem.'
              : 'Halaman untuk menambah akun user agar mereka dapat mengakses website.'}
          </p>
        </div>

        {mode === 'edit' && !detail ? (
          <div className="mx-page-x rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: COLORS.border }}>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {loadError ?? 'Data user tidak tersedia.'}
            </p>
            <div className="mt-4">
              <Button type="button" variant="outline" size="md" onClick={handleBack}>
                Kembali
              </Button>
            </div>
          </div>
        ) : mode === 'create' ? (
          <CreateUserForm onBack={handleBack} onSuccess={handleSaveSuccess} />
        ) : detail ? (
          <EditUserForm detail={detail} onBack={handleBack} onSuccess={handleSaveSuccess} />
        ) : null}
      </div>
    </div>
  );
}
