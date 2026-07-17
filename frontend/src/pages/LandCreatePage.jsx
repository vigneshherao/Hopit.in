import { useNavigate } from 'react-router-dom';
import { LandForm } from '@/components/lands/LandForm.jsx';
import { useCreateLand } from '@/hooks/useLands.js';
import { getApiErrorMessage } from '@/utils/authErrors.js';

export function LandCreatePage() {
  const navigate = useNavigate();
  const createLand = useCreateLand();

  async function handleSubmit(payload) {
    try {
      const result = await createLand.mutateAsync(payload);
      navigate(`/my-lands/${result.land._id}`, { replace: true });
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Unable to create listing.'));
    }
  }

  return (
    <section className="page-shell">
      <LandForm onSubmit={handleSubmit} isSubmitting={createLand.isPending} />
    </section>
  );
}
