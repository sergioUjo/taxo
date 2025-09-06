'use client';

import { useState } from 'react';

import { useMutation, useQuery } from 'convex/react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

type ClassificationDialogProps = {
  caseId: Id<'cases'>;
  hasExistingClassification: boolean;
};

export function ClassificationDialog({
  caseId,
  hasExistingClassification,
}: ClassificationDialogProps) {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [selectedTreatmentTypeId, setSelectedTreatmentTypeId] =
    useState<string>('');
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Queries
  const specialties = useQuery(api.specialties.getSpecialties);
  const treatmentTypes = useQuery(
    api.treatments.getTreatmentTypes,
    selectedSpecialtyId
      ? { specialtyId: selectedSpecialtyId as Id<'specialties'> }
      : { specialtyId: undefined }
  );
  const procedures = useQuery(
    api.procedures.getProcedures,
    selectedTreatmentTypeId
      ? { treatmentTypeId: selectedTreatmentTypeId as Id<'treatmentTypes'> }
      : { treatmentTypeId: undefined }
  );

  // Mutations
  const classifyCase = useMutation(
    api.case_classifications.classifyCaseWithProcedure
  );

  const handleClassifyCase = async () => {
    if (
      !selectedSpecialtyId ||
      !selectedTreatmentTypeId ||
      !selectedProcedureId
    ) {
      return;
    }

    setIsClassifying(true);
    try {
      await classifyCase({
        caseId,
        specialtyId: selectedSpecialtyId as Id<'specialties'>,
        treatmentTypeId: selectedTreatmentTypeId as Id<'treatmentTypes'>,
        procedureId: selectedProcedureId as Id<'procedures'>,
        classifiedBy: 'user', // In a real app, this would be the current user
        confidence: 1.0,
      });

      // Reset form and close dialog
      setSelectedSpecialtyId('');
      setSelectedTreatmentTypeId('');
      setSelectedProcedureId('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error classifying case:', error);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          {hasExistingClassification ? 'Reclassify Case' : 'Classify Case'}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {hasExistingClassification ? 'Reclassify Case' : 'Classify Case'}
          </DialogTitle>
          <DialogDescription>
            Select a procedure to classify this case and generate rule checks
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Specialty Selection */}
          <div>
            <label className='text-sm font-medium'>Specialty</label>
            <Select
              value={selectedSpecialtyId}
              onValueChange={(value) => {
                setSelectedSpecialtyId(value);
                setSelectedTreatmentTypeId('');
                setSelectedProcedureId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a specialty' />
              </SelectTrigger>
              <SelectContent>
                {specialties?.map((specialty) => (
                  <SelectItem key={specialty._id} value={specialty._id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Treatment Type Selection */}
          {selectedSpecialtyId && (
            <div>
              <label className='text-sm font-medium'>Treatment Type</label>
              <Select
                value={selectedTreatmentTypeId}
                onValueChange={(value) => {
                  setSelectedTreatmentTypeId(value);
                  setSelectedProcedureId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a treatment type' />
                </SelectTrigger>
                <SelectContent>
                  {treatmentTypes?.map((treatmentType) => (
                    <SelectItem
                      key={treatmentType._id}
                      value={treatmentType._id}
                    >
                      {treatmentType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Procedure Selection */}
          {selectedTreatmentTypeId && (
            <div>
              <label className='text-sm font-medium'>Procedure</label>
              <Select
                value={selectedProcedureId}
                onValueChange={setSelectedProcedureId}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a procedure' />
                </SelectTrigger>
                <SelectContent>
                  {procedures?.map((procedure) => (
                    <SelectItem key={procedure._id} value={procedure._id}>
                      {procedure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setIsDialogOpen(false)}
            disabled={isClassifying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClassifyCase}
            disabled={
              !selectedSpecialtyId ||
              !selectedTreatmentTypeId ||
              !selectedProcedureId ||
              isClassifying
            }
          >
            {isClassifying
              ? 'Classifying...'
              : hasExistingClassification
                ? 'Reclassify Case'
                : 'Classify Case'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
