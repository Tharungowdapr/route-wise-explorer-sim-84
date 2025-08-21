
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DetailedReport from '../components/DetailedReport';

const DetailedReportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto p-4">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simulator
            </Button>
          </Link>
        </div>
      </div>
      
      <DetailedReport />
    </div>
  );
};

export default DetailedReportPage;
