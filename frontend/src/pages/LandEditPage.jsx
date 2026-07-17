import { useNavigate, useParams } from 'react-router-dom';
import { LandForm } from '@/components/lands/LandForm.jsx';
import { useLand, useUpdateLand } from '@/hooks/useLands.js';
import { getApiErrorMessage } from '@/utils/authErrors.js';

export function LandEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const landQuery = useLand(id);
  const updateLand = useUpdateLand();

  async function handleSubmit(payload) {
    try {
      const result = await updateLand.mutateAsync({ id, payload });
      navigate(`/my-lands/${result.land._id}`, { replace: true });
    } catch (error) {
      window.alert(getApiErrorMessage(error, 'Unable to update listing.'));
    }
  }

  if (landQuery.isLoading) return <section className="page-shell">Loading listing...</section>;

  return (
    <section className="page-shell space-y-4">
      <p className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
        Important edits to location, area, pricing, transaction type, documents, or soil information may require reverification.
      </p>
      <LandForm mode="edit" initialValues={landQuery.data?.land} onSubmit={handleSubmit} isSubmitting={updateLand.isPending} />
    </section>
  );
}
