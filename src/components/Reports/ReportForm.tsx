import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMissingPersonsStore } from '../../store/missingPersonsStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Upload, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const reportSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  age: z.number().min(0, 'Age must be positive').max(150, 'Age must be reasonable'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select gender'
  }),
  dateDisappeared: z.string().min(1, 'Date is required'),
  locationAddress: z.string().min(5, 'Address must be at least 5 characters'),
  locationCity: z.string().min(2, 'City must be at least 2 characters'),
  locationState: z.string().min(2, 'State must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reporterName: z.string().min(2, 'Reporter name must be at least 2 characters'),
  reporterRelationship: z.string().min(2, 'Relationship must be specified'),
  reporterPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  reporterEmail: z.string().email('Please enter a valid email address'),
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'You must give consent to share this information'
  })
});

type ReportFormData = z.infer<typeof reportSchema>;

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

export const ReportForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { addReport } = useMissingPersonsStore();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema)
  });
  
  const consentGiven = watch('consentGiven');
  
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  const removeImage = () => {
    setUploadedImage(null);
  };
  
  const onSubmit = async (data: ReportFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: remplacer par géocodage réel si besoin
      const mockCoordinates = { lat: 48.8566, lng: 2.3522 };
      
      const result = await addReport({
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        photo: uploadedImage || undefined,
        dateDisappeared: data.dateDisappeared,
        locationDisappeared: {
          address: data.locationAddress,
          city: data.locationCity,
          state: data.locationState,
          country: 'France',
          coordinates: mockCoordinates
        },
        description: data.description,
        reporterContact: {
          name: data.reporterName,
          relationship: data.reporterRelationship,
          phone: data.reporterPhone,
          email: data.reporterEmail
        },
        consentGiven: data.consentGiven
      });
      
      if (result.success) {
        navigate('/rapports');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report Missing Person</h1>
        <p className="mt-2 text-gray-600">
          Please provide as much detail as possible to help with the search efforts.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Missing Person Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Missing Person Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                {...register('firstName')}
                error={errors.firstName?.message}
                required
              />
              
              <Input
                label="Last Name"
                {...register('lastName')}
                error={errors.lastName?.message}
                required
              />
              
              <Input
                label="Age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
                required
              />
              
              <Select
                label="Gender"
                options={genderOptions}
                {...register('gender')}
                error={errors.gender?.message}
                required
              />
            </div>
            
            {/* Photo Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo <span className="text-gray-500">(Recommended)</span>
              </label>
              
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Missing person"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-red-600 hover:text-red-700 font-medium">
                        Upload a photo
                      </span>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Location and Date */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Last Known Location & Date
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Date Last Seen"
                type="date"
                {...register('dateDisappeared')}
                error={errors.dateDisappeared?.message}
                required
              />
              
              <Input
                label="Street Address"
                {...register('locationAddress')}
                error={errors.locationAddress?.message}
                placeholder="123 Main Street"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  {...register('locationCity')}
                  error={errors.locationCity?.message}
                  required
                />
                
                <Input
                  label="State"
                  {...register('locationState')}
                  error={errors.locationState?.message}
                  placeholder="TX"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Description */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Description & Circumstances</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Please describe what the person was wearing, their behavior before disappearing, and any relevant circumstances..."
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Reporter Contact Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Reporter Contact Information</h2>
            <p className="text-sm text-gray-600">
              This information will be used by authorities to contact you regarding the case.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Your Full Name"
                {...register('reporterName')}
                error={errors.reporterName?.message}
                required
              />
              
              <Input
                label="Relationship to Missing Person"
                {...register('reporterRelationship')}
                error={errors.reporterRelationship?.message}
                placeholder="Mother, Friend, etc."
                required
              />
              
              <Input
                label="Phone Number"
                type="tel"
                {...register('reporterPhone')}
                error={errors.reporterPhone?.message}
                placeholder="+1-555-123-4567"
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                {...register('reporterEmail')}
                error={errors.reporterEmail?.message}
                required
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Consent and Submit */}
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  {...register('consentGiven')}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="consent" className="text-sm font-medium text-gray-900">
                    Consent for Information Sharing <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    I authorize the dissemination of this information to aid in the search for this missing person. 
                    I understand that this information will be shared with law enforcement, volunteers, and the public 
                    to assist in search efforts. I confirm that I am authorized to share this information.
                  </p>
                </div>
              </div>
              {errors.consentGiven && (
                <p className="text-sm text-red-600">{errors.consentGiven.message}</p>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Privacy Notice:</strong> This platform complies with GDPR and data protection regulations. 
                  Your personal information will only be used for the purpose of finding the missing person and will 
                  be handled according to our privacy policy.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/rapports')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!consentGiven}
              >
                Submit Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};