import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            <PasskeyVerify />

            {status && (
                <div className="mb-4 rounded-lg bg-brand-soft px-4 py-3 text-center text-sm font-medium text-brand-navy">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-brand-navy">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                    className="min-h-[44px] rounded-lg border-gray-200 bg-white px-4 py-2.5 text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-brand-navy">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-sm text-brand-navy underline-offset-4 hover:text-brand-navy/70"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="min-h-[44px] rounded-lg border-gray-200 bg-white px-4 py-2.5 text-slate-700 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-gray-200 data-[state=checked]:bg-brand-blue data-[state=checked]:border-brand-blue data-[state=checked]:text-brand-navy"
                                />
                                <Label htmlFor="remember" className="text-sm text-slate-700 cursor-pointer">
                                    Ingat saya
                                </Label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                className="mt-1 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 font-semibold text-brand-navy transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none motion-reduce:transition-none motion-reduce:hover:transform-none"
                            >
                                {processing && <Spinner className="h-4 w-4" />}
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </div>

                        <p className="text-center text-sm text-slate-500">
                            Belum punya akun?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={6}
                                className="font-semibold text-brand-navy hover:text-brand-navy/70"
                            >
                                Daftar sekarang
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat Datang Kembali',
    description: 'Masukkan email dan password untuk melanjutkan',
};
