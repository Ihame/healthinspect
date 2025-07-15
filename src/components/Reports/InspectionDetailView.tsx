import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Eye, 
  Calendar, 
  MapPin, 
  User, 
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Camera,
  Star,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Inspection, InspectionItem } from '../../types';
import { getInspectionById } from '../../lib/supabase';
import { OfficialInspectionItem } from '../../data/officialInspectionForms';

interface InspectionDetailViewProps {
  inspectionId: string;
  onBack: () => void;
}

const InspectionDetailView: React.FC<InspectionDetailViewProps> = ({ inspectionId, onBack }) => {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadInspection = async () => {
      try {
        setLoading(true);
        const data = await getInspectionById(inspectionId);
        setInspection(data);
      } catch (err) {
        setError('Failed to load inspection details');
        console.error('Error loading inspection:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInspection();
  }, [inspectionId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case 'yes': return 'bg-green-100 text-green-700 border-green-300';
      case 'no': return 'bg-red-100 text-red-700 border-red-300';
      case 'na': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'yes': return <CheckCircle className="w-4 h-4" />;
      case 'no': return <XCircle className="w-4 h-4" />;
      case 'na': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPharmacyStatusColor = (status?: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-300';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-300';
      case 'not_applicable': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPharmacyStatusIcon = (status?: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'non_compliant': return <XCircle className="w-4 h-4" />;
      case 'not_applicable': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('PDF download feature would be implemented here');
  };

  // Check if this is a pharmacy inspection by looking at the first item structure
  const isPharmacyInspection = inspection?.items && inspection.items.length > 0 && 
    'number' in inspection.items[0] && 'targetedPoints' in inspection.items[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading inspection details...</span>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inspection</h2>
          <p className="text-gray-600 mb-4">{error || 'Inspection not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isPharmacyInspection ? 'RSSB Pharmacy Inspection Report' : 'Inspection Report'}
                </h1>
                <p className="text-sm text-gray-600">{inspection.facilityName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">
                {isPharmacyInspection ? 'RSSB Pharmacy Inspection Report' : 'Health Facility Inspection Report'}
              </h1>
            </div>
            <p className="text-lg text-gray-600">Ministry of Health - Rwanda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Facility</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{inspection.facilityName}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">District</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">{inspection.district}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Inspector</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{inspection.inspectorName}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(inspection.startDate)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {inspection.compliancePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Compliance Score</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {inspection.totalScore} / {inspection.maxPossibleScore}
              </div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(inspection.status)}`}>
                {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Status</div>
            </div>
          </div>
        </div>

        {/* Inspection Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Inspection Details
            </h2>
          </div>

          {isPharmacyInspection ? (
            inspection.items.some(item => !('number' in item && 'targetedPoints' in item && 'description' in item && 'status' in item)) ? (
              <div className="p-6 text-center text-red-600">
                <h3 className="text-lg font-semibold mb-2">Incomplete Pharmacy Inspection Data</h3>
                <p>Some required fields are missing for this pharmacy inspection. Please contact an administrator or try again later.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {inspection.items.map((item, index) => {
                  const pharmacyItem = item as unknown as OfficialInspectionItem;
                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-800 mr-3">
                              {pharmacyItem.number}
                            </span>
                            <h3 className="text-lg font-medium text-gray-900">{pharmacyItem.description}</h3>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <div className={`flex items-center px-3 py-1 rounded-lg border ${getPharmacyStatusColor(pharmacyItem.status)}`}>
                            {getPharmacyStatusIcon(pharmacyItem.status)}
                            <span className="ml-1 text-sm font-medium">
                              {pharmacyItem.status ? pharmacyItem.status.replace('_', ' ').toUpperCase() : 'Not Answered'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-11 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Targeted Points:</h4>
                        <ul className="space-y-1">
                          {pharmacyItem.targetedPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="text-sm text-gray-600 flex items-start">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {pharmacyItem.observation && (
                        <div className="ml-11 mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-1">Observation:</div>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{pharmacyItem.observation}</p>
                        </div>
                      )}
                      {item.images && item.images.length > 0 && (
                        <div className="ml-11">
                          <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                            <Camera className="w-4 h-4 mr-2" />
                            Evidence Photos ({item.images.length})
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {item.images.map((imageUrl, imageIndex) => (
                              <div key={imageIndex} className="relative group">
                                <img
                                  src={imageUrl}
                                  alt={`Evidence ${imageIndex + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => setSelectedImage(imageUrl)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Regular Inspection Format */
            <div className="divide-y divide-gray-200">
              {inspection.items.map((item, index) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-800 mr-3">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-9">Category: {item.category}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Max Score</div>
                        <div className="text-lg font-semibold text-gray-900">{item.maxScore}</div>
                      </div>
                      
                      <div className={`flex items-center px-3 py-1 rounded-lg border ${getResponseColor(item.response || '')}`}>
                        {getResponseIcon(item.response || '')}
                        <span className="ml-1 text-sm font-medium">
                          {item.response ? item.response.toUpperCase() : 'Not Answered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score and Comments */}
                  <div className="ml-9 mb-4">
                    {item.actualScore !== undefined && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">
                          Score: <span className="font-semibold text-gray-900">{item.actualScore} / {item.maxScore}</span>
                        </span>
                      </div>
                    )}
                    
                    {item.comments && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Comments:</div>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{item.comments}</p>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  {item.images && item.images.length > 0 && (
                    <div className="ml-9">
                      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Evidence Photos ({item.images.length})
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {item.images.map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Evidence ${imageIndex + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => setSelectedImage(imageUrl)}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Signature Section */}
        {inspection.signature && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspector Signature</h3>
            <div className="flex items-center justify-center">
              <img
                src={inspection.signature}
                alt="Inspector Signature"
                className="max-w-md border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Notes Section */}
        {inspection.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{inspection.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            This report was generated on {formatDate(new Date())} by the Health Inspection System.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Ministry of Health - Rwanda | Health Facility Inspection Program
          </p>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-600" />
            </button>
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionDetailView; 