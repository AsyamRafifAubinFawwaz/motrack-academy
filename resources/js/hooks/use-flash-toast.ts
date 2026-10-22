import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type FlashProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
        warning?: string | null;
    };
};

export function useFlashToast(): void {
    const { props } = usePage<FlashProps>();
    const { success, error, warning } = props.flash ?? {};

    useEffect(() => {
        if (error) {
            toast.error(error);
        } else if (warning) {
            toast.warning(warning);
        } else if (success) {
            toast.success(success);
        }
    }, [success, error, warning]);
}
