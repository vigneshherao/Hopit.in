import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, ArrowRight, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { LandMap } from '@/components/lands/LandMap.jsx';
import {
  agreementTypes,
  areaUnits,
  landPurposes,
  purposeLabels,
  soilTypes,
  terrainTypes,
  transactionLabels,
  transactionTypes,
  waterAvailabilityOptions,
  waterSources,
} from '@/utils/landData.js';
import { uploadLandFiles } from '@/services/landService.js';

const schema = z.object({
  title: z.string().min(3, 'Title is required.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  shortDescription: z.string().optional(),
  purposes: z.array(z.string()).min(1, 'Select at least one purpose.'),
  transactionTypes: z.array(z.string()).min(1, 'Select at least one transaction type.'),
  location: z.object({
    address: z.string().min(3, 'Address is required.'),
    village: z.string().optional(),
    taluk: z.string().optional(),
    city: z.string().min(2, 'City is required.'),
    district: z.string().min(2, 'District is required.'),
    state: z.string().min(2, 'State is required.'),
    country: z.string().default('India'),
    pincode: z.string().optional(),
    coordinates: z
      .object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      })
      .optional(),
  }),
  area: z.object({
    value: z.coerce.number().positive('Area must be positive.'),
    unit: z.string(),
  }),
  landDetails: z.object({
    soilType: z.string(),
    soilDescription: z.string().optional(),
    currentCrop: z.string().optional(),
    previousCropsText: z.string().optional(),
    terrain: z.string(),
    irrigationAvailable: z.boolean(),
    waterSources: z.array(z.string()).min(1, 'Select a water source.'),
    waterAvailability: z.string(),
    electricityAvailable: z.boolean(),
    roadAccess: z.boolean(),
    fencingAvailable: z.boolean(),
    storageAvailable: z.boolean(),
    farmHouseAvailable: z.boolean(),
  }),
  pricing: z.object({
    salePrice: optionalNumber(),
    monthlyRent: optionalNumber(),
    annualLeaseAmount: optionalNumber(),
    securityDeposit: optionalNumber(),
    priceNegotiable: z.boolean(),
    revenueShareOwnerPercentage: optionalNumber(),
    revenueShareFarmerPercentage: optionalNumber(),
  }),
  agreementTerms: z.object({
    minimumDurationMonths: optionalNumber(),
    maximumDurationMonths: optionalNumber(),
    availableFrom: z.string().optional(),
    noticePeriodDays: optionalNumber(),
    ownerParticipationAllowed: z.boolean(),
    preferredAgreementType: z.string().optional(),
  }),
  businessSuitabilityText: z.string().optional(),
  media: z.object({ images: z.array(z.string()) }),
  documents: z.array(z.object({ type: z.string(), name: z.string(), url: z.string() })),
});

const steps = ['Basic', 'Location', 'Land', 'Pricing', 'Media', 'Review'];

export function LandForm({ initialValues, onSubmit, isSubmitting = false, mode = 'create' }) {
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const defaults = useMemo(() => buildDefaults(initialValues), [initialValues]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    const handler = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const values = watch();
  const coordinates = values.location?.coordinates?.coordinates;
  const pickerValue = coordinates ? { longitude: coordinates[0], latitude: coordinates[1] } : null;

  async function next() {
    const valid = await trigger();
    if (valid) setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function uploadFiles(event, kind) {
    const files = event.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploads = await uploadLandFiles(files, kind);
      if (kind === 'images') {
        setValue('media.images', [...values.media.images, ...uploads.map((item) => item.url)], { shouldDirty: true });
      } else {
        setValue(
          'documents',
          [
            ...values.documents,
            ...uploads.map((item) => ({
              type: 'other',
              name: item.name,
              url: item.url,
              verificationStatus: 'pending',
            })),
          ],
          { shouldDirty: true },
        );
      }
    } finally {
      setUploading(false);
    }
  }

  function submitWithStatus(status) {
    return handleSubmit((formValues) => {
      onSubmit(normalizeFormValues(formValues, status));
    })();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'edit' ? 'Edit land listing' : 'Create land listing'}</CardTitle>
        <CardDescription>
          Step {step + 1} of {steps.length}: {steps[step]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2 sm:grid-cols-6">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${index === step ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
              onClick={() => setStep(index)}
            >
              {label}
            </button>
          ))}
        </div>

        {step === 0 ? (
          <div className="grid gap-4">
            <Field label="Title" error={errors.title?.message}>
              <Input {...register('title')} />
            </Field>
            <Field label="Short description" error={errors.shortDescription?.message}>
              <Input {...register('shortDescription')} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <textarea className="min-h-32 w-full rounded-md border bg-background p-3 text-sm" {...register('description')} />
            </Field>
            <CheckboxGroup label="Purposes" values={landPurposes} labels={purposeLabels} selected={values.purposes} onChange={(value) => setValue('purposes', value, { shouldDirty: true })} />
            <CheckboxGroup label="Transaction types" values={transactionTypes} labels={transactionLabels} selected={values.transactionTypes} onChange={(value) => setValue('transactionTypes', value, { shouldDirty: true })} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {['address', 'village', 'taluk', 'city', 'district', 'state', 'pincode'].map((field) => (
              <Field key={field} label={fieldLabel(field)} error={errors.location?.[field]?.message}>
                <Input {...register(`location.${field}`)} />
              </Field>
            ))}
            <div className="md:col-span-2">
              <LandMap
                pickerValue={pickerValue}
                onPick={({ longitude, latitude }) =>
                  setValue('location.coordinates', { type: 'Point', coordinates: [longitude, latitude] }, { shouldDirty: true })
                }
              />
              <p className="mt-2 text-sm text-muted-foreground">Click the map to set latitude and longitude.</p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Area" error={errors.area?.value?.message}>
              <Input type="number" step="0.01" {...register('area.value')} />
            </Field>
            <SelectField label="Area unit" {...register('area.unit')} options={areaUnits} />
            <SelectField label="Soil type" {...register('landDetails.soilType')} options={soilTypes} />
            <SelectField label="Terrain" {...register('landDetails.terrain')} options={terrainTypes} />
            <SelectField label="Water availability" {...register('landDetails.waterAvailability')} options={waterAvailabilityOptions} />
            <Field label="Current crop"><Input {...register('landDetails.currentCrop')} /></Field>
            <Field label="Previous crops"><Input placeholder="Rice, banana, turmeric" {...register('landDetails.previousCropsText')} /></Field>
            <div className="md:col-span-2">
              <CheckboxGroup label="Water sources" values={waterSources} selected={values.landDetails.waterSources} onChange={(value) => setValue('landDetails.waterSources', value, { shouldDirty: true })} />
            </div>
            {['irrigationAvailable', 'electricityAvailable', 'roadAccess', 'fencingAvailable', 'storageAvailable', 'farmHouseAvailable'].map((field) => (
              <Toggle key={field} label={fieldLabel(field)} checked={values.landDetails[field]} onChange={(checked) => setValue(`landDetails.${field}`, checked, { shouldDirty: true })} />
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {['salePrice', 'monthlyRent', 'annualLeaseAmount', 'securityDeposit', 'revenueShareOwnerPercentage', 'revenueShareFarmerPercentage'].map((field) => (
              <Field key={field} label={fieldLabel(field)} error={errors.pricing?.[field]?.message}>
                <Input type="number" {...register(`pricing.${field}`)} />
              </Field>
            ))}
            <Toggle label="Price negotiable" checked={values.pricing.priceNegotiable} onChange={(checked) => setValue('pricing.priceNegotiable', checked, { shouldDirty: true })} />
            <Toggle label="Owner participation allowed" checked={values.agreementTerms.ownerParticipationAllowed} onChange={(checked) => setValue('agreementTerms.ownerParticipationAllowed', checked, { shouldDirty: true })} />
            <SelectField label="Preferred agreement type" {...register('agreementTerms.preferredAgreementType')} options={agreementTypes} />
            <Field label="Suitable for"><Input placeholder="Organic farming, dairy, warehouse" {...register('businessSuitabilityText')} /></Field>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-6">
            <UploadBox label="Upload images" accept="image/jpeg,image/png,image/webp" uploading={uploading} onChange={(event) => uploadFiles(event, 'images')} />
            <PreviewGrid items={values.media.images} onRemove={(url) => setValue('media.images', values.media.images.filter((item) => item !== url), { shouldDirty: true })} />
            <UploadBox label="Upload documents" accept="image/jpeg,image/png,image/webp,application/pdf" uploading={uploading} onChange={(event) => uploadFiles(event, 'documents')} />
            <div className="grid gap-2">
              {values.documents.map((document, index) => (
                <div key={document.url} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>{document.name}</span>
                  <button type="button" onClick={() => setValue('documents', values.documents.filter((_, itemIndex) => itemIndex !== index), { shouldDirty: true })}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="rounded-md border bg-muted/30 p-4">
            <h3 className="font-semibold">{values.title || 'Untitled land listing'}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{values.location?.district}, {values.location?.state}</p>
            <p className="mt-2 text-sm">{values.area?.value} {values.area?.unit} · {values.transactionTypes.join(', ')}</p>
            {!values.media.images.length || !values.documents.length ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Submit for verification requires at least one image and one document.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((value) => Math.max(value - 1, 0))}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => submitWithStatus('draft')}>
              Save draft
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={next}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" disabled={isSubmitting} onClick={() => submitWithStatus('pending-verification')}>
                Submit for verification
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <Field label={label}>
      <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...props}>
        {options.map((option) => (
          <option key={option} value={option}>{fieldLabel(option)}</option>
        ))}
      </select>
    </Field>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function CheckboxGroup({ label, values, labels = {}, selected = [], onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const checked = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={`rounded-md border px-3 py-2 text-sm ${checked ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
              onClick={() => onChange(checked ? selected.filter((item) => item !== value) : [...selected, value])}
            >
              {labels[value] ?? fieldLabel(value)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UploadBox({ label, accept, uploading, onChange }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
      <UploadCloud className="h-8 w-8 text-primary" />
      <span className="mt-2 font-medium">{uploading ? 'Uploading...' : label}</span>
      <input className="sr-only" type="file" multiple accept={accept} onChange={onChange} />
    </label>
  );
}

function PreviewGrid({ items, onRemove }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((url) => (
        <div key={url} className="relative overflow-hidden rounded-md border">
          <img src={url} alt="" className="h-32 w-full object-cover" />
          <button className="absolute right-2 top-2 rounded-md bg-card p-1" type="button" onClick={() => onRemove(url)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function optionalNumber() {
  return z.preprocess((value) => (value === '' || value === undefined ? undefined : Number(value)), z.number().min(0).optional());
}

function buildDefaults(initialValues) {
  return {
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    shortDescription: initialValues?.shortDescription ?? '',
    purposes: initialValues?.purposes ?? ['agriculture'],
    transactionTypes: initialValues?.transactionTypes ?? ['lease'],
    location: {
      address: initialValues?.location?.address ?? '',
      village: initialValues?.location?.village ?? '',
      taluk: initialValues?.location?.taluk ?? '',
      city: initialValues?.location?.city ?? '',
      district: initialValues?.location?.district ?? '',
      state: initialValues?.location?.state ?? '',
      country: initialValues?.location?.country ?? 'India',
      pincode: initialValues?.location?.pincode ?? '',
      coordinates: initialValues?.location?.coordinates,
    },
    area: initialValues?.area ?? { value: 1, unit: 'acre' },
    landDetails: {
      soilType: initialValues?.landDetails?.soilType ?? 'unknown',
      soilDescription: initialValues?.landDetails?.soilDescription ?? '',
      currentCrop: initialValues?.landDetails?.currentCrop ?? '',
      previousCropsText: initialValues?.landDetails?.previousCrops?.join(', ') ?? '',
      terrain: initialValues?.landDetails?.terrain ?? 'flat',
      irrigationAvailable: initialValues?.landDetails?.irrigationAvailable ?? false,
      waterSources: initialValues?.landDetails?.waterSources ?? ['borewell'],
      waterAvailability: initialValues?.landDetails?.waterAvailability ?? 'unknown',
      electricityAvailable: initialValues?.landDetails?.electricityAvailable ?? false,
      roadAccess: initialValues?.landDetails?.roadAccess ?? false,
      fencingAvailable: initialValues?.landDetails?.fencingAvailable ?? false,
      storageAvailable: initialValues?.landDetails?.storageAvailable ?? false,
      farmHouseAvailable: initialValues?.landDetails?.farmHouseAvailable ?? false,
    },
    pricing: {
      salePrice: initialValues?.pricing?.salePrice ?? '',
      monthlyRent: initialValues?.pricing?.monthlyRent ?? '',
      annualLeaseAmount: initialValues?.pricing?.annualLeaseAmount ?? '',
      securityDeposit: initialValues?.pricing?.securityDeposit ?? '',
      priceNegotiable: initialValues?.pricing?.priceNegotiable ?? true,
      revenueShareOwnerPercentage: initialValues?.pricing?.revenueShareOwnerPercentage ?? '',
      revenueShareFarmerPercentage: initialValues?.pricing?.revenueShareFarmerPercentage ?? '',
    },
    agreementTerms: {
      minimumDurationMonths: initialValues?.agreementTerms?.minimumDurationMonths ?? '',
      maximumDurationMonths: initialValues?.agreementTerms?.maximumDurationMonths ?? '',
      availableFrom: initialValues?.agreementTerms?.availableFrom?.slice?.(0, 10) ?? '',
      noticePeriodDays: initialValues?.agreementTerms?.noticePeriodDays ?? '',
      ownerParticipationAllowed: initialValues?.agreementTerms?.ownerParticipationAllowed ?? false,
      preferredAgreementType: initialValues?.agreementTerms?.preferredAgreementType ?? 'registered',
    },
    businessSuitabilityText: initialValues?.businessSuitability?.suitableFor?.join(', ') ?? '',
    media: { images: initialValues?.media?.images ?? [] },
    documents: initialValues?.documents ?? [],
  };
}

function normalizeFormValues(values, status) {
  return {
    ...values,
    status,
    landDetails: {
      ...values.landDetails,
      previousCrops: splitList(values.landDetails.previousCropsText),
    },
    businessSuitability: {
      suitableFor: splitList(values.businessSuitabilityText),
    },
    documents: values.documents.map((document) => ({ ...document, verificationStatus: 'pending' })),
  };
}

function splitList(value = '') {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function fieldLabel(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
