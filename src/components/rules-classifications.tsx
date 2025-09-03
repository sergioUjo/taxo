'use client';

import { useState } from 'react';

import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ViewType = 'specialties' | 'rules';

// Temporary mock data until we implement the Convex queries
const mockSpecialties = [
  {
    id: '1',
    name: 'Ophthalmology',
    description: 'Eye care and vision-related procedures',
    treatmentTypes: [
      {
        id: '1-1',
        name: 'Consultation',
        description: 'Initial patient consultations and evaluations',
        procedures: [
          {
            id: '1-1-1',
            name: 'Comprehensive Eye Exam',
            description: 'Complete eye examination including vision testing',
          },
          {
            id: '1-1-2',
            name: 'Retinal Screening',
            description: 'Screening for retinal diseases and disorders',
          },
        ],
      },
      {
        id: '1-2',
        name: 'Procedure or Surgery',
        description: 'Surgical procedures and interventions',
        procedures: [
          {
            id: '1-2-1',
            name: 'Trabeculectomy',
            description: 'Glaucoma surgery to reduce eye pressure',
          },
          {
            id: '1-2-2',
            name: 'Cataract Surgery',
            description: 'Removal of clouded lens from the eye',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system care',
    treatmentTypes: [
      {
        id: '2-1',
        name: 'Diagnostics',
        description: 'Diagnostic tests and procedures',
        procedures: [
          {
            id: '2-1-1',
            name: 'Echocardiogram',
            description: 'Ultrasound of the heart',
          },
          {
            id: '2-1-2',
            name: 'Stress Test',
            description: 'Exercise stress testing for heart function',
          },
        ],
      },
    ],
  },
];

const mockRules = [
  {
    id: '1',
    title: 'Prior Authorization Required',
    description:
      'All surgical procedures require prior authorization from insurance',
    ruleType: 'approval',
    priority: 'high',
    specialty: 'Ophthalmology',
    treatmentType: 'Procedure or Surgery',
    procedure: null,
  },
  {
    id: '2',
    title: 'Referral Letter Required',
    description: 'Specialist consultation requires referral from primary care',
    ruleType: 'documentation',
    priority: 'medium',
    specialty: 'Cardiology',
    treatmentType: 'Consultation',
    procedure: null,
  },
];

const getRulePriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRuleTypeColor = (type: string) => {
  switch (type) {
    case 'eligibility':
      return 'bg-blue-100 text-blue-800';
    case 'workflow':
      return 'bg-purple-100 text-purple-800';
    case 'documentation':
      return 'bg-indigo-100 text-indigo-800';
    case 'scheduling':
      return 'bg-teal-100 text-teal-800';
    case 'approval':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function RulesClassifications() {
  const [activeView, setActiveView] = useState<ViewType>('specialties');
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(
    new Set()
  );
  const [expandedTreatmentTypes, setExpandedTreatmentTypes] = useState<
    Set<string>
  >(new Set());

  const toggleSpecialty = (id: string) => {
    const newExpanded = new Set(expandedSpecialties);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSpecialties(newExpanded);
  };

  const toggleTreatmentType = (id: string) => {
    const newExpanded = new Set(expandedTreatmentTypes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTreatmentTypes(newExpanded);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Rules & Classifications
          </h1>
          <p className='text-muted-foreground'>
            Manage medical specialties, treatment types, procedures, and
            business rules
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add New
        </Button>
      </div>

      <div className='flex space-x-2 border-b'>
        <button
          onClick={() => setActiveView('specialties')}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeView === 'specialties'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Classifications
        </button>
        <button
          onClick={() => setActiveView('rules')}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            activeView === 'rules'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Rules
        </button>
      </div>

      {activeView === 'specialties' && (
        <div className='space-y-4'>
          {mockSpecialties.map((specialty) => (
            <Card key={specialty.id}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() => toggleSpecialty(specialty.id)}
                      className='rounded p-1 hover:bg-gray-100'
                    >
                      {expandedSpecialties.has(specialty.id) ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </button>
                    <div>
                      <CardTitle className='text-xl'>
                        {specialty.name}
                      </CardTitle>
                      {specialty.description && (
                        <p className='text-muted-foreground mt-1 text-sm'>
                          {specialty.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button variant='ghost' size='sm'>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedSpecialties.has(specialty.id) && (
                <CardContent>
                  <div className='ml-6 space-y-3'>
                    {specialty.treatmentTypes.map((treatmentType) => (
                      <div key={treatmentType.id} className='border-l-2 pl-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <button
                              onClick={() =>
                                toggleTreatmentType(treatmentType.id)
                              }
                              className='rounded p-1 hover:bg-gray-100'
                            >
                              {expandedTreatmentTypes.has(treatmentType.id) ? (
                                <ChevronDown className='h-3 w-3' />
                              ) : (
                                <ChevronRight className='h-3 w-3' />
                              )}
                            </button>
                            <div>
                              <h4 className='font-medium'>
                                {treatmentType.name}
                              </h4>
                              {treatmentType.description && (
                                <p className='text-muted-foreground text-xs'>
                                  {treatmentType.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <Button variant='ghost' size='sm'>
                              <Edit className='h-3 w-3' />
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>

                        {expandedTreatmentTypes.has(treatmentType.id) && (
                          <div className='mt-2 ml-6 space-y-2'>
                            {treatmentType.procedures.map((procedure) => (
                              <div
                                key={procedure.id}
                                className='border-l py-1 pl-3'
                              >
                                <div className='flex items-center justify-between'>
                                  <div>
                                    <h5 className='text-sm font-medium'>
                                      {procedure.name}
                                    </h5>
                                    {procedure.description && (
                                      <p className='text-muted-foreground text-xs'>
                                        {procedure.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className='flex items-center space-x-1'>
                                    <Button variant='ghost' size='sm'>
                                      <Edit className='h-3 w-3' />
                                    </Button>
                                    <Button variant='ghost' size='sm'>
                                      <Trash2 className='h-3 w-3' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Button variant='ghost' size='sm' className='ml-3'>
                              <Plus className='mr-1 h-3 w-3' />
                              Add Procedure
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button variant='ghost' size='sm' className='ml-6'>
                      <Plus className='mr-1 h-3 w-3' />
                      Add Treatment Type
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeView === 'rules' && (
        <div className='space-y-4'>
          {mockRules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>{rule.title}</CardTitle>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      {rule.description}
                    </p>
                    <div className='mt-3 flex items-center space-x-2'>
                      <Badge className={getRuleTypeColor(rule.ruleType)}>
                        {rule.ruleType}
                      </Badge>
                      <Badge className={getRulePriorityColor(rule.priority)}>
                        {rule.priority}
                      </Badge>
                      <Badge variant='outline'>
                        {rule.specialty}
                        {rule.treatmentType && ` → ${rule.treatmentType}`}
                        {rule.procedure && ` → ${rule.procedure}`}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button variant='ghost' size='sm'>
                      <Settings className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
