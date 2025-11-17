import React, { useState } from "react";

interface PdfPreviewProps {
  cloudName?: string;
  publicId?: string;
  secureUrl?: string;
  className?: string;
}

export default function PdfPreview({ 
  cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  publicId, 
  secureUrl,
  className = ""
}: PdfPreviewProps) {
  const [open, setOpen] = useState(false);

  // If secureUrl is available, use it for direct view
  // Otherwise construct a raw URL using cloudName and publicId
  const pdfUrl = secureUrl || 
    (cloudName && publicId 
      ? `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId.replace(/\.pdf$/, '')}.pdf`
      : null);

  // Thumbnail: request first page as JPG using Cloudinary PDF -> image transform
  const thumbUrl = cloudName && publicId
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${publicId.replace(/\.pdf$/, '')}.pdf[0].jpg`
    : null;

  if (!pdfUrl) {
    return (
      <div className={`bg-gray-100 p-4 rounded-lg text-center ${className}`}>
        <p className="text-gray-500">No PDF available</p>
      </div>
    );
  }

  return (
    <div className={`max-w-md ${className}`}>
      <div className="flex gap-4 items-center">
        {thumbUrl && (
          <div className="relative group cursor-pointer" onClick={() => setOpen(true)}>
            <img
              src={thumbUrl}
              alt="PDF thumbnail"
              className="w-28 h-36 object-cover rounded-md shadow-sm border border-gray-200"
              onError={(e) => {
                // Fallback if thumbnail can't be generated
                (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='160'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-size='12'>No preview</text></svg>`
                  );
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-md" />
          </div>
        )}

        <div className="flex-1">
          <div className="font-medium text-gray-900">Resume</div>
          <p className="text-sm text-gray-500 mb-3">
            Click to view or download the resume
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              View Resume
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </a>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-medium">Resume Preview</h3>
              <div className="flex gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <iframe
                src={pdfUrl}
                title="Resume Preview"
                className="w-full h-full min-h-[70vh] border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
