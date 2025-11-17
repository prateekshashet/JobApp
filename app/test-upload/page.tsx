import ResumeUpload from '@/components/forms/ResumeUpload';

export default function TestUploadPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Test Resume Upload</h1>
      <div className="max-w-3xl mx-auto">
        <ResumeUpload jobId="test-job-123" />
      </div>
    </div>
  );
}
